import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, Landmark, Wallet, ArrowDownToLine, ArrowUpFromLine,
  Plug, Unplug, Save,
} from "lucide-react";
import { Reveal } from "../landing/Reveal";
import { Switch } from "@/components/ui/switch";

const Shell = ({ title, desc, onBack, testid, children }) => (
  <section data-testid={testid} className="min-h-[70vh] px-2 py-4 sm:px-4">
    <div className="mx-auto max-w-5xl">
      <button
        data-testid={`${testid}-back-button`}
        onClick={onBack}
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-edge bg-white px-4 py-2 text-xs font-semibold text-slate transition-colors hover:bg-mist hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
      </button>
      <Reveal>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">{title}</h1>
        <p className="mt-3 max-w-lg text-sm md:text-base text-slate">{desc}</p>
      </Reveal>
      <div className="mt-10">{children}</div>
    </div>
  </section>
);

const Badge = ({ tone = "green", children }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
    tone === "green" ? "bg-signal/10 text-signal" : tone === "amber" ? "bg-amber-500/10 text-amber-600" : "bg-mist text-slate"
  }`}>
    <span className={`h-1.5 w-1.5 rounded-full ${tone === "green" ? "bg-signal animate-pulse-dot" : tone === "amber" ? "bg-amber-500" : "bg-slate"}`} />
    {children}
  </span>
);

const BROKERS = [
  { name: "AlphaBrokr", latency: "38ms", region: "NSE · BSE" },
  { name: "TradePro X", latency: "45ms", region: "NSE · MCX" },
  { name: "StockEdge Demo", latency: "52ms", region: "BSE · MCX" },
];

export function BrokerView({ onBack }) {
  const [connected, setConnected] = useState({ AlphaBrokr: true });
  const toggle = (name) => {
    const isOn = !!connected[name];
    setConnected((c) => ({ ...c, [name]: !isOn }));
    toast.success(isOn ? `${name} disconnected` : `${name} connected`, {
      description: "Demo only — no real broker account was linked.",
    });
  };

  return (
    <Shell testid="broker-view" onBack={onBack}
      title="Broker Details"
      desc="Manage your connected brokerage accounts. Connections use secure, official API-based flows.">
      <div className="space-y-4">
        {BROKERS.map((b, i) => {
          const isOn = !!connected[b.name];
          return (
            <Reveal key={b.name} delay={i * 0.08} y={24}>
              <div data-testid={`broker-card-${b.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-edge bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${isOn ? "bg-ink text-signal" : "bg-mist text-slate"}`}>
                  <Landmark className="h-5 w-5" />
                </span>
                <div className="min-w-40 flex-1">
                  <p className="font-display text-lg font-bold tracking-tight">{b.name}</p>
                  <p className="font-mono text-xs text-slate">{b.region} · Latency {b.latency}</p>
                </div>
                <Badge tone={isOn ? "green" : "neutral"}>{isOn ? "Connected" : "Available"}</Badge>
                <button
                  data-testid={`broker-toggle-${b.name.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => toggle(b.name)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all active:scale-95 ${
                    isOn ? "border border-edge bg-white text-ink hover:bg-mist" : "bg-ember text-white hover:brightness-110"
                  }`}>
                  {isOn ? <><Unplug className="h-3.5 w-3.5" /> Disconnect</> : <><Plug className="h-3.5 w-3.5" /> Connect</>}
                </button>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Shell>
  );
}

const WALLET_ACTIVITY = [
  { label: "Deposit via UPI", amt: "+₹10,000.00", time: "Today, 11:20", up: true },
  { label: "Activation fee", amt: "-₹2,499.00", time: "Yesterday, 16:42", up: false },
  { label: "Referral credit", amt: "+₹1,200.00", time: "12 Aug, 09:15", up: true },
];

export function WalletView({ onBack }) {
  const [balance, setBalance] = useState(4250.0);
  const deposit = (amt) => {
    setBalance((b) => +(b + amt).toFixed(2));
    toast.success(`₹${amt.toLocaleString("en-IN")} added to wallet`, { description: "Demo only — no real money moved." });
  };

  return (
    <Shell testid="wallet-view" onBack={onBack}
      title="Fund Wallet"
      desc="Add funds to your TradeSense wallet for subscriptions and activation fees.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="relative overflow-hidden rounded-2xl bg-ink p-7 text-paper shadow-panel">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-signal/15 blur-[60px]" />
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cloud">
              <Wallet className="h-4 w-4 text-signal" /> Wallet Balance
            </div>
            <p className="mt-3 font-mono text-4xl font-bold tracking-tight" data-testid="wallet-balance">
              ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {[500, 1000, 5000].map((amt) => (
                <button key={amt} data-testid={`wallet-quick-add-${amt}`} onClick={() => deposit(amt)}
                  className="rounded-full border border-paper/20 px-4 py-2 font-mono text-xs font-semibold transition-colors hover:bg-paper/10 active:scale-95">
                  + ₹{amt.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button data-testid="wallet-deposit-button" onClick={() => deposit(1000)}
                className="inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95">
                <ArrowDownToLine className="h-4 w-4" /> Deposit
              </button>
              <button data-testid="wallet-withdraw-button"
                onClick={() => toast.info("Withdrawals are disabled in this demo prototype")}
                className="inline-flex items-center gap-2 rounded-full border border-paper/20 px-6 py-3 text-sm font-semibold transition-colors hover:bg-paper/10 active:scale-95">
                <ArrowUpFromLine className="h-4 w-4" /> Withdraw
              </button>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-2">
          <div className="h-full rounded-2xl border border-edge bg-white p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">Recent Wallet Activity</p>
            <div className="mt-4 space-y-4">
              {WALLET_ACTIVITY.map((w, i) => (
                <div key={i} className="flex items-center justify-between border-b border-edge pb-3.5 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold">{w.label}</p>
                    <p className="font-mono text-[10px] text-slate">{w.time}</p>
                  </div>
                  <span className={`font-mono text-sm font-bold ${w.up ? "text-signal" : "text-rose-500"}`}>{w.amt}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </Shell>
  );
}

const TXNS = [
  { date: "13 Aug 14:32", sym: "RELIANCE", side: "BUY", qty: 50, px: "2,945.10", pnl: "+₹1,240", status: "Executed" },
  { date: "13 Aug 13:58", sym: "TCS", side: "SELL", qty: 25, px: "4,190.00", pnl: "+₹860", status: "Executed" },
  { date: "13 Aug 11:20", sym: "HDFCBANK", side: "BUY", qty: 100, px: "1,642.35", pnl: "-₹320", status: "Executed" },
  { date: "12 Aug 15:05", sym: "INFY", side: "SELL", qty: 40, px: "1,588.40", pnl: "+₹2,104", status: "Executed" },
  { date: "12 Aug 10:12", sym: "SBIN", side: "BUY", qty: 200, px: "810.25", pnl: "+₹470", status: "Executed" },
  { date: "11 Aug 14:47", sym: "TATAMOTORS", side: "BUY", qty: 75, px: "968.70", pnl: "-₹512", status: "Executed" },
  { date: "11 Aug 09:58", sym: "ITC", side: "SELL", qty: 150, px: "492.30", pnl: "+₹915", status: "Executed" },
];

export function TransactionsView({ onBack }) {
  const [filter, setFilter] = useState("ALL");
  const rows = TXNS.filter((t) => filter === "ALL" || t.side === filter);

  return (
    <Shell testid="transactions-view" onBack={onBack}
      title="Transactions"
      desc="Complete order and trade history across your connected brokers. Demo data only.">
      <Reveal>
        <div className="flex gap-2">
          {["ALL", "BUY", "SELL"].map((f) => (
            <button key={f} data-testid={`txn-filter-${f.toLowerCase()}`} onClick={() => setFilter(f)}
              className={`rounded-full px-5 py-2 font-mono text-xs font-bold transition-all active:scale-95 ${
                filter === f ? "bg-ink text-white" : "border border-edge bg-white text-slate hover:bg-mist"
              }`}>
              {f}
            </button>
          ))}
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-edge bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-edge bg-mist/60">
                  {["Date", "Symbol", "Side", "Qty", "Price", "P&L", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((t, i) => (
                  <tr key={i} data-testid={`txn-row-${i}`} className="border-b border-edge last:border-0 transition-colors hover:bg-mist/40">
                    <td className="px-5 py-4 font-mono text-xs text-slate">{t.date}</td>
                    <td className="px-5 py-4 font-mono text-sm font-bold">{t.sym}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${t.side === "BUY" ? "bg-signal/10 text-signal" : "bg-rose-500/10 text-rose-500"}`}>{t.side}</span>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm">{t.qty}</td>
                    <td className="px-5 py-4 font-mono text-sm">₹{t.px}</td>
                    <td className={`px-5 py-4 font-mono text-sm font-bold ${t.pnl.startsWith("+") ? "text-signal" : "text-rose-500"}`}>{t.pnl}</td>
                    <td className="px-5 py-4"><Badge tone="green">{t.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </Shell>
  );
}

