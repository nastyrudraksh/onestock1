import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Play, ShoppingCart, XCircle, TicketCheck, BadgeCheck, Upload, Check, X, Zap, RefreshCw, TrendingUp, TrendingDown, Minus, Plus, Settings } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Shell } from "./ModuleViews";
import { Reveal } from "../landing/Reveal";
import { AreaTrend, PnlBars, growthData } from "../landing/charts";

const COURSES = [
  { title: "Trading Basics", lessons: 12, duration: "3h 20m", level: "Beginner" },
  { title: "Strategy Automation 101", lessons: 8, duration: "2h 05m", level: "Beginner" },
  { title: "Risk Management Mastery", lessons: 10, duration: "2h 45m", level: "Intermediate" },
  { title: "Reading Market Structure", lessons: 14, duration: "4h 10m", level: "Advanced" },
];

export function LearnView({ onBack }) {
  return (
    <Shell testid="learn-view" onBack={onBack} title="Learn"
      desc="Short courses to help you get the most out of OneStock. Demo content.">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {COURSES.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.06} y={24}>
            <div data-testid={`course-${c.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="rounded-2xl border border-edge bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
              <span className="rounded-full bg-mist px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate">{c.level}</span>
              <h3 className="mt-4 font-display text-xl font-bold tracking-tight">{c.title}</h3>
              <p className="mt-1.5 font-mono text-xs text-slate">{c.lessons} lessons · {c.duration}</p>
              <button
                data-testid={`course-start-${i}`}
                onClick={() => toast.success(`Started "${c.title}"`, { description: "Demo only — no course content in this prototype." })}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white transition-all hover:brightness-125 active:scale-95">
                <Play className="h-3.5 w-3.5" /> Start Course
              </button>
            </div>
          </Reveal>
        ))}
      </div>
    </Shell>
  );
}

export function KycView({ onBack, onDone, done }) {
  const submit = (e) => {
    e.preventDefault();
    onDone();
  };
  return (
    <Shell testid="kyc-view" onBack={onBack} title="KYC Verification"
      desc="Verify your identity to activate live trading. This demo does not upload anything.">
      <Reveal>
        <div className="max-w-xl rounded-2xl border border-edge bg-white p-7">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">Verification Status</p>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${done ? "bg-signal/10 text-signal" : "bg-amber-500/10 text-amber-600"}`}>
              <BadgeCheck className="h-3.5 w-3.5" /> {done ? "Verified" : "Pending"}
            </span>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <input data-testid="kyc-name-input" type="text" required placeholder="Full name (as per PAN)"
              className="w-full rounded-xl border border-edge bg-paper px-4 py-3 text-sm outline-none focus:border-ember" />
            <input data-testid="kyc-pan-input" type="text" required placeholder="PAN number" maxLength={10}
              className="w-full rounded-xl border border-edge bg-paper px-4 py-3 font-mono text-sm uppercase outline-none focus:border-ember" />
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-edge bg-paper px-4 py-8 text-sm text-slate transition-colors hover:border-ember hover:text-ink">
              <Upload className="h-4 w-4" /> Upload ID proof (demo)
              <input data-testid="kyc-file-input" type="file" className="hidden" />
            </label>
            <button data-testid="kyc-submit-button" type="submit"
              className="w-full rounded-full bg-ember py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95">
              Submit for Verification
            </button>
          </form>
        </div>
      </Reveal>
    </Shell>
  );
}

const PRODUCTS = [
  { name: "Strategy Starter Pack", price: 999, desc: "5 ready-made automation templates" },
  { name: "Pro Market Scanner", price: 1499, desc: "Real-time screeners and alerts" },
  { name: "API Access Add-on", price: 1999, desc: "Programmatic order execution" },
];

export function ShopView({ onBack }) {
  return (
    <Shell testid="shop-view" onBack={onBack} title="Shop"
      desc="Add-ons and strategy packs for your account. Purchases are demo-only.">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {PRODUCTS.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.06} y={24}>
            <div data-testid={`product-${i}`} className="flex h-full flex-col rounded-2xl border border-edge bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
              <h3 className="font-display text-lg font-bold tracking-tight">{p.name}</h3>
              <p className="mt-1.5 flex-1 text-sm text-slate">{p.desc}</p>
              <p className="mt-4 font-mono text-2xl font-bold">₹{p.price.toLocaleString("en-IN")}</p>
              <button
                data-testid={`product-buy-${i}`}
                onClick={() => toast.success(`${p.name} purchased`, { description: "Demo only — no payment was processed." })}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-ember py-2.5 text-xs font-semibold text-white transition-all hover:brightness-110 active:scale-95">
                <ShoppingCart className="h-3.5 w-3.5" /> Buy Now
              </button>
            </div>
          </Reveal>
        ))}
      </div>
    </Shell>
  );
}

const ORDERS = [
  { date: "13 Aug 14:32", sym: "RELIANCE", side: "BUY", qty: 50, px: "2,945.10", status: "Executed" },
  { date: "13 Aug 13:58", sym: "TCS", side: "SELL", qty: 25, px: "4,190.00", status: "Executed" },
  { date: "13 Aug 12:05", sym: "INFY", side: "BUY", qty: 40, px: "1,584.20", status: "Pending" },
  { date: "13 Aug 11:20", sym: "HDFCBANK", side: "BUY", qty: 100, px: "1,642.35", status: "Executed" },
  { date: "12 Aug 15:05", sym: "SBIN", side: "SELL", qty: 200, px: "812.60", status: "Executed" },
  { date: "12 Aug 10:12", sym: "ITC", side: "BUY", qty: 150, px: "491.80", status: "Cancelled" },
];

