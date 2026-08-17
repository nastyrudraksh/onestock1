import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  TrendingUp, LayoutDashboard, Landmark, Wallet, Receipt, Settings,
  Menu, X, Globe, LogOut, Activity, ChevronRight, Home, Check, Crown,
  CandlestickChart, Tag, Users,
} from "lucide-react";
import { BrokerView, WalletView, TransactionsView, SettingsView, AdminUsersView } from "../views/ModuleViews";
import { MarketView } from "../views/terminal";
import { PlanView, TierView } from "../views/PanelViews";
import ProDashboard from "../views/ProDashboard";
import { Reveal } from "../landing/Reveal";
import { useAuth } from "@/auth/AuthContext";
import { getBalance as getWalletBalance } from "@/mock/mockWallet";

const MENU = [
  { icon: LayoutDashboard, label: "Dashboard", view: "panel" },
  { icon: CandlestickChart, label: "Market", view: "market" },
  { icon: Tag, label: "Monthly Plan", view: "plan" },
  { icon: Crown, label: "Tier", view: "tier" },
  { icon: Landmark, label: "Broker Details", view: "broker" },
  { icon: Wallet, label: "Fund Wallet", view: "wallet" },
  { icon: Receipt, label: "Transactions", view: "transactions" },
  { icon: Settings, label: "Settings", view: "settings" },
  { icon: Users, label: "Users", view: "admin-users", adminOnly: true },
];

const STEP_LABELS = ["Select Broker", "Activation Fee", "Broker Validation", "KYC Verification"];

const PANEL_STATS = [
  { label: "Total P&L", value: "+₹12,480", tone: "green" },
  { label: "Live P&L", value: "+₹842.50", tone: "green" },
  { label: "Active Trades", value: "12", tone: "dark" },
  { label: "Win Rate", value: "68%", tone: "dark" },
  { label: "Referral Earnings", value: "₹1,200.00", tone: "dark" },
  { label: "Available Margin", value: "₹18,400", tone: "dark" },
];

