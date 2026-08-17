"""Backend tests for live Angel One SmartAPI market data endpoints."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback: read from frontend/.env
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
    except Exception:
        pass

API = f"{BASE_URL}/api"


def _num(v):
    if isinstance(v, (int, float)):
        return float(v)
    return float(str(v).replace(",", ""))


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def test_market_status(client):
    r = client.get(f"{API}/market/status", timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    print("STATUS:", data)
    assert data.get("configured") is True
    assert data.get("connected") is True
    assert data.get("masterLoaded") is True
    assert data.get("equityTokens", 0) >= 50
    assert data.get("optionContracts", 0) > 0


def test_snapshot_nifty50(client):
    r = client.get(f"{API}/market/snapshot", params={"index": "NIFTY 50"}, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("live") is True, f"not live: {data.get('live')}"
    idx = data.get("index") or {}
    assert idx.get("px") is not None
    # Broadened range for safety
    assert 20000 < _num(idx["px"]) < 30000, f"unexpected NIFTY px: {idx['px']}"
    stocks = data.get("stocks") or []
    assert len(stocks) >= 45, f"stocks count {len(stocks)}"
    for s in stocks[:3]:
        assert "ltp" in s and "chgPct" in s
    indices = data.get("indices") or {}
    for k in ["NIFTY 50", "SENSEX", "BANK NIFTY"]:
        assert k in indices, f"missing index {k}"
    oi = data.get("oiChain") or {}
    assert oi.get("spot") is not None
    assert oi.get("expiry")
    rows = oi.get("rows") or []
    assert len(rows) >= 20, f"oi rows {len(rows)}"
    strikes = [r["strike"] for r in rows]
    assert strikes == sorted(strikes), "strikes not ascending"
    for row in rows[:3]:
        for k in ["strike", "callOi", "putOi", "callChg", "putChg"]:
            assert k in row, f"missing {k} in oi row"


def test_snapshot_sensex(client):
    r = client.get(f"{API}/market/snapshot", params={"index": "SENSEX"}, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("live") is True
    stocks = data.get("stocks") or []
    assert 25 <= len(stocks) <= 35, f"sensex stocks {len(stocks)}"
    idx = data.get("index") or {}
    assert 70000 < _num(idx["px"]) < 90000, f"sensex px {idx['px']}"


def test_candles_1d_and_1m(client):
    r = client.get(f"{API}/market/candles", params={"index": "NIFTY 50", "range": "1D"}, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("live") is True
    pts = data.get("points") or []
    assert len(pts) >= 40, f"1D points {len(pts)}"
    for p in pts[:2]:
        assert "t" in p and "v" in p

    r2 = client.get(f"{API}/market/candles", params={"index": "NIFTY 50", "range": "1M"}, timeout=30)
    assert r2.status_code == 200
    d2 = r2.json()
    pts2 = d2.get("points") or []
    assert 15 <= len(pts2) <= 40, f"1M points {len(pts2)}"


def test_snapshot_consistency(client):
    r1 = client.get(f"{API}/market/snapshot", params={"index": "NIFTY 50"}, timeout=30)
    assert r1.status_code == 200
    time.sleep(5)
    r2 = client.get(f"{API}/market/snapshot", params={"index": "NIFTY 50"}, timeout=30)
    assert r2.status_code == 200
    d1, d2 = r1.json(), r2.json()
    assert d1.get("live") is True and d2.get("live") is True
    # prices equal or minor tick
    p1 = _num(d1["index"]["px"])
    p2 = _num(d2["index"]["px"])
    assert abs(p1 - p2) / p1 < 0.05, f"prices diverged too much {p1} vs {p2}"