export function OrdersView({ onBack }) {
  const [filter, setFilter] = useState("ALL");
  const rows = ORDERS.filter((o) => filter === "ALL" || o.status === filter.toUpperCase());

  const exportCsv = () => {
    const data = [["Date", "Symbol", "Side", "Qty", "Price", "Status"], ...rows.map((o) => [o.date, o.sym, o.side, o.qty, o.px, o.status])];
    const blob = new Blob([data.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "onestock-orders-demo.csv";
    a.click();
    toast.success("CSV exported", { description: "Demo data only." });
  };

  return (
    <Shell testid="orders-view" onBack={onBack} title="Order History"
      desc="Every order placed through your account. Demo data only.">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {["ALL", "EXECUTED", "PENDING", "CANCELLED"].map((f) => (
              <button key={f} data-testid={`order-filter-${f.toLowerCase()}`} onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 font-mono text-[11px] font-bold transition-all active:scale-95 ${
                  filter === f ? "bg-ink text-white" : "border border-edge bg-white text-slate hover:bg-mist"
                }`}>
                {f}
              </button>
            ))}
          </div>
          <button data-testid="orders-export-button" onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-full border border-edge bg-white px-4 py-2 text-xs font-semibold transition-colors hover:bg-mist active:scale-95">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-edge bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-edge bg-mist/60">
                  {["Date", "Symbol", "Side", "Qty", "Price", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((o, i) => (
                  <tr key={i} data-testid={`order-row-${i}`} className="border-b border-edge last:border-0 hover:bg-mist/40">
                    <td className="px-5 py-4 font-mono text-xs text-slate">{o.date}</td>
                    <td className="px-5 py-4 font-mono text-sm font-bold">{o.sym}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${o.side === "BUY" ? "bg-signal/10 text-signal" : "bg-rose-500/10 text-rose-500"}`}>{o.side}</span>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm">{o.qty}</td>
                    <td className="px-5 py-4 font-mono text-sm">₹{o.px}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase ${
                        o.status === "Executed" ? "bg-signal/10 text-signal" : o.status === "Pending" ? "bg-amber-500/10 text-amber-600" : "bg-mist text-slate"
                      }`}>{o.status}</span>
                    </td>
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

export function PnlView({ onBack }) {
  const cards = [
    { label: "Total P&L", value: "+₹12,480", up: true },
    { label: "Today", value: "+₹842.50", up: true },
    { label: "This Week", value: "-₹1,135", up: false },
    { label: "This Month", value: "+₹6,920", up: true },
  ];
  return (
    <Shell testid="pnl-view" onBack={onBack} title="P & L"
      desc="Your profit and loss at a glance. Demo data only.">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c, i) => (
          <Reveal key={c.label} delay={i * 0.05} y={20}>
            <div data-testid={`pnl-card-${i}`} className="rounded-2xl border border-edge bg-white p-5">
              <p className="font-mono text-[9px] uppercase tracking-wider text-slate">{c.label}</p>
              <p className={`mt-2 font-mono text-xl font-bold ${c.up ? "text-signal" : "text-rose-500"}`}>{c.value}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.15}>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-edge bg-white p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">Equity Curve · 12M</p>
            <div className="mt-3"><AreaTrend data={growthData} height={180} /></div>
          </div>
          <div className="rounded-2xl border border-edge bg-white p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">Daily P&L · This Week (₹K)</p>
            <div className="mt-3"><PnlBars height={180} /></div>
          </div>
        </div>
      </Reveal>
    </Shell>
  );
}

const PNL_HISTORY = [
  { m: "August 2026", trades: 34, win: "71%", pnl: "+₹6,920" },
  { m: "July 2026", trades: 41, win: "66%", pnl: "+₹4,215" },
  { m: "June 2026", trades: 29, win: "62%", pnl: "-₹1,840" },
  { m: "May 2026", trades: 38, win: "68%", pnl: "+₹3,185" },
];

export function PnlHistoryView({ onBack }) {
  return (
    <Shell testid="pnl-history-view" onBack={onBack} title="P & L History"
      desc="Month-by-month performance. Demo data only.">
      <Reveal>
        <div className="overflow-hidden rounded-2xl border border-edge bg-white">
          <table className="w-full min-w-[480px] text-left">
            <thead>
              <tr className="border-b border-edge bg-mist/60">
                {["Month", "Trades", "Win Rate", "Net P&L"].map((h) => (
                  <th key={h} className="px-5 py-3.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PNL_HISTORY.map((r, i) => (
                <tr key={i} data-testid={`pnl-history-row-${i}`} className="border-b border-edge last:border-0 hover:bg-mist/40">
                  <td className="px-5 py-4 text-sm font-semibold">{r.m}</td>
                  <td className="px-5 py-4 font-mono text-sm">{r.trades}</td>
                  <td className="px-5 py-4 font-mono text-sm">{r.win}</td>
                  <td className={`px-5 py-4 font-mono text-sm font-bold ${r.pnl.startsWith("+") ? "text-signal" : "text-rose-500"}`}>{r.pnl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </Shell>
  );
}

const OPEN_TRADES = [
  { sym: "RELIANCE", side: "BUY", qty: 50, entry: "2,945.10", ltp: "2,969.90", pnl: "+₹1,240" },
  { sym: "HDFCBANK", side: "BUY", qty: 100, entry: "1,642.35", ltp: "1,639.15", pnl: "-₹320" },
  { sym: "INFY", side: "SELL", qty: 40, entry: "1,588.40", ltp: "1,575.80", pnl: "+₹504" },
];

export function TradesView({ onBack }) {
  const [trades, setTrades] = useState(OPEN_TRADES);
  const close = (sym) => {
    setTrades((t) => t.filter((x) => x.sym !== sym));
    toast.success(`${sym} position closed`, { description: "Demo only — no real order was placed." });
  };
  return (
    <Shell testid="trades-view" onBack={onBack} title="My Trades"
      desc="Open positions right now. Closing a trade is demo-only.">
      <Reveal>
        <div className="space-y-3">
          {trades.length === 0 && (
            <p className="rounded-2xl border border-edge bg-white p-8 text-center text-sm text-slate" data-testid="trades-empty">
              No open positions.
            </p>
          )}
          {trades.map((t) => (
            <div key={t.sym} data-testid={`trade-${t.sym.toLowerCase()}`}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-edge bg-white p-5">
              <span className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${t.side === "BUY" ? "bg-signal/10 text-signal" : "bg-rose-500/10 text-rose-500"}`}>{t.side}</span>
              <span className="font-mono text-sm font-bold">{t.sym}</span>
              <span className="font-mono text-xs text-slate">x{t.qty}</span>
              <span className="font-mono text-xs text-slate">Entry ₹{t.entry}</span>
              <span className="font-mono text-xs text-slate">LTP ₹{t.ltp}</span>
              <span className={`ml-auto font-mono text-sm font-bold ${t.pnl.startsWith("+") ? "text-signal" : "text-rose-500"}`}>{t.pnl}</span>
              <button data-testid={`trade-close-${t.sym.toLowerCase()}`} onClick={() => close(t.sym)}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-500 transition-all hover:bg-rose-500 hover:text-white active:scale-95">
                <XCircle className="h-3.5 w-3.5" /> Close
              </button>
            </div>
          ))}
        </div>
      </Reveal>
    </Shell>
  );
}

