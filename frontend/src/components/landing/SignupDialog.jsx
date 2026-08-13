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

const COPY = {
  signup: {
    title: "Create your free account",
    desc: "Start exploring TradeSense in under a minute. No card required.",
    cta: "Create Free Account",
  },
  login: {
    title: "Welcome back",
    desc: "Log in to your TradeSense dashboard.",
    cta: "Login",
  },
  contact: {
    title: "Talk to an expert",
    desc: "Tell us about your trading setup and we'll get back within 24 hours.",
    cta: "Request Callback",
  },
};

export default function SignupDialog({ open, mode, onOpenChange }) {
  const [done, setDone] = useState(false);
  const copy = COPY[mode] || COPY.signup;

  useEffect(() => {
    if (!open) setDone(false);
  }, [open]);

  const submit = (e) => {
    e.preventDefault();
    setDone(true);
    toast.success(
      mode === "login" ? "Logged in — demo prototype" : "Request received — demo prototype",
      { description: "This is a fictional demo. No real account was created." }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="cta-dialog"
        className="rounded-2xl border-edge bg-white p-8 sm:max-w-md"
        data-lenis-prevent
      >
        {done ? (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-signal/10">
              <CheckCircle2 className="h-7 w-7 text-signal" />
            </span>
            <DialogTitle className="mt-5 font-display text-2xl font-bold tracking-tight">
              You're on the list
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-slate">
              This is a demo prototype — no real account was created and no data
              was stored.
            </DialogDescription>
            <button
              data-testid="cta-dialog-done-button"
              onClick={() => onOpenChange(false)}
              className="mt-7 w-full rounded-full bg-ink py-3 text-sm font-semibold text-white transition-all hover:brightness-125 active:scale-95"
            >
              Back to Site
            </button>
          </div>
        ) : (
          <>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-signal">
              <TrendingUp className="h-5 w-5" strokeWidth={2.4} />
            </div>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-bold tracking-tight">{copy.title}</DialogTitle>
              <DialogDescription className="text-sm text-slate">{copy.desc}</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="mt-4 space-y-3.5">
              {mode !== "login" && (
                <input
                  data-testid="cta-form-name-input"
                  type="text"
                  required
                  placeholder="Full name"
                  className="w-full rounded-xl border border-edge bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-ember"
                />
              )}
              <input
                data-testid="cta-form-email-input"
                type="email"
                required
                placeholder="Email address"
                className="w-full rounded-xl border border-edge bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-ember"
              />
              {mode !== "contact" && (
                <input
                  data-testid="cta-form-password-input"
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full rounded-xl border border-edge bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-ember"
                />
              )}
              <button
                data-testid="cta-form-submit-button"
                type="submit"
                className="w-full rounded-full bg-ember py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95"
              >
                {copy.cta}
              </button>
              <p className="text-center font-mono text-[10px] text-slate">
                Demo prototype · no real account is created
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
