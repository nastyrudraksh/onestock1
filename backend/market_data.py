"""Angel One SmartAPI live market data service (read-only: quotes / option chain / candles).

Credentials and tokens never leave the backend; the browser only receives
normalized JSON snapshots. Falls back gracefully (live=false) so the terminal
can keep showing its simulated demo feed when SmartAPI is unreachable.
"""
import os
import json
import time
import threading
import logging
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import requests
import pyotp
from fastapi import APIRouter, Query
from pymongo import MongoClient
from SmartApi import SmartConnect

logger = logging.getLogger("market_data")

IST = ZoneInfo("Asia/Kolkata")
MASTER_URL = "https://margincalculator.angelone.in/OpenAPI_File/files/OpenAPIScripMaster.json"
MASTER_V = 3  # bump to invalidate cached master when parsing changes

# ---- constituent lists (mirror of frontend INDICES) ----
NIFTY50 = ["RELIANCE","TCS","HDFCBANK","INFY","ICICIBANK","SBIN","TATAMOTORS","ITC","LT","AXISBANK","KOTAKBANK","HINDUNILVR","BAJFINANCE","MARUTI","SUNPHARMA","TITAN","ULTRACEMCO","NTPC","POWERGRID","ONGC","TATASTEEL","JSWSTEEL","ADANIENT","HCLTECH","BHARTIARTL","ASIANPAINT","DMART","WIPRO","TECHM","HINDZINC","COALINDIA","BPCL","IOC","HEROMOTOCO","EICHERMOT","BAJAJ-AUTO","TVSMOTOR","CIPLA","DRREDDY","DIVISLAB","APOLLOHOSP","BRITANNIA","NESTLEIND","TATACONSUM","HAVELLS","PIDILITIND","VEDL","HINDALCO","GRASIM","INDUSINDBK"]
SENSEX = ["RELIANCE","TCS","HDFCBANK","INFY","ICICIBANK","SBIN","ITC","LT","AXISBANK","KOTAKBANK","HINDUNILVR","BAJFINANCE","MARUTI","SUNPHARMA","TITAN","ULTRACEMCO","NTPC","POWERGRID","TATASTEEL","JSWSTEEL","HCLTECH","BHARTIARTL","ASIANPAINT","WIPRO","TECHM","HEROMOTOCO","BAJAJ-AUTO","CIPLA","NESTLEIND","INDUSINDBK"]

INDEX_CONFIG = {
    "NIFTY 50":        {"master": "nifty50",        "exch": "NSE", "fallback": "99926000", "stocks": NIFTY50},
    "SENSEX":          {"master": "sensex",         "exch": "BSE", "fallback": "99919000", "stocks": SENSEX},
    "BANK NIFTY":      {"master": "niftybank",      "exch": "NSE", "fallback": "99926009", "stocks": ["HDFCBANK","ICICIBANK","SBIN","AXISBANK","KOTAKBANK","INDUSINDBK","BAJFINANCE"]},
    "NIFTY NEXT 50":   {"master": "niftynext50",    "exch": "NSE", "fallback": "99926013", "stocks": ["DLF","LODHA","HINDZINC","VEDL","HAVELLS","PIDILITIND","DMART","DIVISLAB","TVSMOTOR","TATACONSUM"]},
    "NIFTY MIDCAP 100": {"master": "niftymidcap100", "exch": "NSE", "fallback": "99926011", "stocks": ["HINDZINC","COALINDIA","HAVELLS","PIDILITIND","DLF","LODHA","TVSMOTOR","DIVISLAB"]},
    "NIFTY IT":        {"master": "niftyit",        "exch": "NSE", "fallback": "99926008", "stocks": ["TCS","INFY","HCLTECH","WIPRO","TECHM"]},
    "NIFTY AUTO":      {"master": "niftyauto",      "exch": "NSE", "fallback": "99926029", "stocks": ["TATAMOTORS","MARUTI","HEROMOTOCO","EICHERMOT","BAJAJ-AUTO","TVSMOTOR"]},
    "NIFTY PHARMA":    {"master": "niftypharma",    "exch": "NSE", "fallback": "99926023", "stocks": ["SUNPHARMA","CIPLA","DRREDDY","DIVISLAB","APOLLOHOSP"]},
    "NIFTY FMCG":      {"master": "niftyfmcg",      "exch": "NSE", "fallback": "99926021", "stocks": ["ITC","HINDUNILVR","BRITANNIA","NESTLEIND","TATACONSUM","DMART"]},
    "NIFTY METAL":     {"master": "niftymetal",     "exch": "NSE", "fallback": "99926030", "stocks": ["TATASTEEL","JSWSTEEL","HINDALCO","HINDZINC","VEDL","COALINDIA"]},
    "NIFTY REALTY":    {"master": "niftyrealty",    "exch": "NSE", "fallback": "99926018", "stocks": ["DLF","LODHA"]},
    "NIFTY ENERGY":    {"master": "niftyenergy",    "exch": "NSE", "fallback": "99926020", "stocks": ["RELIANCE","ONGC","BPCL","IOC","NTPC","POWERGRID","COALINDIA"]},
}

