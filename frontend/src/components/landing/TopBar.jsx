import { Menu, Home, ChevronRight, Wallet, Activity } from "lucide-react";

export default function TopBar({ onMenu, crumb = "Dashboard" }) {
  return (
    <div
      data-testid="topbar"
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-edge bg-paper/85 px-4 backdrop-blur-xl sm:px-8"
    >
      <div className="flex items-center gap-3">
        <button
          data-testid="topbar-menu-button"
          onClick={onMenu}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-edge bg-white lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <nav className="flex items-center gap-1.5 text-sm text-slate">
          <Home className="h-3.5 w-3.5 text-signal" />
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-ink" data-testid="topbar-crumb">{crumb}</span>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden font-mono text-sm text-slate md:block" data-testid="topbar-balance">₹0.00</span>
        <span
          data-testid="topbar-wallet"
          className="hidden items-center gap-2 rounded-full border border-edge bg-white px-3.5 py-1.5 sm:flex"
        >
          <Wallet className="h-3.5 w-3.5 text-slate" />
          <span className="font-mono text-sm font-semibold text-signal">₹188.71</span>
        </span>
        <span
          data-testid="topbar-enabled-badge"
          className="inline-flex items-center gap-1.5 rounded-full bg-signal px-3.5 py-1.5 font-mono text-xs font-bold text-white"
        >
          <Activity className="h-3.5 w-3.5" />
          Enabled
        </span>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-mono text-xs font-bold text-white ring-2 ring-edge">
            DU
          </span>
          <span className="hidden text-sm font-semibold text-ink sm:block">Demo User</span>
        </div>
      </div>
    </div>
  );
}
