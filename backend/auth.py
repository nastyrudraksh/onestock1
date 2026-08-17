"""Unified authentication: email/password (JWT cookies) + Emergent-managed Google OAuth.

One users collection serves both providers. Google sessions live in user_sessions
(session_token cookie); password logins use short-lived JWT access + refresh cookies.
"""
import os
import uuid
import secrets
import logging
from datetime import datetime, timezone, timedelta

import bcrypt
import jwt
import requests
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr, Field

logger = logging.getLogger("auth")

JWT_ALGORITHM = "HS256"
ACCESS_MIN = 15
REFRESH_DAYS = 7
SESSION_DAYS = 7
LOCK_AFTER = 5
LOCK_MINUTES = 15

router = APIRouter(prefix="/api/auth")
_db = None


def init_auth(db):
    global _db
    _db = db


# ---------------- models ----------------
class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class GoogleSessionIn(BaseModel):
    session_id: str


class ForgotIn(BaseModel):
    email: EmailStr


class ResetIn(BaseModel):
    token: str
    password: str = Field(min_length=6, max_length=128)


# ---------------- primitives ----------------
def _secret():
    return os.environ["JWT_SECRET"]


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "type": "access",
               "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_MIN)}
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "type": "refresh",
               "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_DAYS)}
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


def set_jwt_cookies(response: Response, user_id: str, email: str):
    response.set_cookie("access_token", create_access_token(user_id, email),
                        httponly=True, secure=True, samesite="none", max_age=ACCESS_MIN * 60, path="/")
    response.set_cookie("refresh_token", create_refresh_token(user_id),
                        httponly=True, secure=True, samesite="none", max_age=REFRESH_DAYS * 86400, path="/")


def public_user(doc: dict) -> dict:
    return {"user_id": doc["user_id"], "email": doc["email"], "name": doc.get("name", ""),
            "picture": doc.get("picture"), "role": doc.get("role", "user"),
            "provider": doc.get("provider", "password"), "created_at": doc.get("created_at")}


# ---------------- current user (JWT cookie | session cookie | Bearer) ----------------
async def get_current_user(request: Request) -> dict:
    if _db is None:
        raise HTTPException(status_code=503, detail="Auth not initialised")
    token = request.cookies.get("access_token")
    bearer = request.headers.get("Authorization", "")
    bearer_token = bearer[7:] if bearer.startswith("Bearer ") else None

    # 1) JWT access token (cookie first, then Bearer)
    for tok in (token, bearer_token):
        if not tok:
            continue
        try:
            payload = jwt.decode(tok, _secret(), algorithms=[JWT_ALGORITHM])
            if payload.get("type") != "access":
                continue
            user = await _db.users.find_one({"user_id": payload["sub"]}, {"_id": 0, "password_hash": 0})
            if user:
                return user
        except jwt.InvalidTokenError:
            continue

    # 2) Google session token (cookie first, then Bearer)
    sess_token = request.cookies.get("session_token") or bearer_token
    if sess_token:
        sess = await _db.user_sessions.find_one({"session_token": sess_token}, {"_id": 0})
        if sess:
            expires_at = sess["expires_at"]
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at < datetime.now(timezone.utc):
                raise HTTPException(status_code=401, detail="Session expired")
            user = await _db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0, "password_hash": 0})
            if user:
                return user
    raise HTTPException(status_code=401, detail="Not authenticated")


async def require_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


# ---------------- brute force ----------------
async def _check_lock(identifier: str):
    doc = await _db.login_attempts.find_one({"_id": identifier})
    if doc and doc.get("count", 0) >= LOCK_AFTER:
        since = doc.get("last")
        if since and isinstance(since, datetime):
            since = since if since.tzinfo else since.replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) - since < timedelta(minutes=LOCK_MINUTES):
                raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")


async def _record_fail(identifier: str):
    await _db.login_attempts.update_one(
        {"_id": identifier},
        {"$inc": {"count": 1}, "$set": {"last": datetime.now(timezone.utc)}},
        upsert=True)


# ---------------- email/password endpoints ----------------
@router.post("/register")
async def register(body: RegisterIn, response: Response):
    email = body.email.lower()
    if await _db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email already registered")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    doc = {"user_id": user_id, "email": email, "name": body.name.strip(),
           "password_hash": hash_password(body.password), "role": "user",
           "provider": "password", "created_at": datetime.now(timezone.utc)}
    await _db.users.insert_one(doc)
    set_jwt_cookies(response, user_id, email)
    return public_user(doc)


