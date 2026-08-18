import { createContext, useCallback, useContext, useEffect, useState } from "react";

const API = process.env.REACT_APP_BACKEND_URL;
const AuthContext = createContext(null);

// Call the API same-origin FIRST (the platform routes /api to the backend on whatever
// domain served the page — this makes auth work from any preview URL or iframe). If the
// host has no API routing (bare dev server), fall back to the absolute configured URL.
const apiFetch = async (path, options = {}) => {
  const opts = { credentials: "include", ...options };
  try {
    const r = await fetch(path, opts);
    const ct = r.headers.get("content-type") || "";
    if (!ct.includes("application/json")) throw new Error("not-an-api-host");
    return r;
  } catch (e) {
    if (e instanceof TypeError || e.message === "not-an-api-host") {
      return fetch(`${API}${path}`, opts);
    }
    throw e;
  }
};

export const formatApiErrorDetail = (detail) => {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
};

// Network-level failures (server restarting / unreachable) throw TypeError("Failed to fetch") —
// translate that into something a human understands instead of raw browser jargon.
export const friendlyAuthError = (err) =>
  err?.message === "Failed to fetch"
    ? "Cannot reach the server right now — it may be restarting. Please wait a few seconds and try again."
    : err?.message || "Authentication failed";

export function AuthProvider({ children }) {
  // undefined = still checking, null = signed out, object = signed in
  const [user, setUser] = useState(undefined);

  const checkAuth = useCallback(async () => {
    try {
      const r = await apiFetch("/api/auth/me");
      if (!r.ok) {
        // access token may have expired (15 min) — try the refresh cookie once
        const rr = await apiFetch("/api/auth/refresh", { method: "POST" });
        if (!rr.ok) throw new Error("not authenticated");
        setUser(await rr.json());
        return;
      }
      setUser(await r.json());
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // CRITICAL: returning from Google OAuth — AuthCallback exchanges session_id first.
    if (window.location.hash?.includes("session_id=")) return;
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email, password) => {
    const r = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(formatApiErrorDetail(data.detail));
    setUser(data);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const r = await apiFetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(formatApiErrorDetail(data.detail));
    setUser(data);
    return data;
  }, []);

  const googleLogin = useCallback(() => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  }, []);

  const exchangeGoogleSession = useCallback(async (sessionId) => {
    const r = await apiFetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(formatApiErrorDetail(data.detail));
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch { /* cookie may already be gone */ }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, googleLogin, exchangeGoogleSession, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
