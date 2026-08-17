"""FII/DII daily institutional flows from NSE's public report (free, no key).

Tries NSE's fiidiiTradeReact JSON endpoint with a browser-like session,
falls back to scraping MoneyControl's FII/DII page. Each trading day's numbers
are upserted into Mongo (fiidii_daily) so Today vs Yesterday columns and
weekly aggregates accumulate real history over time.
"""
import os
import time
import logging
from datetime import datetime
from zoneinfo import ZoneInfo

import requests
from fastapi import APIRouter
from pymongo import MongoClient

logger = logging.getLogger("fiidii")
IST = ZoneInfo("Asia/Kolkata")

NSE_URL = "https://www.nseindia.com/api/fiidiiTradeReact"
NSE_HOME = "https://www.nseindia.com/"
MC_URL = "https://www.moneycontrol.com/stocks/marketstats/fii_dii_activity/index.php"

BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.nseindia.com/reports/fii-dii",
}

_cache = {"at": 0.0, "payload": None}
CACHE_TTL = 1800  # 30 min — NSE updates once per day (evening)


def _num(v):
    try:
        return float(str(v).replace(",", "").strip())
    except (ValueError, TypeError):
        return None


def _from_nse():
    sess = requests.Session()
    sess.get(NSE_HOME, headers={**BROWSER_HEADERS, "Accept": "text/html"}, timeout=15)
    res = sess.get(NSE_URL, headers=BROWSER_HEADERS, timeout=15)
    res.raise_for_status()
    rows = res.json()
    out = {}
    date = None
    for r in rows if isinstance(rows, list) else []:
        cat = str(r.get("category", "")).upper()
        date = date or r.get("date")
        entry = {"buy": _num(r.get("buyValue")), "sell": _num(r.get("sellValue")), "net": _num(r.get("netValue"))}
        if cat.startswith("FII") or cat.startswith("FPI"):
            out["fii"] = entry
        elif cat.startswith("DII"):
            out["dii"] = entry
    if "fii" not in out or "dii" not in out or out["fii"]["net"] is None:
        raise RuntimeError("unexpected NSE payload shape")
    # NSE date format "17-Aug-2026"
    day = datetime.strptime(date.strip(), "%d-%b-%Y").date().isoformat()
    return day, out


def _from_moneycontrol():
    import re
    res = requests.get(MC_URL, headers={**BROWSER_HEADERS, "Accept": "text/html"}, timeout=15)
    res.raise_for_status()
    html = res.text
    out = {}
    day = None
    # rows like: <td>FII Cash</td><td>17-Aug-2026</td><td>4820.10</td><td>3910.20</td><td>909.90</td>
    for m in re.finditer(r"(FII|DII)\s*Cash</t[dh]>\s*<t[dh][^>]*>([\d]{2}-[A-Za-z]{3}-[\d]{4})</t[dh]>\s*<t[dh][^>]*>([\d,.\-]+)</t[dh]>\s*<t[dh][^>]*>([\d,.\-]+)</t[dh]>\s*<t[dh][^>]*>([\-?\d,\.]+)", html):
        who = m.group(1).lower()
        day = day or datetime.strptime(m.group(2), "%d-%b-%Y").date().isoformat()
        out[who] = {"buy": _num(m.group(3)), "sell": _num(m.group(4)), "net": _num(m.group(5))}
    if "fii" not in out or "dii" not in out or not day:
        raise RuntimeError("moneycontrol parse failed")
    return day, out


def _fetch(db):
    last_err = None
    for source in (_from_nse, _from_moneycontrol):
        try:
            day, data = source()
            db.fiidii_daily.update_one(
                {"_id": day},
                {"$set": {"fii": data["fii"], "dii": data["dii"], "fetchedAt": datetime.now(IST).isoformat()}},
                upsert=True,
            )
            logger.info("FII/DII updated via %s for %s", source.__name__, day)
            return day, data, source.__name__
        except Exception as exc:
            last_err = exc
            logger.warning("FII/DII source %s failed: %s", source.__name__, type(exc).__name__)
    raise RuntimeError(f"all sources failed: {last_err}")


def get_fiidii(db):
    now = time.time()
    if _cache["payload"] and now - _cache["at"] < CACHE_TTL:
        return _cache["payload"]
    try:
        day, data, source = _fetch(db)
    except Exception:
        # serve latest stored history if a refresh fails
        docs = list(db.fiidii_daily.find({}).sort("_id", -1).limit(2))
        if not docs:
            return {"live": False}
        payload = _payload_from_docs(docs, "cache")
        _cache.update(at=now, payload=payload)
        return payload
    docs = list(db.fiidii_daily.find({}).sort("_id", -1).limit(2))
    payload = _payload_from_docs(docs, source)
    _cache.update(at=now, payload=payload)
    return payload


def _payload_from_docs(docs, source):
    if not docs:
        return {"live": False}
    today = docs[0]
    prev = docs[1] if len(docs) > 1 else None
    return {
        "live": True,
        "date": today["_id"],
        "prevDate": prev["_id"] if prev else None,
        "fii": today["fii"],
        "dii": today["dii"],
        "prevFii": prev["fii"] if prev else None,
        "prevDii": prev["dii"] if prev else None,
        "source": source,
    }


router = APIRouter(prefix="/api/market")
_db = None


def init_fiidii():
    global _db
    sync = MongoClient(os.environ["MONGO_URL"])
    _db = sync[os.environ["DB_NAME"]]


@router.get("/fiidii")
def fiidii_endpoint():
    if _db is None:
        return {"live": False}
    try:
        return get_fiidii(_db)
    except Exception as exc:
        logger.warning("fiidii endpoint failed: %s", type(exc).__name__)
        return {"live": False}
