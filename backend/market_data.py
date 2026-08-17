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
MASTER_V = 2  # bump to invalidate cached master when parsing changes

# ---- constituent lists (mirror of frontend INDICES) ----
NIFTY50 = ["RELIANCE","TCS","HDFCBANK","INFY","ICICIBANK","SBIN","TATAMOTORS","ITC","LT","AXISBANK","KOTAKBANK","HINDUNILVR","BAJFINANCE","MARUTI","SUNPHARMA","TITAN","ULTRACEMCO","NTPC","POWERGRID","ONGC","TATASTEEL","JSWSTEEL","ADANIENT","HCLTECH","BHARTIARTL","ASIANPAINT","DMART","WIPRO","TECHM","HINDZINC","COALINDIA","BPCL","IOC","HEROMOTOCO","EICHERMOT","BAJAJ-AUTO","TVSMOTOR","CIPLA","DRREDDY","DIVISLAB","APOLLOHOSP","BRITANNIA","NESTLEIND","TATACONSUM","HAVELLS","PIDILITIND","VEDL","HINDALCO","GRASIM","INDUSINDBK"]
SENSEX = ["RELIANCE","TCS","HDFCBANK","INFY","ICICIBANK","SBIN","ITC","LT","AXISBANK","KOTAKBANK","HINDUNILVR","BAJFINANCE","MARUTI","SUNPHARMA","TITAN","ULTRACEMCO","NTPC","POWERGRID","TATASTEEL","JSWSTEEL","HCLTECH","BHARTIARTL","ASIANPAINT","WIPRO","TECHM","HEROMOTOCO","BAJAJ-AUTO","CIPLA","NESTLEIND","INDUSINDBK"]

INDEX_CONFIG = {
    "NIFTY 50":        {"master": "nifty50",        "exch": "NSE", "fallback": "99926000", "stocks": NIFTY50},
    "SENSEX":          {"master": "sensex",         "exch": "BSE", "fallback": "99919000", "stocks": SENSEX},
    "BANK NIFTY":      {"master": "niftybank",      "exch": "NSE", "fallback": "99926009", "stocks": ["HDFCBANK","ICICIBANK","SBIN","AXISBANK","KOTAKBANK","INDUSINDBK","BAJFINANCE"]},
    "NIFTY NEXT 50":   {"master": "niftynext50",    "exch": "NSE", "fallback": None, "stocks": ["DLF","LODHA","HINDZINC","VEDL","HAVELLS","PIDILITIND","DMART","DIVISLAB","TVSMOTOR","TATACONSUM"]},
    "NIFTY MIDCAP 100": {"master": "niftymidcap100", "exch": "NSE", "fallback": None, "stocks": ["HINDZINC","COALINDIA","HAVELLS","PIDILITIND","DLF","LODHA","TVSMOTOR","DIVISLAB"]},
    "NIFTY IT":        {"master": "niftyit",        "exch": "NSE", "fallback": None, "stocks": ["TCS","INFY","HCLTECH","WIPRO","TECHM"]},
    "NIFTY AUTO":      {"master": "niftyauto",      "exch": "NSE", "fallback": None, "stocks": ["TATAMOTORS","MARUTI","HEROMOTOCO","EICHERMOT","BAJAJ-AUTO","TVSMOTOR"]},
    "NIFTY PHARMA":    {"master": "niftypharma",    "exch": "NSE", "fallback": None, "stocks": ["SUNPHARMA","CIPLA","DRREDDY","DIVISLAB","APOLLOHOSP"]},
    "NIFTY FMCG":      {"master": "niftyfmcg",      "exch": "NSE", "fallback": None, "stocks": ["ITC","HINDUNILVR","BRITANNIA","NESTLEIND","TATACONSUM","DMART"]},
    "NIFTY METAL":     {"master": "niftymetal",     "exch": "NSE", "fallback": None, "stocks": ["TATASTEEL","JSWSTEEL","HINDALCO","HINDZINC","VEDL","COALINDIA"]},
    "NIFTY REALTY":    {"master": "niftyrealty",    "exch": "NSE", "fallback": None, "stocks": ["DLF","LODHA"]},
    "NIFTY ENERGY":    {"master": "niftyenergy",    "exch": "NSE", "fallback": None, "stocks": ["RELIANCE","ONGC","BPCL","IOC","NTPC","POWERGRID","COALINDIA"]},
}

