# Auth Testing Playbook — OneStock

Unified auth: email/password (JWT httpOnly cookies: access_token 15min + refresh_token 7d) and Emergent-managed Google OAuth (session_token cookie, 7d, stored in user_sessions). Admin role supported.

## Backend endpoints (all under /api/auth)
- POST /register {name, email, password} → user + JWT cookies (409 if email exists)
- POST /login {email, password} → user + JWT cookies (401 invalid; 429 after 5 failed attempts for 15 min)
- POST /refresh → new access cookie from refresh cookie
- POST /logout → clears all auth cookies + deletes Google session doc
- GET /me → current user (JWT cookie, session_token cookie, or Bearer)
- POST /session {session_id} → Emergent Google exchange (backend-only call to demobackend.emergentagent.com)
- POST /forgot-password {email} → always ok; reset link logged to backend console
- POST /reset-password {token, password}
- GET /users → admin only (403 otherwise)

## Quick API test
```
curl -c /tmp/cj.txt -X POST <API>/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test User","email":"t@example.com","password":"Test@12345"}'
curl -b /tmp/cj.txt <API>/api/auth/me
curl -c /tmp/ca.txt -X POST <API>/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@onestock.in","password":"OneStock#Admin2026"}'
curl -b /tmp/ca.txt <API>/api/auth/users   # admin only
```

## Browser flow
1. Landing → Get Started / Login → real AuthModal (email+password or Continue with Google)
2. Panel (/panel, market, etc.) is gated: unauthenticated navigation opens the auth modal instead
3. Google: redirects to auth.emergentagent.com, returns to app root with #session_id=..., AuthCallback exchanges it, lands in panel
4. Sidebar shows user chip (name/email/role) + Logout; admins see a "Users" menu with the registered-users table
5. Logout clears server session + cookies

## Mongo
- users: user_id (uuid), email (unique idx), name, password_hash (bcrypt $2b$), role, provider, created_at
- user_sessions: user_id, session_token (idx), expires_at (UTC-aware compare required)
- login_attempts: identifier "ip:email", count, last
- password_reset_tokens: token, email, used, expires_at (TTL idx)

## Credentials
See /app/memory/test_credentials.md (admin + test user).