# extra index underlyings used only by the instruments (signals) panel
EXTRA_INDICES = {
    "FINNIFTY":   {"master": "niftyfinservice", "exch": "NSE", "fallback": "99926037"},
    "MIDCPNIFTY": {"master": "niftymidselect",  "exch": "NSE", "fallback": "99926074"},
}

# renamed tickers -> current NSE symbol (corporate actions)
SYMBOL_ALIAS = {"TATAMOTORS": "TMPV"}

ALL_SYMS = sorted({s for cfg in INDEX_CONFIG.values() for s in cfg["stocks"]})
NIFTY_LOT_FALLBACK = 75


# signals panel display name -> source: index quote / NFO index future / MCX commodity future
INSTRUMENT_SOURCES = {
    "NIFTY 50 OPTION": ("index", "NIFTY 50"),
    "NIFTY 50 FUTURE": ("fut", "NIFTY"),
    "BANK NIFTY OPTION": ("index", "BANK NIFTY"),
    "BANK NIFTY FUTURE": ("fut", "BANKNIFTY"),
    "SENSEX": ("index", "SENSEX"),
    "SENSEX FUTURE": ("index", "SENSEX"),
    "FINNIFTY OPTION": ("index", "FINNIFTY"),
    "FINNIFTY FUTURE": ("fut", "FINNIFTY"),
    "MIDCAP": ("index", "MIDCPNIFTY"),
    "MIDCAP FUTURE": ("fut", "MIDCPNIFTY"),
    "SILVER OPTION": ("mcx", "SILVER"),
    "SILVER FUTURE": ("mcx", "SILVER"),
    "GOLD OPTION": ("mcx", "GOLD"),
    "GOLD FUTURE": ("mcx", "GOLD"),
}


def _norm(s):
    return "".join(ch for ch in str(s).lower() if ch.isalnum())


def _parse_expiry(raw):
    for fmt in ("%d%b%Y", "%d%b%y"):
        try:
            return datetime.strptime(raw.strip().upper(), fmt).date().isoformat()
        except (ValueError, AttributeError):
            continue
    return None


