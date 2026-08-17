import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getUsers, addUser, findUser, findOrCreateGoogleUser } from "@/mock/mockUsers";

export default function AuthModal({ open, mode = "login", onOpenChange, onAuth }) {
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const m = mode === "signup" ? "signup" : "login";

  useEffect(() => {
    if (!open) {
      setDone(false);
      setEmail("");
      setName("");
      setPassword("");
    }
  }, [open]);

  const submit = (e) => {
    e.preventDefault();
    if (m === "signup") {
      const existing = findUser(email);
      if (existing) {
        toast.error("Email already registered");
        return;
      }
      addUser({ email, name: name || email.split("@")[0], password });
      localStorage.setItem("username", name || email.split("@")[0]);
      localStorage.setItem("auth_email", email);
      setDone(true);
      toast.success("Account created — demo only");
      onAuth?.(name || email.split("@")[0]);
    } else {
      const u = findUser(email);
      if (!u || u.password !== password) {
        toast.error("Invalid credentials");
        return;
      }
      localStorage.setItem("username", u.name || u.email.split("@")[0]);
      localStorage.setItem("auth_email", u.email);
      setDone(true);
      toast.success("Logged in — demo only");
      onAuth?.(u.name || u.email.split("@")[0]);
    }
  };

  const handleGoogle = () => {
    const u = findOrCreateGoogleUser();
    if (!u) {
      toast.error("Google sign-in failed (demo)");
      return;
    }
    try {
      localStorage.setItem("username", u.name || u.email.split("@")[0]);
      localStorage.setItem("auth_email", u.email);
    } catch (e) {}
    setDone(true);
    toast.success("Signed in with Google — demo only");
    onAuth?.(u.name || u.email.split("@")[0]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="auth-dialog"
        className="rounded-2xl border-edge bg-white p-8 sm:max-w-md"
        data-lenis-prevent
      >
        {done ? (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-signal/10">
              <CheckCircle2 className="h-7 w-7 text-signal" />
            </span>
            <DialogTitle className="mt-5 font-display text-2xl font-bold tracking-tight">
              {m === "signup" ? "Welcome aboard" : "Welcome back"}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-slate">
              This is a demo prototype — no real authentication is performed.
            </DialogDescription>
            <button
              data-testid="auth-done-button"
              onClick={() => onOpenChange(false)}
              className="mt-7 w-full rounded-full bg-ink py-3 text-sm font-semibold text-white transition-all hover:brightness-125 active:scale-95"
            >
              Continue
            </button>
          </div>
        ) : (
          <>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-signal">
              <TrendingUp className="h-5 w-5" strokeWidth={2.4} />
            </div>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-bold tracking-tight">{m === "signup" ? "Create account" : "Sign in"}</DialogTitle>
              <DialogDescription className="text-sm text-slate">Demo-only authentication stored in your browser.</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-3.5">
              <button
                type="button"
                data-testid="auth-google-button"
                onClick={handleGoogle}
                className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-edge bg-white px-4 py-3 text-sm font-semibold transition-colors hover:bg-mist"
              >
                <span className="h-4 w-4 rounded-sm bg-red-500" /> Continue with Google
              </button>
              <form onSubmit={submit} className="space-y-3.5">
              {m === "signup" && (
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-edge bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-ember"
                />
              )}
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-edge bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-ember"
              />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-edge bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-ember"
              />
              <button
                data-testid="auth-submit-button"
                type="submit"
                className="w-full rounded-full bg-ember py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95"
              >
                {m === "signup" ? "Create account" : "Sign in"}
              </button>
              <p className="text-center font-mono text-[10px] text-slate">Demo prototype · data stored locally in your browser</p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
