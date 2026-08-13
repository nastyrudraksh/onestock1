import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, LayoutDashboard, GraduationCap, Workflow, Sparkles,
  Tag, LineChart, ArrowLeftRight, Landmark, Wallet, Receipt,
  HelpCircle, Mail, Settings, X,
} from "lucide-react";

const GROUPS = [
  {
    title: "Menu",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", id: "home" },
      { icon: GraduationCap, label: "Services", id: "services" },
      { icon: Workflow, label: "How It Works", id: "how-it-works" },
      { icon: Sparkles, label: "Features", id: "features" },
    ],
  },
  {
    title: "Finance",
    items: [
      { icon: Tag, label: "Pricing", id: "pricing" },
      { icon: LineChart, label: "P & L", id: "analytics" },
      { icon: ArrowLeftRight, label: "My Trades", id: "platform" },
      { icon: Landmark, label: "Broker Details", view: "broker" },
      { icon: Wallet, label: "Fund Wallet", view: "wallet" },
      { icon: Receipt, label: "Transactions", view: "transactions" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Tickets", id: "faq" },
      { icon: Mail, label: "Contact", id: "contact" },
    ],
  },
  {
    title: "Setting",
    items: [{ icon: Settings, label: "Settings", view: "settings" }],
  },
];

const SidebarBody = ({ onSelect, onCta, prefix, isActive }) => (
  <div className="flex h-full flex-col">
    <div className="flex items-center gap-2.5 px-5 pt-6">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-signal">
        <TrendingUp className="h-5 w-5" strokeWidth={2.4} />
      </span>
      <div>
        <p className="font-display text-lg font-bold leading-none tracking-tight">
          One<span className="text-ember">Stock</span>
        </p>
        <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.28em] text-slate">Auto Trading Bot</p>
      </div>
    </div>

    <div className="mx-4 mt-5 rounded-xl border border-edge bg-mist/60 p-3.5" data-testid={`${prefix}-status`}>
      <div className="flex items-center justify-between">
        <span className="rounded-md bg-ember px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white">Not Live</span>
        <span className="font-mono text-[10px] text-slate">(2/4)</span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-edge">
        <motion.div
          className="h-full rounded-full bg-ember"
          initial={{ width: 0 }}
          animate={{ width: "50%" }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>

    <nav className="mt-4 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
      {GROUPS.map((g) => (
        <div key={g.title}>
          <p className="px-3 pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate/70">
            {g.title}
          </p>
          <div className="space-y-1">
            {g.items.map((item) => {
              const active = isActive(item);
              return (
                <button
                  key={item.label}
                  data-testid={`${prefix}-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  onClick={() => onSelect(item)}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-200 ${
                    active ? "bg-ink text-white" : "text-slate hover:bg-mist hover:text-ink"
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${active ? "text-signal" : "text-slate group-hover:text-ember"}`} strokeWidth={2} />
                  <span className="text-[13px] font-semibold tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>

    <div className="border-t border-edge p-4">
      <button
        data-testid={`${prefix}-get-started-button`}
        onClick={() => onCta("signup")}
        className="w-full rounded-full bg-ember py-3 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95"
      >
        Get Started
      </button>
      <button
        data-testid={`${prefix}-login-button`}
        onClick={() => onCta("login")}
        className="mt-2 w-full rounded-full border border-edge py-3 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-mist"
      >
        Login
      </button>
    </div>
  </div>
);

export default function Sidebar({ onCta, mobileOpen, onClose, view, onNavigate, onSection }) {
  const [activeSection, setActiveSection] = useState("home");

  const isActive = (item) =>
    item.view ? view === item.view : view === "home" && activeSection === item.id;

  const onSelect = (item) => {
    if (item.view) {
      onNavigate(item.view);
    } else {
      setActiveSection(item.id);
      onSection(item.id);
    }
    onClose?.();
  };

  return (
    <>
      <aside
        data-testid="sidebar"
        className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-edge bg-white lg:block"
      >
        <SidebarBody onSelect={onSelect} onCta={onCta} prefix="sidebar" isActive={isActive} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              data-testid="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              data-testid="sidebar-mobile"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-edge bg-white lg:hidden"
            >
              <button
                data-testid="sidebar-mobile-close"
                onClick={onClose}
                className="absolute right-3 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-edge"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarBody onSelect={onSelect} onCta={onCta} prefix="sidebar-mobile" isActive={isActive} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
