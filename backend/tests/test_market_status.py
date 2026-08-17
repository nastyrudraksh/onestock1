from backend.market_data import SmartMarket


def test_status_exposes_live_mode_and_session_reason():
    market = SmartMarket()
    market.api_key = "key"
    market.client_id = "client"
    market.mpin = "mpin"
    market.totp_secret = "secret"
    market.smart = object()
    market.master_loaded = True
    market.session_ok = False
    market.login_error = "session expired"

    status = market.status()

    assert status["configured"] is True
    assert status["live"] is False
    assert status["reason"] == "session_expired"
