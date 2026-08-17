"""Backend auth flow tests for OneStock (register/login/me/refresh/logout/admin/reset/lockout)."""
import os
import time
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://tradesense-hub-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api/auth"

ADMIN_EMAIL = "admin@onestock.in"
ADMIN_PASS = "OneStock#Admin2026"


def _fresh_email(tag="user"):
    return f"test_{tag}_{uuid.uuid4().hex[:8]}@onestock.in"


# ---------------- Register / Me / Duplicate ----------------
def test_register_creates_user_and_sets_cookies():
    s = requests.Session()
    email = _fresh_email("reg")
    r = s.post(f"{API}/register", json={"name": "Reg User", "email": email, "password": "Test@12345"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["email"] == email
    assert body["role"] == "user"
    assert body["provider"] == "password"
    assert "user_id" in body
    # cookies set
    cookies = s.cookies.get_dict()
    assert "access_token" in cookies
    assert "refresh_token" in cookies
    # me returns same user
    me = s.get(f"{API}/me")
    assert me.status_code == 200
    assert me.json()["email"] == email


def test_register_duplicate_email_returns_409():
    s = requests.Session()
    email = _fresh_email("dup")
    r1 = s.post(f"{API}/register", json={"name": "Dup", "email": email, "password": "Test@12345"})
    assert r1.status_code == 200
    r2 = requests.post(f"{API}/register", json={"name": "Dup2", "email": email, "password": "Test@12345"})
    assert r2.status_code == 409


# ---------------- Login: wrong password ----------------
def test_login_wrong_password_401():
    # Use admin email but wrong password ONCE (won't lock — we use one attempt, not 5)
    r = requests.post(f"{API}/login", json={"email": ADMIN_EMAIL, "password": "wrong_password_x"})
    assert r.status_code == 401
    assert "Invalid" in r.json().get("detail", "")


# ---------------- Refresh + Logout ----------------
def test_refresh_and_logout_flow():
    s = requests.Session()
    email = _fresh_email("ref")
    s.post(f"{API}/register", json={"name": "Ref User", "email": email, "password": "Test@12345"})
    # refresh
    r = s.post(f"{API}/refresh")
    assert r.status_code == 200
    assert r.json()["email"] == email
    # logout
    lo = s.post(f"{API}/logout")
    assert lo.status_code == 200
    # me should now fail (cookies cleared server-side; but requests session may keep old cookies with new empty values)
    me = s.get(f"{API}/me")
    assert me.status_code == 401


# ---------------- Admin: /users ----------------
def test_admin_login_and_users_list():
    s = requests.Session()
    r = s.post(f"{API}/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, r.text
    assert r.json()["role"] == "admin"
    ul = s.get(f"{API}/users")
    assert ul.status_code == 200
    users = ul.json().get("users", [])
    assert isinstance(users, list)
    assert any(u.get("email") == ADMIN_EMAIL for u in users)
    # each user has a role field
    for u in users[:5]:
        assert "role" in u
        assert "_id" not in u


def test_normal_user_cannot_access_users_list():
    s = requests.Session()
    email = _fresh_email("norm")
    s.post(f"{API}/register", json={"name": "Norm", "email": email, "password": "Test@12345"})
    r = s.get(f"{API}/users")
    assert r.status_code == 403


# ---------------- Forgot / Reset password ----------------
def test_forgot_and_reset_password_flow():
    # register a fresh user
    email = _fresh_email("reset")
    orig_pw = "Test@12345"
    new_pw = "NewPass@98765"
    s = requests.Session()
    s.post(f"{API}/register", json={"name": "Reset User", "email": email, "password": orig_pw})

    r = requests.post(f"{API}/forgot-password", json={"email": email})
    assert r.status_code == 200

    # Fetch token from backend log
    time.sleep(0.5)
    token = None
    for log_path in ("/var/log/supervisor/backend.err.log", "/var/log/supervisor/backend.out.log"):
        try:
            with open(log_path) as f:
                lines = f.readlines()
            for line in reversed(lines[-500:]):
                if email in line and "PASSWORD RESET LINK" in line and "token=" in line:
                    token = line.split("token=")[-1].strip()
                    break
            if token:
                break
        except FileNotFoundError:
            continue
    assert token, "Reset token not found in backend logs"

    # Reset
    rr = requests.post(f"{API}/reset-password", json={"token": token, "password": new_pw})
    assert rr.status_code == 200

    # Login with new password
    li = requests.post(f"{API}/login", json={"email": email, "password": new_pw})
    assert li.status_code == 200

    # Reuse token -> 400
    reuse = requests.post(f"{API}/reset-password", json={"token": token, "password": "Another@123"})
    assert reuse.status_code == 400


# ---------------- Lockout (throwaway account) ----------------
def test_lockout_after_5_failed_attempts():
    email = _fresh_email("lock")
    requests.post(f"{API}/register", json={"name": "Lock User", "email": email, "password": "Test@12345"})
    codes = []
    for _ in range(5):
        r = requests.post(f"{API}/login", json={"email": email, "password": "wrong"})
        codes.append(r.status_code)
    # 6th attempt should be locked
    r6 = requests.post(f"{API}/login", json={"email": email, "password": "wrong"})
    assert r6.status_code == 429, f"expected 429 got {r6.status_code}; prior codes={codes}"
    assert "Too many" in r6.json().get("detail", "")


# ---------------- Unauthenticated /me ----------------
def test_me_unauthenticated_401():
    r = requests.get(f"{API}/me")
    assert r.status_code == 401
