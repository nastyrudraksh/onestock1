from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from market_data import SmartMarket


def test_status_exposes_live_mode_and_session_reason():
    market = SmartMarket()
    market.api_key = "key"
    market.client_id = "client"
    market.mpin = "mpin"
    market.totp_secret = "secret"
    market.smart = object()
    market.master_loaded = True
    market.session_ok = False
    market.session_reason = "session_expired"
    market.login_error = "session expired"

    status = market.status()

    assert status["configured"] is True
    assert status["live"] is False
    assert status["reason"] == "session_expired"