@router.post("/login")
async def login(body: LoginIn, request: Request, response: Response):
    email = body.email.lower()
    # key the lockout by account email: behind the k8s ingress request.client.host is a
    # rotating internal pod IP, and X-Forwarded-For is client-spoofable — email is the
    # only reliable key (5 failed attempts -> 15 min lock on the account)
    identifier = email
    await _check_lock(identifier)
    user = await _db.users.find_one({"email": email})
    if not user or not user.get("password_hash") or not verify_password(body.password, user["password_hash"]):
        await _record_fail(identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await _db.login_attempts.delete_one({"_id": identifier})
    set_jwt_cookies(response, user["user_id"], email)
    return public_user(user)


@router.post("/refresh")
async def refresh(request: Request, response: Response):
    tok = request.cookies.get("refresh_token")
    if not tok:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(tok, _secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = await _db.users.find_one({"user_id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    response.set_cookie("access_token", create_access_token(user["user_id"], user["email"]),
                        httponly=True, secure=True, samesite="none", max_age=ACCESS_MIN * 60, path="/")
    return public_user(user)


@router.post("/logout")
async def logout(request: Request, response: Response):
    sess = request.cookies.get("session_token")
    if sess:
        await _db.user_sessions.delete_many({"session_token": sess})
    for name in ("access_token", "refresh_token", "session_token"):
        response.delete_cookie(name, path="/")
    return {"ok": True}


@router.get("/me")
async def me(request: Request):
    return await get_current_user(request)


# ---------------- Google (Emergent-managed) ----------------
@router.post("/session")
async def google_session(body: GoogleSessionIn, response: Response):
    import asyncio
    def _exchange():
        return requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": body.session_id}, timeout=15)
    res = await asyncio.to_thread(_exchange)
    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session_id")
    data = res.json()
    email = (data.get("email") or "").lower()
    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")
    user = await _db.users.find_one({"email": email})
    if user:
        await _db.users.update_one({"email": email},
                                   {"$set": {"name": data.get("name") or user.get("name"),
                                             "picture": data.get("picture")}})
        user = await _db.users.find_one({"email": email}, {"_id": 0, "password_hash": 0})
    else:
        user = {"user_id": f"user_{uuid.uuid4().hex[:12]}", "email": email,
                "name": data.get("name") or email.split("@")[0], "picture": data.get("picture"),
                "role": "user", "provider": "google", "created_at": datetime.now(timezone.utc)}
        await _db.users.insert_one(user)
    session_token = data.get("session_token") or f"sess_{secrets.token_urlsafe(24)}"
    await _db.user_sessions.insert_one({
        "user_id": user["user_id"], "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS),
        "created_at": datetime.now(timezone.utc)})
    response.set_cookie("session_token", session_token,
                        httponly=True, secure=True, samesite="none", max_age=SESSION_DAYS * 86400, path="/")
    return public_user(user)


# ---------------- password reset ----------------
@router.post("/forgot-password")
async def forgot_password(body: ForgotIn):
    email = body.email.lower()
    user = await _db.users.find_one({"email": email})
    if user:
        token = secrets.token_urlsafe(32)
        await _db.password_reset_tokens.insert_one({
            "token": token, "email": email, "used": False,
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
            "created_at": datetime.now(timezone.utc)})
        logger.info("PASSWORD RESET LINK for %s: /reset-password?token=%s", email, token)
    # always succeed — don't reveal whether the email exists
    return {"ok": True, "message": "If that email is registered, a reset link has been generated."}


@router.post("/reset-password")
async def reset_password(body: ResetIn):
    doc = await _db.password_reset_tokens.find_one({"token": body.token, "used": False})
    if not doc:
        raise HTTPException(status_code=400, detail="Invalid or already-used reset token")
    exp = doc["expires_at"]
    if isinstance(exp, str):
        exp = datetime.fromisoformat(exp)
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token expired")
    await _db.users.update_one({"email": doc["email"]},
                               {"$set": {"password_hash": hash_password(body.password)}})
    await _db.password_reset_tokens.update_one({"_id": doc["_id"]}, {"$set": {"used": True}})
    return {"ok": True}


# ---------------- admin ----------------
@router.get("/users")
async def list_users(request: Request):
    await require_admin(request)
    cursor = _db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1)
    return {"users": await cursor.to_list(length=500)}


# ---------------- startup: indexes + admin seed ----------------
async def auth_startup(db):
    init_auth(db)
    await db.users.create_index("email", unique=True)
    await db.user_sessions.create_index("session_token")
    await db.login_attempts.create_index("identifier")
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "user_id": f"user_{uuid.uuid4().hex[:12]}", "email": admin_email,
            "name": "Admin", "password_hash": hash_password(admin_password),
            "role": "admin", "provider": "password",
            "created_at": datetime.now(timezone.utc)})
        logger.info("Admin user seeded: %s", admin_email)
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_password), "role": "admin"}})
        logger.info("Admin password re-synced: %s", admin_email)