const PanelBody = ({ module, onModule, onWebsite, stepsDone, live, onClose, prefix, user, onLogout, aiEnabled, onToggleAI }) => (
  <div className="flex h-full flex-col">
    <div className="flex items-center gap-2.5 px-5 pt-6">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-signal">
        <TrendingUp className="h-5 w-5" strokeWidth={2.4} />
      </span>
      <div>
        <p className="font-display text-lg font-bold leading-none tracking-tight">
          One<span className="text-ember">Stock</span>
        </p>
        <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.28em] text-slate">User Panel</p>
      </div>
    </div>

    <div className="mx-4 mt-5 rounded-xl border border-edge bg-mist/60 p-3.5" data-testid={`${prefix}-status`}>
      <div className="flex items-center justify-between">
        <button
          onClick={() => { onModule("settings"); onClose?.(); }}
          title="Complete account steps"
          className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white ${live ? "bg-signal" : "bg-ember"} cursor-pointer`}
        >
          {live ? "Live" : "Not Live"}
        </button>
        <span className="font-mono text-[10px] text-slate">({stepsDone}/4)</span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-edge">
        <motion.div
          className={`h-full rounded-full ${live ? "bg-signal" : "bg-ember"}`}
          animate={{ width: `${(stepsDone / 4) * 100}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>

    <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
      <p className="px-3 pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate/70">Menu</p>
      {MENU.filter((item) => !item.adminOnly || user?.role === "admin").map((item) => {
        const active = module === item.view;
        return (
          <button
            key={item.view}
            data-testid={`${prefix}-${item.view}`}
            onClick={() => { onModule(item.view); onClose?.(); }}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-200 ${
              active ? "bg-ink text-white" : "text-slate hover:bg-mist hover:text-ink"
            }`}
          >
            <item.icon className={`h-4 w-4 ${active ? "text-signal" : "text-slate group-hover:text-ember"}`} strokeWidth={2} />
            <span className="text-[13px] font-semibold tracking-wide">{item.label}</span>
          </button>
        );
      })}
    </nav>

    <div className="space-y-2 border-t border-edge p-4">
      <button
        data-testid={`${prefix}-view-website`}
        onClick={onWebsite}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-edge py-3 text-sm font-semibold text-ink transition-colors hover:bg-mist"
      >
        <Globe className="h-4 w-4" /> View Website
      </button>
      {user && (
        <>
          <div className="flex items-center gap-2.5 rounded-xl border border-edge bg-mist/60 px-3 py-2.5" data-testid={`${prefix}-user-chip`}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-xs font-bold text-signal">
              {(user.name || user.email || "U").slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-ink">{user.name || "User"}</span>
              <span className="block truncate font-mono text-[10px] text-slate">{user.email}{user.role === "admin" ? " · ADMIN" : ""}</span>
            </span>
          </div>
          <button
            data-testid={`${prefix}-logout`}
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold text-slate transition-colors hover:text-ink"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </>
      )}
      <div className="mt-2">
        <button
          onClick={onToggleAI}
          data-testid={`${prefix}-ai-toggle`}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${aiEnabled ? "bg-signal text-white" : "border border-edge bg-white text-slate hover:bg-mist"}`}
        >
          <Activity className="h-3.5 w-3.5" /> {aiEnabled ? "AI Enabled" : "AI Disabled"}
        </button>
      </div>
    </div>
  </div>
);

const PanelHome = ({ stepsDone, completeStep, live, onModule }) => (
  <div className="space-y-6">
    <Reveal>
      <div className="rounded-2xl border border-edge bg-white p-6 sm:p-8" data-testid="account-progress-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold tracking-tight">Account Progress</h2>
          {live ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-signal">
              <Check className="h-3 w-3" /> Account Live
            </span>
          ) : (
            <button
              data-testid="complete-step-button"
              onClick={completeStep}
              className="rounded-full bg-ember px-5 py-2.5 text-xs font-semibold text-white transition-all hover:brightness-110 active:scale-95"
            >
              Complete: {STEP_LABELS[stepsDone]}
            </button>
          )}
        </div>
        <div className="mt-8 flex items-center">
          {STEP_LABELS.map((label, i) => {
            const done = i < stepsDone;
            return (
              <div key={label} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-2.5">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full font-mono text-xs font-bold transition-colors duration-300 ${
                    done ? "bg-signal text-white" : "bg-mist text-slate"
                  }`}>
                    {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={`whitespace-nowrap text-[11px] font-medium ${done ? "text-ink" : "text-slate"}`}>{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className="mx-2 mb-6 h-0.5 flex-1 rounded bg-edge">
                    <motion.div
                      className="h-full rounded bg-signal"
                      animate={{ width: i < stepsDone - 0 ? (done && i + 1 < stepsDone ? "100%" : done ? "50%" : "0%") : "0%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Reveal>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Reveal delay={0.05}>
        <div className="flex h-full flex-col rounded-2xl border border-edge bg-white p-6" data-testid="subscription-card">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate">
            <Crown className="h-4 w-4 text-ember" /> Subscription
          </div>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight">Professional</p>
          <p className="font-mono text-sm text-slate">₹2,499/month</p>
          <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-signal/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-signal">
            <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse-dot" /> Active
          </span>
          <button
            data-testid="renew-subscription-button"
            onClick={() => toast.success("Subscription renewed", { description: "Demo only — no payment was processed." })}
            className="mt-auto pt-6"
          >
            <span className="inline-flex w-full items-center justify-center rounded-full border border-edge py-2.5 text-xs font-semibold transition-colors hover:bg-mist active:scale-95">
              Renew Plan
            </span>
          </button>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-ink p-6 text-paper" data-testid="panel-wallet-card">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-signal/15 blur-[50px]" />
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cloud">
            <Wallet className="h-4 w-4 text-signal" /> Wallet Balance
          </div>
          <p className="mt-3 font-mono text-3xl font-bold tracking-tight">₹4,250.00</p>
          <button
            data-testid="panel-deposit-button"
            onClick={() => onModule("wallet")}
            className="mt-auto pt-6"
          >
            <span className="inline-flex w-full items-center justify-center rounded-full bg-ember py-2.5 text-xs font-semibold text-white transition-all hover:brightness-110 active:scale-95">
              Deposit Funds
            </span>
          </button>
        </div>
      </Reveal>
      <Reveal delay={0.15}>
        <div className="flex h-full flex-col rounded-2xl border border-edge bg-white p-6" data-testid="panel-broker-card">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate">
            <Landmark className="h-4 w-4 text-ember" /> Connected Broker
          </div>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight">AlphaBrokr</p>
          <p className="font-mono text-sm text-slate">NSE · BSE · 38ms</p>
          <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-signal/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-signal">
            <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse-dot" /> Connected
          </span>
          <button
            data-testid="panel-manage-broker-button"
            onClick={() => onModule("broker")}
            className="mt-auto pt-6"
          >
            <span className="inline-flex w-full items-center justify-center rounded-full border border-edge py-2.5 text-xs font-semibold transition-colors hover:bg-mist active:scale-95">
              Manage Brokers
            </span>
          </button>
        </div>
      </Reveal>
    </div>

    <Reveal delay={0.1}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {PANEL_STATS.map((s) => (
          <div key={s.label} className="rounded-2xl border border-edge bg-white p-4" data-testid={`panel-stat-${s.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
            <p className="font-mono text-[9px] uppercase tracking-wider text-slate">{s.label}</p>
            <p className={`mt-2 font-mono text-lg font-bold ${s.tone === "green" ? "text-signal" : "text-ink"}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </Reveal>

    <Reveal delay={0.15}>
      <div className="rounded-2xl border border-edge bg-white p-6" data-testid="panel-recent-trades">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">Recent Trades</p>
          <button
            data-testid="panel-view-all-trades"
            onClick={() => onModule("transactions")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-ember transition-colors hover:text-ember-dark"
          >
            View All <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {[
            { sym: "RELIANCE", side: "BUY", qty: 50, pnl: "+₹1,240", time: "14:32" },
            { sym: "TCS", side: "SELL", qty: 25, pnl: "+₹860", time: "13:58" },
            { sym: "HDFCBANK", side: "BUY", qty: 100, pnl: "-₹320", time: "11:20" },
          ].map((t, i) => (
            <div key={i} className="flex items-center justify-between border-b border-edge pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${t.side === "BUY" ? "bg-signal/10 text-signal" : "bg-rose-500/10 text-rose-500"}`}>{t.side}</span>
                <span className="font-mono text-sm font-bold">{t.sym}</span>
                <span className="font-mono text-xs text-slate">x{t.qty}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-slate">{t.time}</span>
                <span className={`font-mono text-sm font-bold ${t.pnl.startsWith("+") ? "text-signal" : "text-rose-500"}`}>{t.pnl}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  </div>
);

export default function UserPanel({ module, onModule, onWebsite }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(() => {
    try {
      return getWalletBalance();
    } catch (e) {
      return 4250.0;
    }
  });
  const [stepsDone, setStepsDone] = useState(2);
  const live = stepsDone === 4;
  const crumb = MENU.find((m) => m.view === module)?.label || "Dashboard";

  const completeStep = () => {
    if (stepsDone >= 4) return;
    toast.success(`${STEP_LABELS[stepsDone]} completed`, { description: "Demo only — nothing was submitted." });
    setStepsDone((s) => s + 1);
  };

  useEffect(() => {
    const onUpdate = (e) => {
      try {
        const b = (e && e.detail && typeof e.detail.balance !== "undefined") ? e.detail.balance : getWalletBalance();
        setWalletBalance(Number(b));
      } catch (err) {}
    };
    window.addEventListener("wallet:updated", onUpdate);
    return () => window.removeEventListener("wallet:updated", onUpdate);
  }, []);

  const [aiEnabled, setAiEnabled] = useState(() => {
    try {
      return localStorage.getItem("ai_enabled") === "1";
    } catch (e) {
      return false;
    }
  });

  const toggleAI = () => {
    const next = !aiEnabled;
    try {
      localStorage.setItem("ai_enabled", next ? "1" : "0");
    } catch (e) {}
    setAiEnabled(next);
    toast.success(next ? "AI notifications enabled" : "AI notifications disabled", { description: next ? "Traders will receive AI alerts." : "AI alerts turned off." });
  };

  const handleLogout = async () => {
    await logout();
    toast.info("Logged out", { description: "Your session has been closed securely." });
    onWebsite();
  };

  return (
    <div data-testid="user-panel">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-edge bg-white lg:block" data-testid="panel-sidebar">
        <PanelBody
          module={module}
          onModule={onModule}
          onWebsite={onWebsite}
          stepsDone={stepsDone}
          live={live}
          prefix="panel-nav"
          user={user}
          onLogout={handleLogout}
          aiEnabled={aiEnabled}
          onToggleAI={toggleAI}
        />
      </aside>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              data-testid="panel-sidebar-mobile"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-edge bg-white lg:hidden"
            >
              <button
                data-testid="panel-mobile-close"
                onClick={() => setMenuOpen(false)}
                className="absolute right-3 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-edge"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
              <PanelBody
                module={module}
                onModule={onModule}
                onWebsite={onWebsite}
                stepsDone={stepsDone}
                live={live}
                onClose={() => setMenuOpen(false)}
                prefix="panel-mobile-nav"
                user={user}
                onLogout={() => { setMenuOpen(false); handleLogout(); }}
                aiEnabled={aiEnabled}
                onToggleAI={(e) => { setMenuOpen(false); toggleAI(); }}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-edge bg-paper/85 px-4 backdrop-blur-xl sm:px-8" data-testid="panel-topbar">
          <div className="flex items-center gap-3">
            <button
              data-testid="panel-menu-button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-edge bg-white lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="hidden sm:inline ml-2 mr-2 text-sm font-semibold text-ink" data-testid="panel-greeting">{user ? `Hello, ${user.name}` : "Hello"}</span>
            <nav className="flex items-center gap-1.5 text-sm text-slate">
              <Home className="h-3.5 w-3.5 text-signal" />
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-semibold text-ink" data-testid="panel-crumb">{crumb}</span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-edge bg-white px-3.5 py-1.5 sm:flex" data-testid="panel-wallet-chip">
              <Wallet className="h-3.5 w-3.5 text-slate" />
              <span className="font-mono text-sm font-semibold text-signal">₹{walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </span>
            <button onClick={toggleAI} title="Toggle AI notifications" className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-xs font-bold ${aiEnabled ? "bg-signal text-white" : "border border-edge bg-white text-slate"}`} data-testid="panel-enabled-badge">
              <Activity className="h-3.5 w-3.5" /> {aiEnabled ? "AI Enabled" : "AI Off"}
            </button>
            {/* Avatar button removed; greeting is shown on the top-left */}
          </div>
        </div>

        <main className="flex-1 bg-mist/40 p-4 sm:p-8">
          {module === "panel" && (
            <ProDashboard onModule={onModule} />
          )}
          {module === "market" && <MarketView onBack={() => onModule("panel")} />}
          {module === "plan" && <PlanView onBack={() => onModule("panel")} />}
          {module === "tier" && <TierView onBack={() => onModule("panel")} />}
          {module === "broker" && <BrokerView onBack={() => onModule("panel")} />}
          {module === "wallet" && <WalletView onBack={() => onModule("panel")} />}
          {module === "transactions" && <TransactionsView onBack={() => onModule("panel")} />}
          {module === "admin-users" && user?.role === "admin" && <AdminUsersView onBack={() => onModule("panel")} />}
          {module === "settings" && (
            <SettingsView
              onBack={() => onModule("panel")}
              stepsDone={stepsDone}
              setStepsDone={setStepsDone}
              aiEnabled={aiEnabled}
              setAiEnabled={(v) => { setAiEnabled(v); try { localStorage.setItem("ai_enabled", v ? "1" : "0"); } catch (e) {} }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
