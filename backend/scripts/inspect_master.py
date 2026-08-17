"""One-off: inspect SmartAPI instrument master for index rows, TATA symbols, MCX futures."""
import requests

rows = requests.get("https://margincalculator.angelone.in/OpenAPI_File/files/OpenAPIScripMaster.json", timeout=240).json()
print("total rows:", len(rows))

print("\n== INDEX-ish rows (NSE/BSE, symbol contains nifty/sensex) ==")
seen = set()
for r in rows:
    s = (r.get("symbol") or "")
    sl = s.lower()
    if r.get("exch_seg") in ("NSE", "BSE") and ("nifty" in sl or "sensex" in sl):
        key = (s, r.get("exch_seg"), r.get("instrumenttype"))
        if key in seen:
            continue
        seen.add(key)
        print(repr(s), "|", r.get("exch_seg"), "| itype:", repr(r.get("instrumenttype")), "| token:", r.get("token"), "| name:", r.get("name"))

print("\n== TATA motor variants (NSE) ==")
for r in rows:
    s = (r.get("symbol") or "").upper()
    if r.get("exch_seg") == "NSE" and r.get("instrumenttype", "") == "" and ("TATAMOTOR" in s or s.startswith("TMPV") or s.startswith("TMCV")):
        print(r.get("symbol"), r.get("token"), r.get("name"))

print("\n== NFO index FUTS (NIFTY/BANKNIFTY/FINNIFTY/MIDCPNIFTY nearest) ==")
for r in rows:
    if r.get("exch_seg") == "NFO" and r.get("instrumenttype") == "FUTIDX":
        n = r.get("name")
        if n in ("NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"):
            print(n, "|", r.get("symbol"), "| exp:", r.get("expiry"), "| token:", r.get("token"), "| lot:", r.get("lotsize"))

print("\n== MCX sample (GOLD/SILVER/CRUDEOIL futures) ==")
cnt = 0
for r in rows:
    if r.get("exch_seg") == "MCX" and r.get("instrumenttype") == "FUTCOM" and r.get("name") in ("GOLD", "SILVER", "CRUDEOIL"):
        print(r.get("name"), "|", r.get("symbol"), "| exp:", r.get("expiry"), "| token:", r.get("token"), "| lot:", r.get("lotsize"))
        cnt += 1
        if cnt > 12:
            break
