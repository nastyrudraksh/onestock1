import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TrendingUp, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth, friendlyAuthError } from "@/auth/AuthContext";

export default function AuthModal({ open, mode = "login", onOpenChange, onAuth }) {
  const { login, register, googleLogin } = useAuth();
  const [m, setM] = useState(mode === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) setM(mode === "signup" ? "signup" : "login");
  }, [open, mode]);

  useEffect(() => {
    if (!open) {
      setEmail(""); setName(""); setPassword(""); setError(""); setBusy(false);
    }
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = m === "signup" ? await register(name.trim(), email.trim(), password) : await login(email.trim(), password);
      toast.success(m === "signup" ? `Account created — welcome, ${user.name}` : `Welcome back, ${user.name}`);
      onOpenChange(false);
      onAuth?.(user);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="auth-dialog"
        className="rounded-2xl border-edge bg-white p-8 sm:max-w-md"
        data-lenis-prevent
      >
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-signal">
          <TrendingUp className="h-5 w-5" strokeWidth={2.4} />
        </div>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold tracking-tight">
            {m === "signup" ? "Create your account" : "Sign in to OneStock"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate">
            Real accounts — your credentials are stored securely on the server.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="mt-4 space-y-3.5">
          {m === "signup" && (
            <input
              type="text" required placeholder="Full name" value={name} data-testid="auth-name-input"
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-edge bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-ember"
            />
          )}
          <input
            type="email" required placeholder="Email address" value={email} data-testid="auth-email-input"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-edge bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-ember"
          />
          <input
            type="password" required minLength={6} placeholder="Password (min 6 characters)" value={password} data-testid="auth-password-input"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-edge bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-ember"
          />
          {error && <p data-testid="auth-error" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">{error}</p>}
          <button
            data-testid="auth-submit-button" type="submit" disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ember py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {m === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-edge" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate">or</span>
          <span className="h-px flex-1 bg-edge" />
        </div>

        <button
          type="button" data-testid="auth-google-button" onClick={googleLogin}
          className="flex w-full items-center justify-center gap-2.5 rounded-full border border-edge bg-white py-3 text-sm font-semibold text-ink transition-all hover:bg-mist active:scale-95"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
          </svg>
          Continue with Google
        </button>

        <p className="mt-4 text-center text-xs text-slate">
          {m === "signup" ? (
            <>Already have an account?{" "}
              <button type="button" data-testid="auth-mode-switch" onClick={() => { setM("login"); setError(""); }} className="font-semibold text-ember hover:underline">Sign in</button>
            </>
          ) : (
            <>New to OneStock?{" "}
              <button type="button" data-testid="auth-mode-switch" onClick={() => { setM("signup"); setError(""); }} className="font-semibold text-ember hover:underline">Create an account</button>
            </>
          )}
        </p>
      </DialogContent>
    </Dialog>
  );
}