ALL_SYMS = sorted({s for cfg in INDEX_CONFIG.values() for s in cfg["stocks"]})
NIFTY_LOT_FALLBACK = 75


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
        self.master_loaded = False
        self.master_error = None
        self.equity = {}        # SYM -> {token, tsym}
        self.index_tokens = {}  # index name -> {token, exch}
        self.options = []       # NFO NIFTY contracts, nearest expiry
        self.opt_expiry = None
        self.lock = threading.Lock()
        self._cache = {}

    # ---------------- auth ----------------
    def login(self):
        smart = SmartConnect(api_key=self.api_key)
        totp = pyotp.TOTP(self.totp_secret).now()
        res = smart.generateSession(self.client_id, self.mpin, totp)
        if not res or not res.get("status"):
            raise RuntimeError(str(res.get("message") if isinstance(res, dict) else res)[:200])
        self.smart = smart
        self.login_error = None
        logger.info("SmartAPI login OK for client %s", self.client_id)

    def _call(self, fn, *args):
        """Invoke an SDK call; on failure re-login once and retry."""
        try:
            return fn(*args)
        except Exception as exc:
            logger.warning("SmartAPI call failed (%s); re-login and retry once", type(exc).__name__)
            try:
                self.login()
            except Exception:
                pass
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
        if seg == "NSE" and itype == "" and sym.endswith("-EQ") and sym[:-3] in ALL_SYMS:
            return True
        if seg == "NFO" and r.get("name") == "NIFTY" and itype == "OPTIDX":
            exp = _parse_expiry(r.get("expiry", ""))
            if exp and exp >= datetime.now(IST).date().isoformat():
                return True
        if seg in ("NSE", "BSE") and itype == "":
            n = _norm(sym)
            return any(cfg["master"] == n for cfg in INDEX_CONFIG.values())
        return False

    def _slim(self, r):
        return {
            "token": str(r.get("token")), "symbol": r.get("symbol"), "name": r.get("name"),
            "expiry": _parse_expiry(r.get("expiry", "")), "strike": float(r.get("strike") or 0) / 100,
            "lotsize": int(float(r.get("lotsize") or 0)), "itype": r.get("instrumenttype", ""),
            "exch": r.get("exch_seg"),
        }

    def _ingest(self, docs):
        self.equity = {d["symbol"][:-3]: {"token": d["token"], "tsym": d["symbol"]}
                       for d in docs if d["exch"] == "NSE" and d["itype"] == "" and d["symbol"].endswith("-EQ")}
        for name, cfg in INDEX_CONFIG.items():
            row = next((d for d in docs if d["itype"] == "" and _norm(d["symbol"]) == cfg["master"]), None)
            token = row["token"] if row else cfg["fallback"]
            if token:
                self.index_tokens[name] = {"token": token, "exch": cfg["exch"]}
        opts = [d for d in docs if d["exch"] == "NFO"]
        if opts:
            self.opt_expiry = min(d["expiry"] for d in opts if d["expiry"])
            self.options = [d for d in opts if d["expiry"] == self.opt_expiry]
        self.master_loaded = True

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
        res = self._call(self.smart.getMarketData, "FULL", exchange_tokens)
        if not res or not res.get("status"):
            raise RuntimeError("getMarketData returned no data")
        return res["data"].get("fetched", [])

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
                out[name] = {"px": f"{ltp:,.2f}", "chg": f"{chg:+.2f}%"}
            return out
        return self._cached("index_quotes", 20, build)

    def stock_quotes(self, syms):
        tokens = [self.equity[s]["token"] for s in syms if s in self.equity]
        if not tokens:
            return []
        fetched = []
        for i in range(0, len(tokens), 40):
            fetched.extend(self._market_data({"NSE": tokens[i:i + 40]}))
        token2sym = {self.equity[s]["token"]: s for s in syms if s in self.equity}
        rows = []
        for q in fetched:
            sym = token2sym.get(str(q.get("symbolToken")))
            if not sym:
                continue
            ltp = float(q.get("ltp") or 0)
            close = float(q.get("close") or ltp or 1)
            chg = (ltp - close) / close * 100 if close else 0
            vol = float(q.get("tradeVolume") or q.get("totalTradedVolume") or 0)
            rows.append({"sym": sym, "ltp": f"{ltp:.2f}", "chgPct": round(chg, 2),
                         "volume": f"{vol / 1e6:.1f}"})
        return rows

    def snapshot(self, index_name):
        cfg = INDEX_CONFIG.get(index_name)
        if not cfg or not self._ready():
            return {"live": False}
        def build():
            quotes = self.index_quotes()
            stocks = self.stock_quotes(cfg["stocks"])
            payload = {"live": True, "ts": datetime.now(IST).isoformat(),
                       "marketOpen": self._market_open(), "indices": quotes}
            if index_name in quotes:
                payload["index"] = quotes[index_name]
            if stocks:
                payload["stocks"] = stocks
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

    def status(self):
        return {
            "configured": bool(self.api_key and self.client_id and self.mpin and self.totp_secret),
            "connected": bool(self.smart),
            "loginError": self.login_error,
            "masterLoaded": self.master_loaded,
            "masterError": self.master_error,
            "equityTokens": len(self.equity),
            "indexTokens": sorted(self.index_tokens),
            "optionContracts": len(self.options),
            "optionExpiry": self.opt_expiry,
            "marketOpen": self._market_open(),
        }


router = APIRouter(prefix="/api/market")
market = None


def init_market():
    global market
    market = SmartMarket()
    threading.Thread(target=market.bootstrap, daemon=True).start()
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


@router.get("/candles")
def market_candles(index: str = Query("NIFTY 50"), range: str = Query("1D")):
    if not market:
        return {"live": False}
    try:
        return market.candles(index, range)
    except Exception as exc:
        logger.warning("candles failed: %s", type(exc).__name__)
        return {"live": False}