class SmartMarket:
    def __init__(self):
        sync = MongoClient(os.environ["MONGO_URL"])
        self.db = sync[os.environ["DB_NAME"]]
        self.api_key = os.environ.get("SMARTAPI_API_KEY")
        self.client_id = os.environ.get("SMARTAPI_CLIENT_ID")
        self.mpin = os.environ.get("SMARTAPI_MPIN")
        self.totp_secret = os.environ.get("SMARTAPI_TOTP_SECRET")
        self.smart = None
        self.login_error = None
        self.session_ok = False
        self.session_reason = "not_configured"
        self.master_loaded = False
        self.master_error = None
        self.last_login_attempt = None
        self.equity = {}        # SYM -> {token, tsym}
        self.index_tokens = {}  # index name -> {token, exch}
        self.options = []       # NFO NIFTY contracts, nearest expiry
        self.opt_expiry = None
        self.futures = {}       # (name, exch) -> nearest-expiry FUT contract doc
        self.lock = threading.Lock()
        self._cache = {}
        self.jwt_token = None
        self.feed_token = None
        self.ws_connected = False
        self._ws_ticks = 0

    # ---------------- auth ----------------
    def _reason_from_error(self, exc):
        msg = str(exc or "").lower()
        if not self.api_key or not self.client_id or not self.mpin or not self.totp_secret:
            return "credentials_missing"
        if "session" in msg or "token" in msg or "expired" in msg or "login" in msg:
            return "session_expired"
        if "auth" in msg or "credential" in msg or "unauthorized" in msg:
            return "auth_failed"
        return "api_error"

    def login(self):
        if not all([self.api_key, self.client_id, self.mpin, self.totp_secret]):
            self.session_ok = False
            self.session_reason = "credentials_missing"
            self.login_error = "SmartAPI credentials are incomplete"
            raise RuntimeError(self.login_error)

        smart = SmartConnect(api_key=self.api_key)
        totp = pyotp.TOTP(self.totp_secret).now()
        res = smart.generateSession(self.client_id, self.mpin, totp)
        if not res or not res.get("status"):
            msg = str(res.get("message") if isinstance(res, dict) else res)[:200]
            self.session_ok = False
            self.session_reason = self._reason_from_error(msg)
            self.login_error = msg or "SmartAPI session generation failed"
            raise RuntimeError(self.login_error)
        self.smart = smart
        data = res.get("data") or {}
        self.jwt_token = data.get("jwtToken")
        self.feed_token = data.get("feedToken")
        self.session_ok = True
        self.session_reason = "ok"
        self.login_error = None
        self.last_login_attempt = datetime.now(IST)
        logger.info("SmartAPI login OK for client %s", self.client_id)

    def _call(self, fn, *args):
        """Invoke an SDK call; on failure re-login once and retry."""
        try:
            return fn(*args)
        except Exception as exc:
            logger.warning("SmartAPI call failed (%s); re-login and retry once", type(exc).__name__)
            try:
                self.login()
            except Exception as relogin_exc:
                self.session_ok = False
                self.session_reason = self._reason_from_error(relogin_exc)
                self.login_error = str(relogin_exc)[:200]
                logger.warning("SmartAPI re-login failed: %s", self.login_error)
                raise
            return fn(*args)

    def bootstrap(self):
        try:
            self.login()
        except Exception as exc:
            self.login_error = str(exc)[:200]
            logger.error("SmartAPI login failed: %s", self.login_error)
            return
        try:
            self.load_master()
        except Exception as exc:
            self.master_error = str(exc)[:200]
            logger.error("Instrument master load failed: %s", self.master_error)

    # ---------------- instrument master ----------------
    def load_master(self):
        today = datetime.now(IST).date().isoformat()
        meta = self.db.smartapi_master.find_one({"_id": "meta"})
        if meta and meta.get("day") == today and meta.get("v") == MASTER_V:
            docs = list(self.db.smartapi_master.find({"_id": {"$ne": "meta"}}))
            self._ingest(docs)
            logger.info("Instrument master loaded from Mongo cache (%d docs)", len(docs))
            return
        logger.info("Downloading SmartAPI instrument master ...")
        resp = requests.get(MASTER_URL, timeout=180)
        resp.raise_for_status()
        rows = resp.json()
        wanted = [self._slim(r) for r in rows if self._wanted(r)]
        self.db.smartapi_master.delete_many({})
        self.db.smartapi_master.insert_many([{"_id": "meta", "day": today, "v": MASTER_V}] + wanted)
        self._ingest(wanted)
        self.master_loaded = True
        logger.info("Instrument master downloaded: %d relevant of %d rows", len(wanted), len(rows))

    def _wanted(self, r):
        seg = r.get("exch_seg")
        itype = r.get("instrumenttype", "")
        sym = r.get("symbol", "")
        today = datetime.now(IST).date().isoformat()
        if seg == "NSE" and itype == "" and sym.endswith("-EQ") and (sym[:-3] in ALL_SYMS or sym[:-3] in SYMBOL_ALIAS.values()):
            return True
        if seg == "NFO" and r.get("name") == "NIFTY" and itype == "OPTIDX":
            exp = _parse_expiry(r.get("expiry", ""))
            if exp and exp >= today:
                return True
        if seg == "NFO" and itype == "FUTIDX" and r.get("name") in ("NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"):
            exp = _parse_expiry(r.get("expiry", ""))
            if exp and exp >= today:
                return True
        if seg == "MCX" and itype == "FUTCOM" and r.get("name") in ("GOLD", "SILVER", "CRUDEOIL"):
            exp = _parse_expiry(r.get("expiry", ""))
            if exp and exp >= today:
                return True
        if itype == "AMXIDX" and seg in ("NSE", "BSE"):
            n = _norm(sym)
            names = [cfg["master"] for cfg in INDEX_CONFIG.values()] + [c["master"] for c in EXTRA_INDICES.values()]
            return n in names
        return False

    def _slim(self, r):
        return {
            "token": str(r.get("token")), "symbol": r.get("symbol"), "name": r.get("name"),
            "expiry": _parse_expiry(r.get("expiry", "")), "strike": float(r.get("strike") or 0) / 100,
            "lotsize": int(float(r.get("lotsize") or 0)), "itype": r.get("instrumenttype", ""),
            "exch": r.get("exch_seg"),
        }

    def _ingest(self, docs):
        # Build robust symbol mapping: match normalized master names to our expected ALL_SYMS
        def match_sym_from_doc_symbol(sym):
            base = sym[:-3] if sym.endswith("-EQ") else sym
            cand = _norm(base)
            # direct exact match
            for s in ALL_SYMS:
                if _norm(s) == cand:
                    return s
            # starts/contains heuristics
            for s in ALL_SYMS:
                ns = _norm(s)
                if cand.startswith(ns) or ns.startswith(cand) or ns in cand or cand in ns:
                    return s
            return base

        self.equity = {}
        for d in docs:
            try:
                if d.get("exch") == "NSE" and d.get("itype") == "" and d.get("symbol", "").endswith("-EQ"):
                    mapped = match_sym_from_doc_symbol(d["symbol"])
                    self.equity[mapped] = {"token": d["token"], "tsym": d["symbol"]}
            except Exception:
                continue
        idx_cfg = dict(INDEX_CONFIG)
        idx_cfg.update(EXTRA_INDICES)
        for name, cfg in idx_cfg.items():
            # index rows carry instrumenttype AMXIDX; fall back to hardcoded token
            row = next((d for d in docs if d.get("itype") == "AMXIDX" and (_norm(d.get("symbol")) == cfg["master"] or _norm(d.get("name")) == cfg["master"])), None)
            token = row["token"] if row else cfg["fallback"]
            if token:
                self.index_tokens[name] = {"token": token, "exch": cfg["exch"]}
        opts = [d for d in docs if d["exch"] == "NFO" and d.get("itype") == "OPTIDX"]
        if opts:
            self.opt_expiry = min(d["expiry"] for d in opts if d["expiry"])
            self.options = [d for d in opts if d["expiry"] == self.opt_expiry]
        for d in docs:
            if d.get("itype") in ("FUTIDX", "FUTCOM") and d.get("expiry"):
                key = (d["name"], d["exch"])
                if key not in self.futures or d["expiry"] < self.futures[key]["expiry"]:
                    self.futures[key] = d
        self.master_loaded = True

    # ---------------- streaming (polling-backed) ----------------
    def start_streaming(self):
        """Background poller that keeps the latest market ticks in memory.
        This is a pragmatic substitute for direct websocket streaming: polls SmartAPI every 4s and caches by token.
        """
        if hasattr(self, "_stream_thread") and getattr(self, "_stream_thread"):
            return
        self._stream_cache = {}  # token -> last quote dict
        self._stream_thread = threading.Thread(target=self._stream_loop, daemon=True)
        self._stream_thread.start()

    # ---------------- websocket (SDK-backed) ----------------
    def _ws_message_handler(self, msg):
        """Common handler for websocket messages from SmartAPI SDK.
        Expected to receive dict-like payloads; normalize and store by token.
        """
        try:
            if not msg:
                return
            # SDK may deliver JSON strings or dicts
            data = msg if isinstance(msg, dict) else (json.loads(msg) if isinstance(msg, str) else None)
            if not data:
                return
            # SmartAPI websocket messages commonly contain a 'data' or 'fetched' field
            payloads = None
            if isinstance(data, dict) and data.get("data"):
                dd = data.get("data")
                if isinstance(dd, dict) and dd.get("fetched"):
                    payloads = dd.get("fetched")
                elif isinstance(dd, list):
                    payloads = dd
            elif isinstance(data, dict) and data.get("fetched"):
                payloads = data.get("fetched")
            if not payloads:
                # maybe data itself is a quote dict
                payloads = [data]
            for q in payloads:
                tok = str(q.get("symbolToken") or q.get("token") or q.get("symbolTokenString"))
                if not tok:
                    continue
                with self.lock:
                    self._stream_cache[str(tok)] = q
        except Exception as exc:
            logger.debug("ws msg handler error: %s", exc)

    def _ws_tokens_payload(self):
        exch_map = {"NSE": 1, "NFO": 2, "BSE": 3, "BFO": 4, "MCX": 5}
        groups = {}
        for t in self.index_tokens.values():
            groups.setdefault(exch_map.get(t["exch"], 1), []).append(str(t["token"]))
        for info in self.equity.values():
            groups.setdefault(1, []).append(str(info["token"]))
        for (name, exch), d in self.futures.items():
            groups.setdefault(exch_map.get(exch, 1), []).append(str(d["token"]))
        for o in self.options:
            groups.setdefault(2, []).append(str(o["token"]))
        return [{"exchangeType": k, "tokens": v} for k, v in groups.items()]

    def _on_ws_tick(self, msg):
        """Normalize a SmartWebSocketV2 SnapQuote tick into REST-quote shape and cache it."""
        try:
            if not isinstance(msg, dict):
                return
            tok = str(msg.get("token") or "")
            if not tok:
                return
            def p(key):
                v = msg.get(key)
                return (v / 100.0) if isinstance(v, (int, float)) else 0
            fresh = {
                "symbolToken": tok,
                "ltp": p("last_traded_price"),
                "open": p("open_price_of_the_day"),
                "high": p("high_price_of_the_day"),
                "low": p("low_price_of_the_day"),
                "close": p("closed_price"),
                "tradeVolume": msg.get("volume_trade_for_the_day") or msg.get("total_traded_volume") or 0,
                "opnInterest": msg.get("open_interest") or 0,
                "52WeekHigh": p("52_week_high_price"),
                "52WeekLow": p("52_week_low_price"),
                "_ts": time.time(),
            }
            with self.lock:
                prev = self._stream_cache.get(tok, {})
                merged = dict(prev)
                for k, v in fresh.items():
                    if v or k in ("_ts", "symbolToken"):
                        merged[k] = v
                self._stream_cache[tok] = merged
        except Exception:
            pass

    def start_websocket(self):
        """Real SmartAPI push feed (SmartWebSocketV2, SnapQuote mode). Self-reconnecting;
        falls back to the REST poller if the feed cannot be established."""
        if getattr(self, "_ws_started", False):
            return
        if not self._ready():
            raise RuntimeError("SmartAPI not ready for websocket")
        from SmartApi.smartWebSocketV2 import SmartWebSocketV2

        def _run():
            backoff = 5
            failures = 0
            while True:
                try:
                    sws = SmartWebSocketV2(self.jwt_token, self.api_key, self.client_id, self.feed_token)

                    def on_open(ws):
                        self.ws_connected = True
                        payload = self._ws_tokens_payload()
                        logger.info("SmartWebSocketV2 connected; subscribing %d token groups", len(payload))
                        sws.subscribe("terminal", 3, payload)

                    def on_data(ws, msg):
                        self._ws_ticks += 1
                        if self._ws_ticks <= 2:
                            logger.info("ws raw msg FULL: %s", str(msg)[:900])
                        self._on_ws_tick(msg)

                    def on_error(ws, err):
                        logger.warning("ws error: %s", str(err)[:150])

                    def on_close(ws, *args):
                        self.ws_connected = False
                        logger.warning("SmartWebSocketV2 closed")

                    sws.on_open = on_open
                    sws.on_data = on_data
                    sws.on_error = on_error
                    sws.on_close = on_close
                    sws.connect()  # blocks until the socket dies
                    self.ws_connected = False
                    failures += 1
                except Exception as exc:
                    self.ws_connected = False
                    failures += 1
                    logger.warning("ws run failed (%s); retry in %ds", type(exc).__name__, backoff)
                if failures >= 3:
                    try:
                        self.start_streaming()  # REST poller fallback (guarded, no double-start)
                    except Exception:
                        pass
                time.sleep(backoff)
                backoff = min(60, backoff * 2)

        self._ws_started = True
        self._ws_thread = threading.Thread(target=_run, daemon=True)
        self._ws_thread.start()

    def _stream_loop(self):
        logger.info("Starting market poller thread")
        while True:
            try:
                if not self._ready():
                    time.sleep(3)
                    continue
                if self.ws_connected:
                    time.sleep(10)  # websocket push is feeding the cache; poller idles to save rate limits
                    continue
                # gather tokens to poll: index tokens + equity tokens + option tokens
                by_exch = {}
                # index tokens
                for name, t in self.index_tokens.items():
                    by_exch.setdefault(t["exch"], set()).add(str(t["token"]))
                # equity tokens
                for sym, info in self.equity.items():
                    by_exch.setdefault("NSE", set()).add(str(info["token"]))
                # options (NFO)
                if self.options:
                    for o in self.options:
                        by_exch.setdefault("NFO", set()).add(str(o["token"]))
                # convert sets to lists
                for k in list(by_exch.keys()):
                    by_exch[k] = list(by_exch[k])
                if not by_exch:
                    time.sleep(4)
                    continue
                fetched = self._call(self.smart.getMarketData, "FULL", by_exch)
                if fetched and isinstance(fetched, dict) and fetched.get("status"):
                    data = fetched.get("data", {}).get("fetched", [])
                else:
                    data = ((fetched or {}).get("data") or {}).get("fetched", []) if isinstance(fetched, dict) else fetched or []
                # normalize data to list of quote dicts
                for q in data:
                    try:
                        tok = str(q.get("symbolToken") or q.get("symbolTokenString") or q.get("token"))
                        if tok:
                            with self.lock:
                                self._stream_cache[tok] = {**q, "_ts": time.time()}
                    except Exception:
                        continue
            except Exception as exc:
                logger.exception("Stream loop error: %s", exc)
            time.sleep(4)

    # ---------------- helpers ----------------
    def _cached(self, key, ttl, builder):
        now = time.time()
        hit = self._cache.get(key)
        if hit and hit[0] > now:
            return hit[1]
        payload = builder()
        self._cache[key] = (now + ttl, payload)
        return payload

    def _market_open(self):
        n = datetime.now(IST)
        return n.weekday() < 5 and (9, 15) <= (n.hour, n.minute) <= (15, 30)

    def _ready(self):
        return bool(self.smart) and self.master_loaded

    def _market_data(self, exchange_tokens):
        # Serve from the streaming cache (websocket/poller) only when it covers every
        # requested token with fresh data; otherwise fall through to a direct REST call.
        try:
            if hasattr(self, "_stream_cache") and self._stream_cache:
                out = []
                total = 0
                stale_ok = not self._market_open()
                for exch, toks in (exchange_tokens or {}).items():
                    for t in toks:
                        total += 1
                        tok = str(t)
                        with self.lock:
                            q = self._stream_cache.get(tok)
                        if q and (stale_ok or time.time() - q.get("_ts", 0) < 20):
                            out.append(q)
                if total and len(out) == total:
                    return out
        except Exception:
            pass
        # fallback to direct API call
        res = self._call(self.smart.getMarketData, "FULL", exchange_tokens)
        if not res or not res.get("status"):
            raise RuntimeError("getMarketData returned no data")
        return (res.get("data") or {}).get("fetched", [])

    # ---------------- snapshots ----------------
    def index_quotes(self):
        def build():
            by_exch = {}
            for name, t in self.index_tokens.items():
                by_exch.setdefault(t["exch"], []).append(t["token"])
            fetched = self._market_data(by_exch)
            token2name = {t["token"]: n for n, t in self.index_tokens.items()}
            out = {}
            for q in fetched:
                name = token2name.get(str(q.get("symbolToken")))
                if not name:
                    continue
                ltp = float(q.get("ltp") or 0)
                close = float(q.get("close") or ltp or 1)
                chg = (ltp - close) / close * 100 if close else 0
                out[name] = {"px": f"{ltp:,.2f}", "chg": f"{chg:+.2f}%",
                             "open": f"{float(q.get('open') or 0):,.2f}",
                             "high": f"{float(q.get('high') or 0):,.2f}",
                             "low": f"{float(q.get('low') or 0):,.2f}"}
            return out
        return self._cached("index_quotes", 20, build)

    def stock_quotes(self, syms):
        resolved = {s: SYMBOL_ALIAS.get(s, s) for s in syms}
        resolved = {orig: eff for orig, eff in resolved.items() if eff in self.equity}
        if not resolved:
            return {"rows": [], "volM": 0.0, "turnoverCr": 0.0}
        tokens = [self.equity[eff]["token"] for eff in resolved.values()]
        fetched = []
        for i in range(0, len(tokens), 40):
            fetched.extend(self._market_data({"NSE": tokens[i:i + 40]}))
        token2sym = {self.equity[eff]["token"]: orig for orig, eff in resolved.items()}
        rows = []
        vol_sum = 0.0
        turn_sum = 0.0
        for q in fetched:
            sym = token2sym.get(str(q.get("symbolToken")))
            if not sym:
                continue
            ltp = float(q.get("ltp") or 0)
            close = float(q.get("close") or ltp or 1)
            chg = (ltp - close) / close * 100 if close else 0
            vol = float(q.get("tradeVolume") or q.get("totalTradedVolume") or 0)
            vol_sum += vol
            turn_sum += ltp * vol
            rows.append({"sym": sym, "ltp": f"{ltp:.2f}", "chgPct": round(chg, 2),
                         "volume": f"{vol / 1e6:.1f}",
                         "open": float(q.get("open") or 0), "high": float(q.get("high") or 0),
                         "low": float(q.get("low") or 0),
                         "high52": float(q.get("52WeekHigh") or 0), "low52": float(q.get("52WeekLow") or 0)})
        return {"rows": rows, "volM": vol_sum / 1e6, "turnoverCr": turn_sum / 1e7}

    def snapshot(self, index_name):
        cfg = INDEX_CONFIG.get(index_name)
        if not cfg or not self._ready():
            return {"live": False}
        def build():
            quotes = self.index_quotes()
            agg = self.stock_quotes(cfg["stocks"])
            payload = {"live": True, "ts": datetime.now(IST).isoformat(),
                       "marketOpen": self._market_open(), "indices": quotes}
            if index_name in quotes:
                payload["index"] = quotes[index_name]
            if agg["rows"]:
                payload["stocks"] = agg["rows"]
                payload["totalVolume"] = round(agg["volM"], 1)
                payload["totalValue"] = f"{agg['turnoverCr']:,.0f}"
            chain = self.option_chain_safe()
            if chain:
                payload["oiChain"] = chain
            return payload
        ttl = 4 if self._market_open() else 60
        return self._cached(f"snap-{index_name}", ttl, build)

    # ---------------- option chain ----------------
    def option_chain_safe(self):
        try:
            return self._cached("oi-chain", 15, self._build_chain)
        except Exception as exc:
            logger.warning("option chain failed: %s", type(exc).__name__)
            return None

    def _build_chain(self):
        nifty = self.index_tokens.get("NIFTY 50")
        if not nifty or not self.options:
            return None
        q = self._market_data({nifty["exch"]: [nifty["token"]]})
        spot = float(q[0].get("ltp") or 0) if q else 0
        if not spot:
            return None
        lo, hi = spot - 700, spot + 700
        contracts = [c for c in self.options if lo <= c["strike"] <= hi]
        if not contracts:
            return None
        by_token = {c["token"]: c for c in contracts}
        tokens = list(by_token)
        fetched = []
        for i in range(0, len(tokens), 40):
            fetched.extend(self._market_data({"NFO": tokens[i:i + 40]}))
        rows = {}
        for qd in fetched:
            c = by_token.get(str(qd.get("symbolToken")))
            if not c:
                continue
            strike = int(c["strike"])
            row = rows.setdefault(strike, {"strike": strike, "callOi": 0.0, "putOi": 0.0,
                                           "callChg": 0, "putChg": 0, "iv": None})
            lot = c["lotsize"] or NIFTY_LOT_FALLBACK
            oi_l = round(float(qd.get("opnInterest") or 0) * lot / 100000, 1)
            ltp = float(qd.get("ltp") or 0)
            close = float(qd.get("close") or ltp or 1)
            chg = int(round((ltp - close) / close * 100)) if close else 0
            chg = max(-500, min(500, chg))
            if c["symbol"].endswith("CE"):
                row["callOi"], row["callChg"] = oi_l, chg
            elif c["symbol"].endswith("PE"):
                row["putOi"], row["putChg"] = oi_l, chg
        out = [rows[k] for k in sorted(rows)]
        exp = datetime.fromisoformat(self.opt_expiry).strftime("%d %b %Y")
        return {"spot": round(spot, 2), "expiry": exp, "rows": out}

    # ---------------- candles ----------------
    def candles(self, index_name, rng):
        if not self._ready():
            return {"live": False}
        t = self.index_tokens.get(index_name)
        if not t:
            return {"live": False}
        def build():
            now = datetime.now(IST)
            if rng == "1D":
                interval, start = "FIVE_MINUTE", now.replace(hour=9, minute=15, second=0)
            elif rng == "5D":
                interval, start = "THIRTY_MINUTE", now - timedelta(days=7)
            else:
                days = {"1M": 32, "3M": 95, "6M": 190, "1Y": 370}.get(rng, 32)
                interval, start = "ONE_DAY", now - timedelta(days=days)
            params = {"exchange": t["exch"], "symboltoken": t["token"], "interval": interval,
                      "fromdate": start.strftime("%Y-%m-%d %H:%M"), "todate": now.strftime("%Y-%m-%d %H:%M")}
            res = self._call(self.smart.getCandleData, params)
            raw = (res or {}).get("data") or []
            pts = []
            for ts, o, h, l, c, v in raw:
                dt = datetime.fromisoformat(str(ts))
                label = dt.strftime("%H:%M") if rng in ("1D", "5D") else dt.strftime("%d %b")
                pts.append({"t": label, "v": round(float(c), 2), "vol": round(float(v) / 1e6, 1)})
            return {"live": bool(pts), "points": pts}
        return self._cached(f"candles-{index_name}-{rng}", 60, build)

    def instruments(self):
        """Real quotes for the signals panel instrument list (index/option rows use the
        underlying index or nearest future; MCX rows skipped gracefully if segment disabled)."""
        if not self._ready():
            return {"live": False}
        def build():
            reqs = {}
            token_names = {}
            for name, (kind, ref) in INSTRUMENT_SOURCES.items():
                if kind == "index":
                    t = self.index_tokens.get(ref)
                else:
                    exch = "NFO" if kind == "fut" else "MCX"
                    d = self.futures.get((ref, exch))
                    t = {"token": d["token"], "exch": d["exch"]} if d else None
                if not t:
                    continue
                reqs.setdefault(t["exch"], []).append(t["token"])
                token_names.setdefault(t["token"], []).append(name)
            if not reqs:
                return {"live": False}
            fetched = []
            mcx_tokens = reqs.pop("MCX", None)
            if reqs:
                fetched.extend(self._market_data(reqs))
            if mcx_tokens:
                try:
                    fetched.extend(self._market_data({"MCX": mcx_tokens}))
                except Exception:
                    logger.info("MCX quotes unavailable (commodity segment not enabled?)")
            out = {}
            for q in fetched:
                names = token_names.get(str(q.get("symbolToken")))
                if not names:
                    continue
                ltp = float(q.get("ltp") or 0)
                close = float(q.get("close") or ltp or 1)
                chg = (ltp - close) / close * 100 if close else 0
                for n in names:
                    out[n] = {"px": f"{ltp:,.2f}", "chg": f"{chg:+.2f}%"}
            return {"live": bool(out), "quotes": out}
        return self._cached("instruments", 5, build)

    def status(self):
        configured = bool(self.api_key and self.client_id and self.mpin and self.totp_secret)
        live = bool(self.smart and self.master_loaded and self.session_ok)
        return {
            "configured": configured,
            "connected": bool(self.smart),
            "live": live,
            "reason": self.session_reason if not live else "ok",
            "loginError": self.login_error,
            "masterLoaded": self.master_loaded,
            "masterError": self.master_error,
            "equityTokens": len(self.equity),
            "indexTokens": sorted(self.index_tokens),
            "optionContracts": len(self.options),
            "optionExpiry": self.opt_expiry,
            "marketOpen": self._market_open(),
            "ws": {"connected": self.ws_connected, "ticks": self._ws_ticks},
        }


