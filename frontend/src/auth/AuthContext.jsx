import { createContext, useCallback, useContext, useEffect, useState } from "react";

const API = process.env.REACT_APP_BACKEND_URL;
const AuthContext = createContext(null);

export const formatApiErrorDetail = (detail) => {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
};

export function AuthProvider({ children }) {
  // undefined = still checking, null = signed out, object = signed in
  const [user, setUser] = useState(undefined);

  const checkAuth = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/auth/me`, { credentials: "include" });
      if (!r.ok) {
        // access token may have expired (15 min) — try the refresh cookie once
        const rr = await fetch(`${API}/api/auth/refresh`, { method: "POST", credentials: "include" });
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
    const r = await fetch(`${API}/api/auth/login`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(formatApiErrorDetail(data.detail));
    setUser(data);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const r = await fetch(`${API}/api/auth/register`, {
      method: "POST", credentials: "include",
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
    const r = await fetch(`${API}/api/auth/session`, {
      method: "POST", credentials: "include",
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
      await fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" });
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