const TOGGLES = [
  { key: "email", label: "Email Alerts", desc: "Order fills, stops, and daily summaries", on: true },
  { key: "sms", label: "SMS Alerts", desc: "Critical risk events only", on: false },
  { key: "tfa", label: "Two-Factor Authentication", desc: "Extra security on every login", on: true },
  { key: "squareoff", label: "Auto Square-Off", desc: "Close intraday positions at 15:15", on: true },
];

export function SettingsView({ onBack }) {
  const [flags, setFlags] = useState(Object.fromEntries(TOGGLES.map((t) => [t.key, t.on])));

  return (
    <Shell testid="settings-view" onBack={onBack}
      title="Settings"
      desc="Manage alerts, security, and platform risk limits. Changes apply instantly in this demo.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="rounded-2xl border border-edge bg-white p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">Notifications & Security</p>
            <div className="mt-5 space-y-5">
              {TOGGLES.map((t) => (
                <div key={t.key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">{t.label}</p>
                    <p className="text-xs text-slate">{t.desc}</p>
                  </div>
                  <Switch
                    data-testid={`settings-toggle-${t.key}`}
                    checked={flags[t.key]}
                    onCheckedChange={(v) => setFlags((f) => ({ ...f, [t.key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-edge bg-white p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">Risk Limits</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-semibold">Max Daily Loss (₹)</label>
                <input data-testid="settings-max-loss-input" type="number" defaultValue={5000}
                  className="mt-1.5 w-full rounded-xl border border-edge bg-paper px-4 py-3 font-mono text-sm outline-none focus:border-ember" />
              </div>
              <div>
                <label className="text-sm font-semibold">Max Exposure (%)</label>
                <input data-testid="settings-max-exposure-input" type="number" defaultValue={60}
                  className="mt-1.5 w-full rounded-xl border border-edge bg-paper px-4 py-3 font-mono text-sm outline-none focus:border-ember" />
              </div>
              <p className="text-xs leading-relaxed text-slate">
                Strategies auto-pause when limits are breached. You can resume manually anytime.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
      <Reveal delay={0.15}>
        <button data-testid="settings-save-button"
          onClick={() => toast.success("Settings saved", { description: "Demo only — preferences were not persisted." })}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-ember px-8 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95">
          <Save className="h-4 w-4" /> Save Settings
        </button>
      </Reveal>
    </Shell>
  );
}