router = APIRouter(prefix="/api/market")
market = None


def init_market():
    global market
    market = SmartMarket()
    threading.Thread(target=market.bootstrap, daemon=True).start()
    # start a helper thread which will activate the streaming poller once master is loaded
    def _kick_stream():
        # wait until bootstrap completes master load or login attempt
        for _ in range(0, 60):
            try:
                if market and getattr(market, "master_loaded", False) and getattr(market, "smart", None):
                    # try websocket first, then fallback to poller
                    try:
                        market.start_websocket()
                        logger.info("Started websocket via SDK")
                        return
                    except Exception:
                        try:
                            market.start_streaming()
                            logger.info("Websocket not available; started poller fallback")
                        except Exception:
                            logger.exception("Failed to start poller fallback")
                        return
            except Exception:
                pass
            time.sleep(1)
        # fallback: try to start streaming anyway
        try:
            if market:
                market.start_streaming()
        except Exception:
            pass

    threading.Thread(target=_kick_stream, daemon=True).start()
    return market


@router.get("/status")
def market_status():
    return market.status() if market else {"configured": False}


@router.get("/snapshot")
def market_snapshot(index: str = Query("NIFTY 50")):
    if not market:
        return {"live": False}
    try:
        return market.snapshot(index)
    except Exception as exc:
        logger.warning("snapshot failed: %s", type(exc).__name__)
        return {"live": False}


@router.get("/option-chain")
def market_option_chain():
    if not market or not market._ready():
        return {"live": False}
    chain = market.option_chain_safe()
    return {"live": bool(chain), **({"chain": chain} if chain else {})}


@router.get("/instruments")
def market_instruments():
    if not market:
        return {"live": False}
    try:
        return market.instruments()
    except Exception as exc:
        logger.warning("instruments failed: %s", type(exc).__name__)
        return {"live": False}


@router.get("/candles")
def market_candles(index: str = Query("NIFTY 50"), range: str = Query("1D")):
    if not market:
        return {"live": False}
    try:
        return market.candles(index, range)
    except Exception as exc:
        logger.warning("candles failed: %s", type(exc).__name__)
        return {"live": False}