export function TicketsView({ onBack }) {
  const [tickets, setTickets] = useState([
    { subject: "Broker reconnect issue", status: "Resolved", date: "10 Aug" },
    { subject: "Question about activation fee", status: "Open", date: "12 Aug" },
  ]);
  const submit = (e) => {
    e.preventDefault();
    const subject = e.target.subject.value.trim();
    if (!subject) return;
    setTickets((t) => [{ subject, status: "Open", date: "Today" }, ...t]);
    e.target.reset();
    toast.success("Ticket created", { description: "Demo only — nothing was sent to a support team." });
  };
  return (
    <Shell testid="tickets-view" onBack={onBack} title="Support Tickets"
      desc="Raise a ticket and track its status. Demo only.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Reveal>
          <form onSubmit={submit} className="rounded-2xl border border-edge bg-white p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">New Ticket</p>
            <input name="subject" data-testid="ticket-subject-input" type="text" required placeholder="Subject"
              className="mt-4 w-full rounded-xl border border-edge bg-paper px-4 py-3 text-sm outline-none focus:border-ember" />
            <textarea data-testid="ticket-message-input" rows={4} placeholder="Describe your issue..."
              className="mt-3 w-full rounded-xl border border-edge bg-paper px-4 py-3 text-sm outline-none focus:border-ember" />
            <button data-testid="ticket-submit-button" type="submit"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95">
              <TicketCheck className="h-4 w-4" /> Create Ticket
            </button>
          </form>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-edge bg-white p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">Your Tickets</p>
            <div className="mt-4 space-y-3">
              {tickets.map((t, i) => (
                <div key={i} data-testid={`ticket-row-${i}`} className="flex items-center justify-between border-b border-edge pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold">{t.subject}</p>
                    <p className="font-mono text-[10px] text-slate">{t.date}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase ${t.status === "Open" ? "bg-amber-500/10 text-amber-600" : "bg-signal/10 text-signal"}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </Shell>
  );
}


export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const MinBtn = ({ id, collapsed, onClick, dark = false }) => (
  <button
    data-testid={id}
    onClick={onClick}
    aria-label={collapsed ? "Expand panel" : "Minimize panel"}
    className={`flex h-6 w-6 items-center justify-center rounded-md border transition-colors ${
      dark ? "border-night-line bg-white/5 text-cloud hover:bg-white/10" : "border-edge bg-white text-slate hover:bg-mist hover:text-ink"
    }`}
  >
    {collapsed ? <Plus className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
  </button>
);

export const Collapse = ({ open, children }) => (
  <AnimatePresence initial={false}>
    {open && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

export const INSTRUMENTS = [
  { name: "NIFTY 50 OPTION", px: "24,812.75", chg: "+0.84%" },
  { name: "NIFTY 50 FUTURE", px: "24,905.30", chg: "+0.79%" },
  { name: "BANK NIFTY OPTION", px: "51,240.30", chg: "+1.12%" },
  { name: "BANK NIFTY FUTURE", px: "51,388.00", chg: "+1.05%" },
  { name: "SENSEX", px: "81,506.20", chg: "+0.61%" },
  { name: "SENSEX FUTURE", px: "81,842.75", chg: "+0.58%" },
  { name: "FINNIFTY OPTION", px: "22,564.10", chg: "-0.21%" },
  { name: "FINNIFTY FUTURE", px: "22,835.45", chg: "+0.33%" },
  { name: "MIDCAP", px: "58,412.40", chg: "-0.22%" },
  { name: "MIDCAP FUTURE", px: "58,631.10", chg: "-0.18%" },
  { name: "BTC", px: "1,04,82,300", chg: "+2.14%" },
  { name: "BTC FUTURE", px: "1,05,10,850", chg: "+2.02%" },
  { name: "ETHUSD OPTION", px: "3,84,120", chg: "+1.46%" },
  { name: "ETH FUTURE", px: "3,86,540", chg: "+1.31%" },
  { name: "SILVER OPTION", px: "92,480", chg: "-0.34%" },
  { name: "SILVER FUTURE", px: "92,915", chg: "-0.29%" },
  { name: "GOLD OPTION", px: "78,240", chg: "+0.42%" },
  { name: "GOLD FUTURE", px: "78,690", chg: "+0.38%" },
  { name: "CRUDEOIL", px: "6,842", chg: "-1.08%" },
  { name: "NATURAL GAS", px: "248.60", chg: "+0.96%" },
];

const hashOf = (s) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

let audioCtx;
export const playAlertBeep = () => {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const t = audioCtx.currentTime;
    [880, 1174.66].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.08, t + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.12 + 0.11);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t + i * 0.12);
      osc.stop(t + i * 0.12 + 0.12);
    });
  } catch (e) { /* audio unavailable */ }
};

const INDICATOR_NAMES = ["RSI (14)", "MACD", "EMA 9/21 Cross", "VWAP", "Supertrend"];

export const buildSignal = (m, tick = 0, enabled = [true, true, true, true, true], oiBias = 0) => {
  const h = hashOf(m.name) + tick * 7;
  const num = parseFloat(m.px.replace(/,/g, ""));
  const fmt = (n) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  const all = INDICATOR_NAMES.map((n, i) => {
    const v = (h >> (i + 1)) % 3;
    return { name: n, state: v === 0 ? "Neutral" : v === 1 ? "Bullish" : "Bearish" };
  });
  const active = all.filter((_, i) => enabled[i]);
  const list = active.length ? active : all;
  const bull = list.filter((x) => x.state === "Bullish").length;
  const bear = list.filter((x) => x.state === "Bearish").length;
  const buyRaw = bull >= bear;
  // With live OI bias: direction follows the real Put−Call OI skew (PCR > 1 = puts dominate = CALL bias),
  // with a small per-instrument noise factor so cards don't flip in perfect unison.
  const buy = oiBias ? (oiBias > 0 ? (h % 100) >= 18 : (h % 100) < 18) : buyRaw;
  return {
    dir: buy ? "BUY CALL" : "BUY PUT",
    buy,
    confidence: Math.min(98, Math.round(55 + (Math.max(bull, bear) / list.length) * 40) + (oiBias ? 3 : 0)),
    entry: fmt(num),
    target: fmt(buy ? num * 1.012 : num * 0.988),
    stop: fmt(buy ? num * 0.994 : num * 1.006),
    indicators: list,
    oiInfluenced: !!oiBias,
  };
};

export function SignalDrawer({ instrument, tick, live, onToggleLive, enabled, onToggleIndicator, onRefresh, onClose, onExecuteTrade, oiBias = 0 }) {
  const sig = instrument ? buildSignal(instrument, tick, enabled, oiBias) : null;
  const [quantity, setQuantity] = useState(25);

  useEffect(() => {
    setQuantity(25);
  }, [instrument?.name]);

  return (
    <AnimatePresence>
      {instrument && sig && (
        <motion.aside
          data-testid="signal-drawer"
          data-lenis-prevent
          initial={{ opacity: 0, y: 40, rotate: 5 }}
          animate={{ opacity: 1, y: 0, rotate: 1.2 }}
          exit={{ opacity: 0, y: 40, rotate: 5 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "top right" }}
          className="fixed bottom-4 right-4 top-20 z-50 w-[calc(100%-2rem)] max-w-sm overflow-y-auto rounded-lg bg-[#FFF6D6] p-5 pt-7 shadow-[0_28px_60px_-12px_rgba(10,15,28,0.35)] ring-1 ring-amber-200"
        >
          <div className="pointer-events-none absolute -top-2.5 left-1/2 h-5 w-24 -translate-x-1/2 -rotate-2 rounded-sm bg-white/70 shadow-sm ring-1 ring-black/5" />
            <div className="flex items-start justify-between">
              <div>
                <p className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-slate">
                  <Zap className="h-3.5 w-3.5 text-ember" /> Algo Signal · Test Model
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold tracking-tight">{instrument.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  data-testid="signal-live-toggle"
                  onClick={onToggleLive}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    live ? "bg-signal/10 text-signal" : "bg-mist text-slate"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-signal animate-pulse-dot" : "bg-slate"}`} />
                  {live ? "Live" : "Paused"}
                </button>
                <button
                  data-testid="signal-close-button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-edge transition-colors hover:bg-mist"
                  aria-label="Close signals"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className={`mt-6 rounded-2xl p-5 transition-colors duration-500 ${sig.buy ? "bg-signal" : "bg-rose-500"}`}>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">Algo Direction</p>
              <p className="mt-1 font-display text-3xl font-bold tracking-tight text-white transition-colors duration-500" data-testid="signal-direction">
                {sig.dir}
              </p>
              <p className="mt-1 font-mono text-xs text-white/70">LTP ₹{instrument.px} · {instrument.chg}</p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {[
                { label: "Entry", value: sig.entry },
                { label: "Target", value: sig.target, green: true },
                { label: "Stop Loss", value: sig.stop, red: true },
              ].map((f) => (
                <div key={f.label} className="rounded-xl border border-edge bg-paper p-3">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-slate">{f.label}</p>
                  <p className={`mt-1 font-mono text-sm font-bold ${f.green ? "text-signal" : f.red ? "text-rose-500" : "text-ink"}`}>
                    ₹{f.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">Algo Confidence</p>
                <span className="font-mono text-xs font-bold text-ink" data-testid="signal-confidence">{sig.confidence}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-mist">
                <motion.div
                  key={`${instrument.name}-${tick}-${enabled.join("")}`}
                  className={`h-full rounded-full transition-colors duration-500 ${sig.buy ? "bg-signal" : "bg-rose-500"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${sig.confidence}%` }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>

            <div className="mt-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">Signal Inputs · Custom Algo</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {INDICATOR_NAMES.map((n, i) => (
                  <button
                    key={n}
                    data-testid={`algo-toggle-${i}`}
                    onClick={() => onToggleIndicator(i)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold transition-all active:scale-95 ${
                      enabled[i] ? "border-ember bg-ember/10 text-ember" : "border-edge bg-white text-slate hover:bg-mist"
                    }`}
                  >
                    {enabled[i] && <Check className="h-3 w-3" strokeWidth={3} />}
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-edge bg-paper p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">Lot Quantity</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 5))}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-edge bg-white text-sm font-bold text-slate"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    className="w-16 rounded-lg border border-edge bg-white px-2 py-1.5 text-center font-mono text-sm font-bold text-ink outline-none focus:border-ember"
                    aria-label="Trade quantity"
                  />
                  <button
                    onClick={() => setQuantity((q) => q + 5)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-edge bg-white text-sm font-bold text-slate"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                data-testid="signal-execute-button"
                onClick={() => {
                  const fn = sig.buy ? toast.success : toast.error;
                  // infer lot size (demo heuristic): options/futures use 75, equities use 1
                  const lotSize = /OPTION|FUTURE/i.test(instrument.name) ? 75 : 1;
                  const trade = {
                    symbol: instrument.name,
                    action: sig.buy ? "BUY" : "SELL",
                    type: sig.dir,
                    quantity,
                    lotSize,
                    contracts: quantity * lotSize,
                    price: Number(instrument.px.replace(/,/g, "")),
                    time: new Date().toLocaleTimeString("en-IN", { hour12: false }),
                  };
                  onExecuteTrade?.(trade);
                  fn(`${sig.dir} ${instrument.name} placed`, {
                    description: `Demo order: ${trade.action} ${trade.quantity} lots @ ₹${trade.price.toLocaleString("en-IN")}`,
                    style: sig.buy
                      ? { background: "#00D084", color: "#06281C", border: "1px solid #00B573" }
                      : { background: "#F43F5E", color: "#FFFFFF", border: "1px solid #E11D48" },
                  });
                }}
                className="flex-1 rounded-full bg-ember py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95"
              >
                Execute Demo Trade
              </button>
              <button
                data-testid="signal-refresh-button"
                onClick={onRefresh}
                className="inline-flex items-center gap-2 rounded-full border border-edge px-5 py-3 text-sm font-semibold transition-colors hover:bg-mist active:scale-95"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>

            <p className="mt-5 text-[11px] leading-relaxed text-slate">
              {sig.oiInfluenced
                ? "Test model — direction is biased by the LIVE Put−Call OI skew (PCR) from Angel One SmartAPI; indicator votes remain simulated. Not investment advice."
                : "Test model only — signals are randomly generated demo data and do not use real market feeds. This is not investment advice."}
            </p>
          </motion.aside>
      )}
    </AnimatePresence>
  );
}

const PLANS = [
  { name: "MONTHLY PLAN", price: "₹989", per: "/month", cta: "Start Free", popular: false,
    features: ["Basic analytics", "Portfolio monitoring", "Market insights", "Email support"] },
  { name: "QUARTERLY", price: "₹2,499", per: "/quarter", cta: "Get Started", popular: true,
    features: ["Advanced analytics", "Automated strategies", "Broker connectivity", "Risk management", "Priority support"] },
  { name: "HALF YEARLY", price: "₹4,499", per: "/6 months", cta: "Get Started", popular: false,
    features: ["Everything in Quarterly", "Multiple accounts", "Advanced reporting", "Strategy templates"] },
  { name: "YEARLY", price: "₹7,999", per: "/year", cta: "Get Started", popular: false,
    features: ["Everything in Half Yearly", "Dedicated support", "API access", "Quarterly strategy reviews"] },
  { name: "LIFE TIME", price: "₹19,999", per: " one-time", cta: "Contact Sales", popular: false,
    features: ["Everything in Yearly", "Lifetime updates", "Unlimited strategies", "Founding member badge"] },
];

const TIERS = [
  { name: "REGULAR", tag: "Included", cta: "Select", popular: false,
    features: ["Standard execution speed", "1 broker account", "Email support", "Community access"] },
  { name: "PREMIUM", tag: "Add-on", cta: "Select", popular: true,
    features: ["Priority execution", "3 broker accounts", "Priority support", "Advanced alerts"] },
  { name: "SEPARATE DISCUSSION", tag: "Custom", cta: "Contact Us", popular: false,
    features: ["Custom requirements", "Dedicated manager", "Custom integrations"] },
  { name: "VIP", tag: "Add-on", cta: "Select", popular: false,
    features: ["Fastest execution", "5 broker accounts", "24/7 priority line", "Strategy review calls"] },
  { name: "VVIP", tag: "Add-on", cta: "Select", popular: false,
    features: ["Institutional routing", "Unlimited accounts", "Dedicated dealer desk", "Custom SLAs"] },
];

const PickCard = ({ item, popular, tag, onAction, testid }) => (
  <div
    data-testid={testid}
    className={`relative flex h-full flex-col rounded-2xl border bg-white p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift ${
      popular ? "border-ember shadow-glow-ember" : "border-edge"
    }`}
  >
    {popular && (
      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ember px-4 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white">
        Most Popular
      </span>
    )}
    <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate">{item.name}</p>
    <div className="mt-4 flex items-baseline gap-1">
      <span className="font-display text-4xl font-bold tracking-tighter">{item.price || item.tag}</span>
      {item.per && <span className="font-mono text-sm text-slate">{item.per}</span>}
    </div>
    <ul className="mt-6 flex-1 space-y-3">
      {item.features.map((f) => (
        <li key={f} className="flex items-center gap-2.5">
          <span className={`flex h-5 w-5 items-center justify-center rounded-full ${popular ? "bg-ember/10" : "bg-signal/10"}`}>
            <Check className={`h-3 w-3 ${popular ? "text-ember" : "text-signal"}`} strokeWidth={3} />
          </span>
          <span className="text-sm text-ink">{f}</span>
        </li>
      ))}
    </ul>
    <button
      data-testid={`${testid}-cta`}
      onClick={() => onAction(item)}
      className={`mt-8 w-full rounded-full py-3.5 text-sm font-semibold transition-all duration-200 active:scale-95 ${
        popular ? "bg-ember text-white hover:brightness-110" : "border border-ink/10 bg-white text-ink hover:bg-ink/5"
      }`}
    >
      {item.cta}
    </button>
  </div>
);

export function PlanView({ onBack }) {
  const select = (p) =>
    p.cta === "Contact Sales"
      ? toast.info("Sales request noted", { description: "Demo only — our team will reach out." })
      : toast.success(`${p.name} selected`, { description: `Demo checkout at ${p.price}${p.per} — no payment processed.` });

  return (
    <Shell testid="plan-view" onBack={onBack} title="Monthly Plan"
      desc="Pick a subscription duration. Prices shown are demo content.">
      <div className="grid grid-cols-1 gap-6 pt-3 sm:grid-cols-2 xl:grid-cols-3">
        {PLANS.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.06} y={30}>
            <PickCard item={p} popular={p.popular} onAction={select} testid={`plan-card-${slug(p.name)}`} />
          </Reveal>
        ))}
      </div>
    </Shell>
  );
}

export function TierView({ onBack }) {
  const select = (t) =>
    t.cta === "Contact Us"
      ? toast.info("Separate discussion requested", { description: "Demo only — our team will reach out." })
      : toast.success(`${t.name} tier selected`, { description: "Demo only — no account change was made." });

  return (
    <Shell testid="tier-view" onBack={onBack} title="Account Tier"
      desc="Choose the service tier for your account. Demo content only.">
      <div className="grid grid-cols-1 gap-6 pt-3 sm:grid-cols-2 xl:grid-cols-3">
        {TIERS.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.06} y={30}>
            <PickCard item={t} popular={t.popular} onAction={select} testid={`tier-card-${slug(t.name)}`} />
          </Reveal>
        ))}
      </div>
    </Shell>
  );
}

const NIFTY_STOCKS = [
  { name: "RELIANCE", chg: "+1.24%" }, { name: "TCS", chg: "+0.67%" }, { name: "HDFCBANK", chg: "-0.45%" },
  { name: "INFY", chg: "+1.08%" }, { name: "ICICIBANK", chg: "+0.32%" }, { name: "SBIN", chg: "-0.21%" },
  { name: "TATAMOTORS", chg: "-0.85%" }, { name: "ITC", chg: "+0.18%" }, { name: "LT", chg: "+0.74%" },
  { name: "AXISBANK", chg: "-0.62%" }, { name: "KOTAKBANK", chg: "+0.29%" }, { name: "HINDUNILVR", chg: "-0.15%" },
  { name: "BAJFINANCE", chg: "+1.62%" }, { name: "MARUTI", chg: "+0.51%" }, { name: "SUNPHARMA", chg: "-0.38%" },
  { name: "TITAN", chg: "+0.92%" }, { name: "ULTRACEMCO", chg: "+0.44%" }, { name: "NTPC", chg: "-0.27%" },
  { name: "POWERGRID", chg: "+0.13%" }, { name: "ONGC", chg: "-0.96%" }, { name: "TATASTEEL", chg: "+1.15%" },
  { name: "JSWSTEEL", chg: "+0.83%" }, { name: "ADANIENT", chg: "-1.24%" }, { name: "HCLTECH", chg: "+0.57%" },
  { name: "BHARTIARTL", chg: "+0.66%" }, { name: "ASIANPAINT", chg: "-0.33%" }, { name: "DMART", chg: "+0.41%" },
  { name: "WIPRO", chg: "+0.95%" }, { name: "TECHM", chg: "-0.54%" }, { name: "HINDZINC", chg: "+1.08%" },
  { name: "COALINDIA", chg: "-0.18%" }, { name: "BPCL", chg: "+0.27%" }, { name: "IOC", chg: "-0.61%" },
  { name: "HEROMOTOCO", chg: "+0.48%" }, { name: "EICHERMOT", chg: "+1.31%" }, { name: "BAJAJ-AUTO", chg: "-0.29%" },
  { name: "TVSMOTOR", chg: "+0.72%" }, { name: "CIPLA", chg: "-0.44%" }, { name: "DRREDDY", chg: "+0.36%" },
  { name: "DIVISLAB", chg: "+0.89%" }, { name: "APOLLOHOSP", chg: "-0.52%" }, { name: "BRITANNIA", chg: "+0.21%" },
  { name: "NESTLEIND", chg: "-0.12%" }, { name: "TATACONSUM", chg: "+0.58%" }, { name: "HAVELLS", chg: "-0.67%" },
  { name: "PIDILITIND", chg: "+0.33%" }, { name: "VEDL", chg: "-0.94%" }, { name: "HINDALCO", chg: "+1.42%" },
  { name: "GRASIM", chg: "-0.26%" }, { name: "INDUSINDBK", chg: "+0.78%" },
];

export function NiftyStocksBoard({ stocks, selectedIndex = "NIFTY 50", compact = false, collapsed = false, onToggle }) {
  const effectiveStocks = stocks || (selectedIndex === "NIFTY 50" ? NIFTY_STOCKS : NIFTY_STOCKS.slice(0, 30));
  const up = effectiveStocks.filter((s) => s.chg.startsWith("+"));
  const down = effectiveStocks.filter((s) => !s.chg.startsWith("+"));

  const stockRow = (s) => {
    const gain = s.chg.startsWith("+");
    return (
      <div
        key={s.name}
        data-testid={`stock-${slug(s.name)}`}
        className={`flex items-center justify-between rounded-sm px-1 py-0.5 ${gain ? "bg-signal/5" : "bg-rose-500/5"}`}
      >
        <span className="font-mono text-[8px] font-bold text-ink">{s.name}</span>
        <span className={`font-mono text-[7px] font-semibold ${gain ? "text-signal" : "text-rose-500"}`}>{s.chg}</span>
      </div>
    );
  };

  if (compact) {
    return (
      <div className="rounded-sm border border-edge bg-white p-1" data-testid="nifty-stocks-board">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[7px] uppercase tracking-[0.18em] text-slate">Nifty 50 Stocks</p>
          {onToggle && <MinBtn id="min-stocks" collapsed={collapsed} onClick={onToggle} />}
        </div>
        <div className="mt-1 flex items-center justify-between font-mono text-[7px] font-bold">
          <span className="text-signal" data-testid="advances-count">Advance {up.length}</span>
          <span className="text-rose-500" data-testid="declines-count">Decline {down.length}</span>
        </div>
        <div className="mt-0.5 flex h-1.5 overflow-hidden rounded-full" data-testid="advance-decline-bar">
          <div className="bg-signal transition-all duration-700" style={{ width: `${(up.length / effectiveStocks.length) * 100}%` }} />
          <div className="bg-rose-500 transition-all duration-700" style={{ width: `${(down.length / effectiveStocks.length) * 100}%` }} />
        </div>
        <Collapse open={!collapsed}>
          <div className="mt-1 max-h-[240px] overflow-y-auto pr-1" data-lenis-prevent>
            <div className="grid grid-cols-2 gap-1">
              <div>
                <p className="mb-1 border-b border-signal/20 pb-0.5 font-mono text-[7px] font-bold uppercase tracking-[0.18em] text-signal">
                  Advance
                </p>
                <div className="space-y-1">{up.map(stockRow)}</div>
              </div>
              <div>
                <p className="mb-1 border-b border-rose-500/20 pb-0.5 font-mono text-[7px] font-bold uppercase tracking-[0.18em] text-rose-500">
                  Decline
                </p>
                <div className="space-y-1">{down.map(stockRow)}</div>
              </div>
            </div>
          </div>
        </Collapse>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-edge bg-white p-3" data-testid="nifty-stocks-board">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate">Nifty 50 Stocks · Advance / Decline</p>
        <div className="flex items-center gap-2 font-mono text-[9px] font-bold">
          <span className="text-signal" data-testid="advances-count">Advance {up.length}</span>
          <span className="text-rose-500" data-testid="declines-count">Decline {down.length}</span>
        </div>
      </div>
      <div className="mt-2 flex h-2.5 overflow-hidden rounded-full" data-testid="advance-decline-bar">
      <div className="bg-signal transition-all duration-700" style={{ width: `${(up.length / effectiveStocks.length) * 100}%` }} />
      <div className="bg-rose-500 transition-all duration-700" style={{ width: `${(down.length / effectiveStocks.length) * 100}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1.5 border-b border-signal/20 pb-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-signal">
            Advance · Bullish ({up.length})
          </p>
          <div className="space-y-1">{up.map(stockRow)}</div>
        </div>
        <div>
          <p className="mb-1.5 border-b border-rose-500/20 pb-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-rose-500">
            Decline · Bearish ({down.length})
          </p>
          <div className="space-y-1">{down.map(stockRow)}</div>
        </div>
      </div>
    </div>
  );
}

export function OiView({ onBack }) {
  const rows = INSTRUMENTS.map((m) => {
    const support = 30 + (hashOf(m.name) % 41);
    return {
      ...m,
      support,
      oi: (12 + (hashOf(m.name) % 80)) / 10,
      oiChg: ((hashOf(m.name) % 17) - 8) / 2,
    };
  });

  return (
    <Shell testid="oi-view" onBack={onBack} title="Open Interest (OI)"
      desc="See what percent of traders are positioned at support versus resistance for each market. Demo data only.">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rows.map((r, i) => {
          const resistance = 100 - r.support;
          const supportWins = r.support >= resistance;
          return (
            <Reveal key={r.name} delay={Math.min(i * 0.04, 0.3)} y={20}>
              <div data-testid={`oi-card-${slug(r.name)}`} className="rounded-2xl border border-edge bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs font-bold text-ink">{r.name}</p>
                  <span className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${supportWins ? "bg-signal/10 text-signal" : "bg-rose-500/10 text-rose-500"}`}>
                    {supportWins ? "Support Dominates" : "Resistance Dominates"}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 font-mono text-[10px] text-slate">
                  <span>OI {r.oi.toFixed(1)}L contracts</span>
                  <span className={r.oiChg >= 0 ? "text-signal" : "text-rose-500"}>
                    {r.oiChg >= 0 ? "+" : ""}{r.oiChg.toFixed(1)}% today
                  </span>
                </div>
                <div className="mt-4 flex h-3 overflow-hidden rounded-full">
                  <motion.div
                    className="bg-signal"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${r.support}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <motion.div
                    className="bg-rose-500"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${resistance}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-between font-mono text-[11px] font-bold">
                  <span className="text-signal" data-testid={`oi-support-${slug(r.name)}`}>Support {r.support}%</span>
                  <span className="text-rose-500" data-testid={`oi-resistance-${slug(r.name)}`}>Resistance {resistance}%</span>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
      <p className="mt-6 text-[11px] leading-relaxed text-slate">
        Percentages are randomly generated demo data for the test model and do not represent real trader positioning.
      </p>
    </Shell>
  );
}

export function OiChart() {
  const data = INSTRUMENTS.map((m) => {
    const support = 30 + (hashOf(m.name) % 41);
    return { name: m.name, support, resistance: 100 - support };
  });
  const chartHeight = Math.min(300, Math.max(180, data.length * 14));
  return (
    <div className="rounded-xl border border-edge bg-white p-3" data-testid="oi-chart">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate">OI · Support vs Resistance</p>
        <div className="flex items-center gap-2 font-mono text-[9px] font-bold">
          <span className="inline-flex items-center gap-1 text-signal"><span className="h-2 w-2 rounded-sm bg-signal" /> Support %</span>
          <span className="inline-flex items-center gap-1 text-rose-500"><span className="h-2 w-2 rounded-sm bg-rose-500" /> Resistance %</span>
        </div>
      </div>
      <div className="mt-3 min-w-0 overflow-hidden" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 4, bottom: 0, left: 0 }} barCategoryGap="22%">
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category" dataKey="name" width={82}
              tick={{ fontSize: 8, fontFamily: "'JetBrains Mono', monospace", fill: "#6B7280", fontWeight: 600 }}
              axisLine={false} tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(10,15,28,0.04)" }}
              contentStyle={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, borderRadius: 8, border: "1px solid #E5E7EB" }}
              formatter={(v, k) => [`${v}%`, k === "support" ? "Support" : "Resistance"]}
            />
            <Bar dataKey="support" stackId="oi" fill="#00D084" isAnimationActive radius={[4, 0, 0, 4]} />
            <Bar dataKey="resistance" stackId="oi" fill="#F43F5E" isAnimationActive radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-slate">
        Demo data — support versus resistance by market.
      </p>
    </div>
  );
}

export const OI_STRIKES = Array.from({ length: 14 }, (_, i) => 24350 + i * 50);
export const OI_SPOT = 24812;

export const mixHash = (s) => {
  let h = 2166136261;
  for (const c of s) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

const OI_COL_TOGGLES = [
  { key: "market", label: "Market" },
  { key: "putOi", label: "Put OI" },
  { key: "callOi", label: "Call OI" },
  { key: "callChg", label: "Call OI Chg" },
  { key: "putChg", label: "Put OI Chg" },
  { key: "strike", label: "Strike" },
  { key: "iv", label: "IV" },
];

export function OiChainCard({ tick = 0, onStrike, collapsed = false, onToggle, className = "", live = null }) {
  const [tab, setTab] = useState("total");
  const [cols, setCols] = useState({ market: false, callOi: true, putOi: true, callChg: true, putChg: true, strike: true, iv: true });

  const spot = live?.spot || OI_SPOT;
  const rows = live?.rows?.length ? live.rows : OI_STRIKES.map((strike) => {
    const h = mixHash(`oi-${strike}-${tick}`);
    const dist = Math.abs(strike - OI_SPOT) / 50;
    const nearBoost = Math.max(0, 60 - dist * 9);
    return {
      strike,
      callOi: +(((h % 140) / 10) + 0.4 + (strike > OI_SPOT ? nearBoost / 3 : nearBoost / 6)).toFixed(1),
      putOi: +((((h >> 3) % 140) / 10) + 0.3 + (strike < OI_SPOT ? nearBoost / 3 : nearBoost / 6)).toFixed(1),
      callChg: (h >> 5) % 240 - 110,
      putChg: (h >> 7) % 220 - 100,
      iv: (9 + ((h >> 2) % 120) / 10).toFixed(1),
    };
  });
  const totalCall = rows.reduce((s, r) => s + r.callOi, 0).toFixed(1);
  const totalPut = rows.reduce((s, r) => s + r.putOi, 0).toFixed(1);
  const maxCallOi = Math.max(...rows.map((r) => r.callOi));
  const maxPutOi = Math.max(...rows.map((r) => r.putOi));
  const callDiff = (maxCallOiVal, v) => (maxCallOiVal - v).toFixed(1);

  const show = (k) => {
    if (!cols[k]) return false;
    if (tab === "total") return true;
    const marketCols = ["market"];
    const callCols = ["market", "callOi", "callChg", "strike", "iv"];
    const putCols = ["market", "putOi", "putChg", "strike", "iv"];
    return (tab === "call" ? callCols : putCols).includes(k) || marketCols.includes(k);
  };

  return (
    <div className={`overflow-hidden rounded-xl border border-edge bg-white h-full min-h-[400px] flex flex-col ${className}`} data-testid="oi-chain">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-edge px-2 py-2">
        <p className="font-mono text-[13px] uppercase tracking-[0.06em] text-slate">
          OI · Option Chain — Nifty 50{live?.expiry ? ` · Exp ${live.expiry}` : ""}
          {live && <span className="ml-2 rounded bg-signal/15 px-1.5 py-0.5 text-[8px] font-bold text-signal" data-testid="oi-live-badge">LIVE NSE</span>}
        </p>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-mono text-[8px] font-bold text-rose-500"><span className="h-2 w-2 rounded-sm bg-rose-500" /> Call OI</span>
          <span className="inline-flex items-center gap-1 font-mono text-[8px] font-bold text-signal"><span className="h-2 w-2 rounded-sm bg-signal" /> Put OI</span>
          {onToggle && <MinBtn id="min-oi" collapsed={collapsed} onClick={onToggle} dark />}
        </div>
      </div>
      <Collapse open={!collapsed}>
        <div className="h-full flex flex-col px-2 py-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <div className="font-mono text-[11px] text-slate">Total Call OI</div>
              <div className="font-mono text-[13px] font-bold text-rose-500" data-testid="oi-total-call">{totalCall}L</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="font-mono text-[11px] text-slate">Total Put OI</div>
              <div className="font-mono text-[13px] font-bold text-signal" data-testid="oi-total-put">{totalPut}L</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="font-mono text-[11px] text-slate">Put − Call Diff</div>
              <div
                className={`font-mono text-[13px] font-bold ${Number(totalPut) - Number(totalCall) >= 0 ? "text-signal" : "text-rose-500"}`}
                data-testid="oi-diff"
              >
                {Number(totalPut) - Number(totalCall) >= 0 ? "+" : ""}
                {(Number(totalPut) - Number(totalCall)).toFixed(1)}L
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 border-b border-edge px-0 py-1">
          {[{ k: "call", label: "Call OI" }, { k: "put", label: "Put OI" }, { k: "total", label: "Total OI" }].map((t) => (
            <button
              key={t.k}
              data-testid={`oi-tab-${t.k}`}
              onClick={() => setTab(t.k)}
              className={`rounded-full px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-wider transition-colors ${
                tab === t.k ? "bg-signal text-white" : "bg-mist text-slate hover:bg-mist/80"
              }`}
            >
              {t.label}
            </button>
          ))}
          <span className="mx-1 hidden h-4 w-px bg-edge sm:block" />
          {OI_COL_TOGGLES.map((c) => (
            <button
              key={c.key}
              data-testid={`oi-col-${c.key}`}
              onClick={() => setCols((s) => ({ ...s, [c.key]: !s[c.key] }))}
              className={`rounded-full border px-2 py-1 font-mono text-[8px] font-bold transition-colors ${
                cols[c.key] ? "border-signal/40 bg-signal/10 text-signal" : "border-edge text-slate hover:text-ink"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
          <div className="overflow-auto flex-1" data-lenis-prevent>
            <table className="min-w-[600px] w-full table-fixed text-left font-mono text-[11px] [&_td]:border-r [&_td]:border-slate-400 [&_td:last-child]:border-r-0 [&_th]:border-r [&_th]:border-slate-400 [&_th:last-child]:border-r-0">
            <thead>
              <tr className="border-b-2 border-slate-400 text-slate">
                {show("market") && <th className="px-2 py-1 text-left font-semibold">Market</th>}
                {show("putChg") && <th className="bg-[#00D084]/15 px-2 py-1 text-right font-bold text-[#047857]">Put Chg%</th>}
                {show("putOi") && <th className="bg-[#00D084]/15 px-2 py-1 text-right font-bold text-[#047857]">Put OI</th>}
                {show("putOi") && <th className="bg-[#00D084]/15 px-2 py-1 text-right font-bold text-[#047857]">Put High</th>}
                {show("putOi") && <th className="bg-[#00D084]/15 !border-r-2 !border-slate-500 px-2 py-1 text-right font-bold text-[#047857]">Put Δ</th>}
                {show("strike") && <th className="!border-r-2 !border-slate-500 px-2 py-1 text-center font-bold text-ink">Strike</th>}
                {show("iv") && <th className="px-2 py-1 font-semibold">IV</th>}
                {show("callOi") && <th className="bg-rose-500/15 px-2 py-1 text-right font-bold text-rose-600">Call OI</th>}
                {show("callOi") && <th className="bg-rose-500/15 px-2 py-1 text-right font-bold text-rose-600">Call High</th>}
                {show("callOi") && <th className="bg-rose-500/15 px-2 py-1 text-right font-bold text-rose-600">Call Δ</th>}
                {show("callChg") && <th className="bg-rose-500/15 px-2 py-1 text-right font-bold text-rose-600">Call Chg%</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const atm = Math.abs(r.strike - spot) <= 25;
                return (
                  <tr
                    key={r.strike}
                    data-testid={`oi-row-${r.strike}`}
                    onClick={() => onStrike?.(r.strike)}
                    className={`cursor-pointer border-b border-edge/80 transition-colors hover:bg-mist ${atm ? "bg-signal/5" : ""}`}
                  >
                    {show("market") && <td className="px-2 py-1 text-left font-bold text-ink">NIFTY 50</td>}
                    {show("putChg") && <td className={`bg-[#00D084]/10 px-2 py-1 text-right font-bold ${r.putChg >= 0 ? "text-signal" : "text-rose-500"}`}>{r.putChg}%</td>}
                    {show("putOi") && (
                      <>
                        <td className="bg-[#00D084]/10 px-2 py-1 text-right font-bold text-ink">{r.putOi}</td>
                        <td className="bg-[#00D084]/10 px-2 py-1 text-right text-slate">{maxPutOi.toFixed(1)}</td>
                        <td className={`bg-[#00D084]/10 !border-r-2 !border-slate-500 px-2 py-1 text-right font-bold ${maxPutOi - r.putOi === 0 ? "text-ember" : "text-slate"}`}>{(maxPutOi - r.putOi).toFixed(1)}</td>
                      </>
                    )}
                    {show("strike") && <td className={`!border-r-2 !border-slate-500 px-2 py-1 text-center font-bold ${atm ? "text-ember" : "text-ink"}`}>{r.strike}</td>}
                    {show("iv") && <td className="px-2 py-1 text-slate">{r.iv ?? "—"}</td>}
                    {show("callOi") && (
                      <>
                        <td className="bg-rose-500/10 px-2 py-1 text-right font-bold text-ink">{r.callOi}</td>
                        <td className="bg-rose-500/10 px-2 py-1 text-right text-slate">{maxCallOi.toFixed(1)}</td>
                        <td className={`bg-rose-500/10 px-2 py-1 text-right font-bold ${maxCallOi - r.callOi === 0 ? "text-ember" : "text-slate"}`}>{(maxCallOi - r.callOi).toFixed(1)}</td>
                      </>
                    )}
                    {show("callChg") && <td className={`bg-rose-500/10 px-2 py-1 text-right font-bold ${r.callChg >= 0 ? "text-signal" : "text-rose-500"}`}>{r.callChg}%</td>}
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
          <p className="border-t border-edge px-3 py-2 text-[12px] text-slate">
            {live
              ? "Live NSE option chain via Angel One SmartAPI — real open interest, refreshed every 15 seconds."
              : "Demo option chain — click any strike to open its signal note. Randomly generated test data."}
          </p>
        </div>
      </Collapse>
    </div>
  );
}

export const FY_COLS = ["FY 2011", "FY 2012", "FY 2013", "FY 2014", "FY 2015", "Current/LTM", "FY 2016 Est"];
const mkSeries = (base, g) => FY_COLS.map((_, i) => base * Math.pow(1 + g, i));
const moneyFmt = (v) => (v < 0 ? `(${Math.round(Math.abs(v)).toLocaleString("en-IN")})` : Math.round(v).toLocaleString("en-IN"));

export const buildFundamentals = () => {
  const rev = mkSeries(21400, 0.035);
  const gp = mkSeries(8610, 0.041);
  const ebitda = mkSeries(5420, 0.052);
  const ni = mkSeries(4760, 0.049);
  const eps = mkSeries(4.82, 0.072);
  const cfo = mkSeries(6890, 0.056);
  const capex = mkSeries(-2580, 0.043);
  const fcf = cfo.map((v, i) => v + capex[i]);
  const growthRow = (s) => s.map((v, i) => (i === 0 ? { t: "—", tone: "muted" } : { t: `${(((v / s[i - 1]) - 1) * 100).toFixed(1)}%`, tone: v >= s[i - 1] ? "pos" : "neg" }));
  const marginRow = (n) => n.map((v, i) => ({ t: `${((v / rev[i]) * 100).toFixed(1)}%`, tone: "neu" }));
  const moneyRow = (s) => s.map((v) => ({ t: moneyFmt(v), tone: v < 0 ? "neg" : "neu" }));
  return [
    { label: "Market Capitalization", cells: moneyRow(mkSeries(92400, 0.092)) },
    { label: "Cash & Equivalents", cells: moneyRow(mkSeries(2100, 0.045)) },
    { label: "Free Cash Flow", key: true, cells: moneyRow(fcf) },
    { label: "Total Debt", cells: moneyRow(mkSeries(31450, 0.082)) },
    { label: "Enterprise Value", cells: moneyRow(mkSeries(120900, 0.088)) },
    { label: "Revenue, Adj", key: true, cells: moneyRow(rev) },
    { label: "Growth %, YoY", cells: growthRow(rev) },
    { label: "Gross Profit, Adj", cells: moneyRow(gp) },
    { label: "Margin %", cells: marginRow(gp) },
    { label: "EBITDA, Adj", key: true, cells: moneyRow(ebitda) },
    { label: "Margin %", cells: marginRow(ebitda) },
    { label: "Net Income, Adj", cells: moneyRow(ni) },
    { label: "Margin %", cells: marginRow(ni) },
    { label: "EPS, Adj", key: true, cells: eps.map((v) => ({ t: v.toFixed(2), tone: "neu" })) },
    { label: "Growth %, YoY", cells: growthRow(eps) },
    { label: "Cash from Operations", cells: moneyRow(cfo) },
    { label: "Capital Expenditures", cells: moneyRow(capex) },
    { label: "Free Cash Flow", key: true, cells: moneyRow(fcf) },
  ];
};

const ALT_METRICS = ["Observed Sales", "Observed Transactions", "Observed Customers", "Average Transaction Value", "Transactions per Customer", "Sales per Customer", "Estimated Visits"];
export const buildAltRows = () =>
  ALT_METRICS.map((m, mi) => {
    const h = mixHash(`alt-${m}`);
    const base = 800 + (h % 4000) + mi * 137;
    const lvl = [base * 3.25, base, base / 4].map((v) => (v >= 100 ? Math.round(v).toLocaleString("en-IN") : v.toFixed(2)));
    const gr = [0, 1, 2].map((i) => ((h >> (i * 3 + mi)) % 240 - 110) / 10);
    return { m, lvl, gr };
  });

export const SALES_WEEKS = ["16-Apr", "23-Apr", "30-Apr", "07-May", "14-May", "21-May", "28-May", "04-Jun", "11-Jun", "18-Jun", "25-Jun", "02-Jul"];
export const SALES_ROWS = ["Analyst Curated (BI)", "Nifty 50 Basket", "Sensex Basket", "Bank Nifty Basket", "Midcap Basket"];
export const NAV_TABS = ["ADJ", "Key Stats", "Highlights", "GAAP Highlights", "Financial Analysis", "Annuals"];
export const ALT_TABS = ["Inflection", "KPI Correlation", "Trend Analysis"];
export const GROWTH_PERIODS = ["3M", "6M", "1Y", "2Y", "3Y", "5Y", "Max"];

const COMPANY = {
  RELIANCE: "Reliance Industries", TCS: "Tata Consultancy Svcs", HDFCBANK: "HDFC Bank", INFY: "Infosys",
  ICICIBANK: "ICICI Bank", SBIN: "State Bank of India", TATAMOTORS: "Tata Motors", ITC: "ITC",
  LT: "Larsen & Toubro", AXISBANK: "Axis Bank", KOTAKBANK: "Kotak Mahindra", HINDUNILVR: "Hindustan Unilever",
  BAJFINANCE: "Bajaj Finance", MARUTI: "Maruti Suzuki", SUNPHARMA: "Sun Pharma", TITAN: "Titan",
  ULTRACEMCO: "UltraTech Cement", NTPC: "NTPC", POWERGRID: "Power Grid", ONGC: "ONGC",
  TATASTEEL: "Tata Steel", JSWSTEEL: "JSW Steel", ADANIENT: "Adani Enterprises", HCLTECH: "HCL Tech",
  BHARTIARTL: "Bharti Airtel", ASIANPAINT: "Asian Paints", DMART: "Avenue Supermarts", WIPRO: "Wipro",
  TECHM: "Tech Mahindra", HINDZINC: "Hindustan Zinc", COALINDIA: "Coal India", BPCL: "BPCL",
  IOC: "Indian Oil", HEROMOTOCO: "Hero MotoCorp", EICHERMOT: "Eicher Motors", "BAJAJ-AUTO": "Bajaj Auto",
  TVSMOTOR: "TVS Motor", CIPLA: "Cipla", DRREDDY: "Dr Reddy's Labs", DIVISLAB: "Divi's Labs",
  APOLLOHOSP: "Apollo Hospitals", BRITANNIA: "Britannia", NESTLEIND: "Nestle India", TATACONSUM: "Tata Consumer",
  HAVELLS: "Havells India", PIDILITIND: "Pidilite Industries", VEDL: "Vedanta", HINDALCO: "Hindalco",
  GRASIM: "Grasim Industries", INDUSINDBK: "IndusInd Bank", DLF: "DLF", LODHA: "Macrotech Developers",
};

const NIFTY50_SYMS = ["RELIANCE","TCS","HDFCBANK","INFY","ICICIBANK","SBIN","TATAMOTORS","ITC","LT","AXISBANK","KOTAKBANK","HINDUNILVR","BAJFINANCE","MARUTI","SUNPHARMA","TITAN","ULTRACEMCO","NTPC","POWERGRID","ONGC","TATASTEEL","JSWSTEEL","ADANIENT","HCLTECH","BHARTIARTL","ASIANPAINT","DMART","WIPRO","TECHM","HINDZINC","COALINDIA","BPCL","IOC","HEROMOTOCO","EICHERMOT","BAJAJ-AUTO","TVSMOTOR","CIPLA","DRREDDY","DIVISLAB","APOLLOHOSP","BRITANNIA","NESTLEIND","TATACONSUM","HAVELLS","PIDILITIND","VEDL","HINDALCO","GRASIM","INDUSINDBK"];
const SENSEX_SYMS = ["RELIANCE","TCS","HDFCBANK","INFY","ICICIBANK","SBIN","ITC","LT","AXISBANK","KOTAKBANK","HINDUNILVR","BAJFINANCE","MARUTI","SUNPHARMA","TITAN","ULTRACEMCO","NTPC","POWERGRID","TATASTEEL","JSWSTEEL","HCLTECH","BHARTIARTL","ASIANPAINT","WIPRO","TECHM","HEROMOTOCO","BAJAJ-AUTO","CIPLA","NESTLEIND","INDUSINDBK"];

const mkStock = (sym, i) => {
  const h = mixHash(`stk-${sym}`);
  const ltp = (50 + (h % 240000) / 100).toFixed(2);
  let chgPct = ((h >> 4) % 520 - 260) / 100;
  if (i % 17 === 16) chgPct = 0;
  const volume = (0.4 + ((h >> 6) % 900) / 10).toFixed(1);
  const oi = (2 + ((h >> 8) % 400) / 10).toFixed(1);
  return { sym, name: COMPANY[sym] || `${sym} Ltd`, ltp, chgPct, volume, oi, status: "Open" };
};

export const INDICES = {
  "NIFTY 50": { px: "24,812.75", chg: "+0.84%", stocks: NIFTY50_SYMS.map(mkStock) },
  "SENSEX": { px: "81,506.20", chg: "+0.61%", stocks: SENSEX_SYMS.map(mkStock) },
  "BANK NIFTY": { px: "51,240.30", chg: "+1.12%", stocks: ["HDFCBANK","ICICIBANK","SBIN","AXISBANK","KOTAKBANK","INDUSINDBK","BAJFINANCE"].map(mkStock) },
  "NIFTY NEXT 50": { px: "68,412.40", chg: "-0.22%", stocks: ["DLF","LODHA","HINDZINC","VEDL","HAVELLS","PIDILITIND","DMART","DIVISLAB","TVSMOTOR","TATACONSUM"].map(mkStock) },
  "NIFTY MIDCAP 100": { px: "58,412.40", chg: "-0.18%", stocks: ["HINDZINC","COALINDIA","HAVELLS","PIDILITIND","DLF","LODHA","TVSMOTOR","DIVISLAB"].map(mkStock) },
  "NIFTY IT": { px: "38,945.10", chg: "+0.97%", stocks: ["TCS","INFY","HCLTECH","WIPRO","TECHM"].map(mkStock) },
  "NIFTY AUTO": { px: "23,410.65", chg: "-0.64%", stocks: ["TATAMOTORS","MARUTI","HEROMOTOCO","EICHERMOT","BAJAJ-AUTO","TVSMOTOR"].map(mkStock) },
  "NIFTY PHARMA": { px: "21,208.30", chg: "+0.42%", stocks: ["SUNPHARMA","CIPLA","DRREDDY","DIVISLAB","APOLLOHOSP"].map(mkStock) },
  "NIFTY FMCG": { px: "56,120.90", chg: "+0.18%", stocks: ["ITC","HINDUNILVR","BRITANNIA","NESTLEIND","TATACONSUM","DMART"].map(mkStock) },
  "NIFTY METAL": { px: "9,412.55", chg: "+1.38%", stocks: ["TATASTEEL","JSWSTEEL","HINDALCO","HINDZINC","VEDL","COALINDIA"].map(mkStock) },
  "NIFTY REALTY": { px: "982.40", chg: "-1.05%", stocks: ["DLF","LODHA"].map(mkStock) },
  "NIFTY ENERGY": { px: "35,614.20", chg: "-0.37%", stocks: ["RELIANCE","ONGC","BPCL","IOC","NTPC","POWERGRID","COALINDIA"].map(mkStock) },
};
export const INDEX_NAMES = Object.keys(INDICES);

export const TermPanel = ({ title, id, collapsed, onToggle, right, children, className = "" }) => (
  <section className={`overflow-hidden rounded-sm border border-[#262626] bg-[#080808] ${className}`} data-testid={id}>
    <header className="flex items-center justify-between gap-1.5 border-b border-[#262626] bg-[#0d0d0d] px-1.5 py-0.5">
      <span className="font-mono text-[7px] font-bold uppercase tracking-[0.18em] text-amber-400">{title}</span>
      <span className="flex items-center gap-1">
        {right}
        {onToggle && <MinBtn id={`min-${id}`} collapsed={collapsed} onClick={onToggle} dark />}
      </span>
    </header>
    <Collapse open={!collapsed}>
      <div className="overflow-x-auto" data-lenis-prevent>{children}</div>
    </Collapse>
  </section>
);

export const cellTone = { pos: "text-green-400", neg: "text-red-400", neu: "text-[#d7d7d7]", muted: "text-[#555]" };

const StockRow = ({ s, onClick }) => {
  const up = s.chgPct > 0;
  const flat = s.chgPct === 0;
  const chgAbs = ((s.ltp * s.chgPct) / 100).toFixed(2);
  return (
    <tr
      data-testid={`constituent-${slug(s.sym)}`}
      onClick={() => onClick(s)}
      className="cursor-pointer border-b border-[#1c1c1c] transition-colors hover:bg-white/[0.05]"
    >
      <td className="whitespace-nowrap px-1.5 py-0.5 font-bold text-white">{s.sym}</td>
      <td className="hidden whitespace-nowrap px-1.5 py-0.5 text-[#888] lg:table-cell">{s.name}</td>
      <td className="whitespace-nowrap px-1.5 py-0.5 text-right text-[#e5e5e5]">{Number(s.ltp).toLocaleString("en-IN")}</td>
      <td className={`whitespace-nowrap px-1.5 py-0.5 text-right font-semibold ${flat ? "text-[#888]" : up ? "text-green-400" : "text-red-400"}`}>
        {flat ? "0.00" : `${up ? "+" : ""}${chgAbs}`}
      </td>
      <td className={`whitespace-nowrap px-1.5 py-0.5 text-right font-bold ${flat ? "text-[#888]" : up ? "text-green-400" : "text-red-400"}`}>
        {flat ? "0.00%" : `${up ? "+" : ""}${s.chgPct.toFixed(2)}%`}
      </td>
      <td className="hidden whitespace-nowrap px-1.5 py-0.5 text-right text-[#888] xl:table-cell">{s.volume}M</td>
    </tr>
  );
};

const ConstituentBoard = ({ indexName, stocks, onSelectStock, collapsed, onToggle }) => {
  const advances = stocks.filter((s) => s.chgPct > 0);
  const declines = stocks.filter((s) => s.chgPct < 0);
  const unchanged = stocks.filter((s) => s.chgPct === 0);

  const GroupTable = ({ label, list, tone }) => (
    <div className="min-w-0">
      <p className={`mb-1 border-b px-2 pb-1 font-mono text-[8px] font-bold uppercase tracking-[0.18em] ${tone === "up" ? "border-green-900 text-green-400" : tone === "down" ? "border-red-900 text-red-400" : "border-[#333] text-[#888]"}`}>
        {label} {list.length}
      </p>
      <table className="w-full font-mono text-[10px]">
        <tbody>{list.map((s) => <StockRow key={s.sym} s={s} onClick={onSelectStock} />)}</tbody>
      </table>
    </div>
  );

  return (
    <section className="overflow-hidden rounded-md border border-[#262626] bg-[#080808]" data-testid="constituent-board">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#262626] bg-[#0d0d0d] px-2.5 py-1.5">
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-amber-400">{indexName}</span>
        <span className="font-mono text-[9px] text-[#777]" data-testid="constituent-count">{stocks.length} Constituents</span>
        <span className="flex items-center gap-3 font-mono text-[9px] font-bold">
          <span className="text-green-400" data-testid="advances-count">Advance {advances.length}</span>
          <span className="text-red-400" data-testid="declines-count">Decline {declines.length}</span>
          <span className="text-[#888]" data-testid="unchanged-count">Unchanged {unchanged.length}</span>
        </span>
        <span className="ml-auto">{onToggle && <MinBtn id="min-board" collapsed={collapsed} onClick={onToggle} dark />}</span>
      </header>
      <Collapse open={!collapsed}>
        <div className="max-h-[460px] overflow-y-auto p-2" data-lenis-prevent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <GroupTable label="Advance" list={advances} tone="up" />
            <GroupTable label="Decline" list={declines} tone="down" />
          </div>
          {unchanged.length > 0 && (
            <div className="mt-3">
              <GroupTable label="Unchanged" list={unchanged} tone="flat" />
            </div>
          )}
        </div>
      </Collapse>
    </section>
  );
};
