import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Menu, X, ChevronDown, Landmark, Wallet, Receipt, Settings } from "lucide-react";
import { scrollToSection } from "@/lib/scroll";

const LINKS = [
  { label: "Home", id: "home" },
  { label: "Services", id: "services" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Features", id: "features" },
  { label: "Pricing", id: "pricing" },
  { label: "About Us", id: "about" },
  { label: "Contact", id: "contact" },
];

const MODULES = [
  { icon: Landmark, label: "Broker Details", view: "broker" },
  { icon: Wallet, label: "Fund Wallet", view: "wallet" },
  { icon: Receipt, label: "Transactions", view: "transactions" },
  { icon: Settings, label: "Settings", view: "settings" },
];

export default function Navbar({ onCta, onSection, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    setOpen(false);
    setPlatformOpen(false);
    if (onSection) onSection(id);
    else scrollToSection(id);
  };

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 inset-x-0 z-50 transition-[background-color,box-shadow,border-color] duration-300 border-b ${
        scrolled
          ? "bg-paper/85 backdrop-blur-xl border-edge shadow-[0_8px_30px_-12px_rgba(10,15,28,0.12)]"
          : "bg-paper/60 backdrop-blur-md border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 sm:px-12">
        <button
          data-testid="nav-logo"
          onClick={() => go("home")}
          className="flex items-center gap-2.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-signal">
            <TrendingUp className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            Trade<span className="text-ember">Sense</span>
          </span>
        </button>

        <div className="hidden lg:flex items-center gap-1">
          {LINKS.map((l) => (
            <button
              key={l.id}
              data-testid={`nav-link-${l.id}`}
              onClick={() => go(l.id)}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-slate transition-colors duration-200 hover:bg-mist hover:text-ink"
            >
              {l.label}
            </button>
          ))}
          <div className="relative">
            <button
              data-testid="nav-platform-dropdown"
              onClick={() => setPlatformOpen((o) => !o)}
              className="flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-slate transition-colors duration-200 hover:bg-mist hover:text-ink"
            >
              Platform
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${platformOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {platformOpen && (
                <motion.div
                  data-testid="nav-platform-menu"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-edge bg-white p-2 shadow-lift"
                >
                  {MODULES.map((m) => (
                    <button
                      key={m.view}
                      data-testid={`nav-module-${m.view}`}
                      onClick={() => { setPlatformOpen(false); onNavigate(m.view); }}
                      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-slate transition-colors hover:bg-mist hover:text-ink"
                    >
                      <m.icon className="h-4 w-4 text-ember" />
                      {m.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <button
            data-testid="nav-login-button"
            onClick={() => onCta("login")}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-mist"
          >
            Login
          </button>
          <button
            data-testid="nav-get-started-button"
            onClick={() => onCta("signup")}
            className="rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95 shadow-glow-ember"
          >
            Get Started
          </button>
        </div>

        <button
          data-testid="nav-mobile-toggle"
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full border border-edge bg-white"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="nav-mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden overflow-hidden border-t border-edge bg-paper"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {LINKS.map((l) => (
                <button
                  key={l.id}
                  data-testid={`nav-mobile-link-${l.id}`}
                  onClick={() => go(l.id)}
                  className="rounded-xl px-4 py-3 text-left text-base font-medium text-ink transition-colors hover:bg-mist"
                >
                  {l.label}
                </button>
              ))}
              <p className="px-4 pt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate">Platform</p>
              {MODULES.map((m) => (
                <button
                  key={m.view}
                  data-testid={`nav-mobile-module-${m.view}`}
                  onClick={() => { setOpen(false); onNavigate(m.view); }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-medium text-ink transition-colors hover:bg-mist"
                >
                  <m.icon className="h-4 w-4 text-ember" />
                  {m.label}
                </button>
              ))}
              <div className="mt-3 flex gap-3">
                <button
                  data-testid="nav-mobile-login-button"
                  onClick={() => { setOpen(false); onCta("login"); }}
                  className="flex-1 rounded-full border border-edge px-5 py-3 text-sm font-semibold"
                >
                  Login
                </button>
                <button
                  data-testid="nav-mobile-get-started-button"
                  onClick={() => { setOpen(false); onCta("signup"); }}
                  className="flex-1 rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white"
                >
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
