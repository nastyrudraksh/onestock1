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


const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const MinBtn = ({ id, collapsed, onClick, dark = false }) => (
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

const Collapse = ({ open, children }) => (
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

const INSTRUMENTS = [
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
const playAlertBeep = () => {
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

const buildSignal = (m, tick = 0, enabled = [true, true, true, true, true]) => {
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
  const buy = bull >= bear;
  return {
    dir: buy ? "BUY CALL" : "BUY PUT",
    buy,
    confidence: Math.round(55 + (Math.max(bull, bear) / list.length) * 40),
    entry: fmt(num),
    target: fmt(buy ? num * 1.012 : num * 0.988),
    stop: fmt(buy ? num * 0.994 : num * 1.006),
    indicators: list,
  };
};

export function SignalDrawer({ instrument, tick, live, onToggleLive, enabled, onToggleIndicator, onRefresh, onClose }) {
  const sig = instrument ? buildSignal(instrument, tick, enabled) : null;

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

            <div className="mt-5 flex gap-3">
              <button
                data-testid="signal-execute-button"
                onClick={() => {
                  const fn = sig.buy ? toast.success : toast.error;
                  fn(`${sig.dir} ${instrument.name} placed`, {
                    description: "Demo only — no real order was placed.",
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
              Test model only — signals are randomly generated demo data and do not use real market feeds.
              This is not investment advice.
            </p>
          </motion.aside>
      )}
    </AnimatePresence>
  );
}

const PLANS = [
  { name: "MONTHLY PLAN", price: "₹999", per: "/month", cta: "Start Free", popular: false,
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

export function NiftyStocksBoard({ compact = false, collapsed = false, onToggle }) {
  const up = NIFTY_STOCKS.filter((s) => s.chg.startsWith("+"));
  const down = NIFTY_STOCKS.filter((s) => !s.chg.startsWith("+"));

  const stockRow = (s) => {
    const gain = s.chg.startsWith("+");
    return (
      <div
        key={s.name}
        data-testid={`stock-${slug(s.name)}`}
        className={`flex items-center justify-between rounded-md px-2 py-1.5 ${gain ? "bg-signal/5" : "bg-rose-500/5"}`}
      >
        <span className="font-mono text-[10px] font-bold text-ink">{s.name}</span>
        <span className={`font-mono text-[9px] font-semibold ${gain ? "text-signal" : "text-rose-500"}`}>{s.chg}</span>
      </div>
    );
  };

  if (compact) {
    return (
      <div className="rounded-2xl border border-edge bg-white p-4" data-testid="nifty-stocks-board">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">Nifty 50 Stocks</p>
          {onToggle && <MinBtn id="min-stocks" collapsed={collapsed} onClick={onToggle} />}
        </div>
        <div className="mt-2.5 flex items-center justify-between font-mono text-[11px] font-bold">
          <span className="text-signal" data-testid="advances-count">Advance {up.length}</span>
          <span className="text-rose-500" data-testid="declines-count">Decline {down.length}</span>
        </div>
        <div className="mt-2 flex h-2 overflow-hidden rounded-full" data-testid="advance-decline-bar">
          <div className="bg-signal transition-all duration-700" style={{ width: `${(up.length / NIFTY_STOCKS.length) * 100}%` }} />
          <div className="bg-rose-500 transition-all duration-700" style={{ width: `${(down.length / NIFTY_STOCKS.length) * 100}%` }} />
        </div>
        <Collapse open={!collapsed}>
          <div className="mt-3 max-h-[520px] overflow-y-auto pr-1" data-lenis-prevent>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1.5 border-b border-signal/20 pb-1 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-signal">
                  Advance · Bullish
                </p>
                <div className="space-y-1">{up.map(stockRow)}</div>
              </div>
              <div>
                <p className="mb-1.5 border-b border-rose-500/20 pb-1 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-rose-500">
                  Decline · Bearish
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
    <div className="mt-6 rounded-2xl border border-edge bg-white p-6" data-testid="nifty-stocks-board">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">Nifty 50 Stocks · Advance / Decline</p>
        <div className="flex items-center gap-3 font-mono text-[11px] font-bold">
          <span className="text-signal" data-testid="advances-count">Advance {up.length}</span>
          <span className="text-rose-500" data-testid="declines-count">Decline {down.length}</span>
        </div>
      </div>
      <div className="mt-3 flex h-2.5 overflow-hidden rounded-full" data-testid="advance-decline-bar">
        <div className="bg-signal transition-all duration-700" style={{ width: `${(up.length / NIFTY_STOCKS.length) * 100}%` }} />
        <div className="bg-rose-500 transition-all duration-700" style={{ width: `${(down.length / NIFTY_STOCKS.length) * 100}%` }} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-5">
        <div>
          <p className="mb-2.5 border-b border-signal/20 pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-signal">
            Advance · Bullish ({up.length})
          </p>
          <div className="space-y-1.5">{up.map(stockRow)}</div>
        </div>
        <div>
          <p className="mb-2.5 border-b border-rose-500/20 pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-rose-500">
            Decline · Bearish ({down.length})
          </p>
          <div className="space-y-1.5">{down.map(stockRow)}</div>
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
  return (
    <div className="rounded-2xl border border-edge bg-white p-6" data-testid="oi-chart">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">OI · Support vs Resistance</p>
        <div className="flex items-center gap-3 font-mono text-[10px] font-bold">
          <span className="inline-flex items-center gap-1.5 text-signal"><span className="h-2 w-2 rounded-sm bg-signal" /> Support %</span>
          <span className="inline-flex items-center gap-1.5 text-rose-500"><span className="h-2 w-2 rounded-sm bg-rose-500" /> Resistance %</span>
        </div>
      </div>
      <div className="mt-4" style={{ height: data.length * 32 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category" dataKey="name" width={118}
              tick={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", fill: "#6B7280", fontWeight: 600 }}
              axisLine={false} tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(10,15,28,0.04)" }}
              contentStyle={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, borderRadius: 10, border: "1px solid #E5E7EB" }}
              formatter={(v, k) => [`${v}%`, k === "support" ? "Support" : "Resistance"]}
            />
            <Bar dataKey="support" stackId="oi" fill="#00D084" isAnimationActive radius={[4, 0, 0, 4]} />
            <Bar dataKey="resistance" stackId="oi" fill="#F43F5E" isAnimationActive radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate">
        Demo data — percent of traders positioned at support (green) versus resistance (red) for each market.
      </p>
    </div>
  );
}

const OI_STRIKES = Array.from({ length: 14 }, (_, i) => 24350 + i * 50);
const OI_SPOT = 24812;

const mixHash = (s) => {
  let h = 2166136261;
  for (const c of s) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

const OI_COL_TOGGLES = [
  { key: "callOi", label: "Call OI" },
  { key: "putOi", label: "Put OI" },
  { key: "callChg", label: "Call OI Chg" },
  { key: "putChg", label: "Put OI Chg" },
  { key: "strike", label: "Strike" },
  { key: "iv", label: "IV" },
];

export function OiChainCard({ tick = 0, onStrike, collapsed = false, onToggle }) {
  const [tab, setTab] = useState("total");
  const [cols, setCols] = useState({ callOi: true, putOi: true, callChg: true, putChg: true, strike: true, iv: true });

  const rows = OI_STRIKES.map((strike) => {
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
    const callCols = ["callOi", "callChg", "strike", "iv"];
    const putCols = ["putOi", "putChg", "strike", "iv"];
    return (tab === "call" ? callCols : putCols).includes(k);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-night-line bg-ink" data-testid="oi-chain">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-night-line px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cloud">OI · Option Chain — Nifty 50</p>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-bold text-rose-400"><span className="h-2 w-2 rounded-sm bg-rose-500" /> Call OI</span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-bold text-signal"><span className="h-2 w-2 rounded-sm bg-signal" /> Put OI</span>
          {onToggle && <MinBtn id="min-oi" collapsed={collapsed} onClick={onToggle} dark />}
        </div>
      </div>
      <Collapse open={!collapsed}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="font-mono text-[11px] text-cloud">Total Call OI</div>
              <div className="font-mono text-[14px] font-bold text-paper">{totalCall}L</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-mono text-[11px] text-cloud">Total Put OI</div>
              <div className="font-mono text-[14px] font-bold text-paper">{totalPut}L</div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-b border-night-line px-4 py-2.5">
          {[{ k: "call", label: "Call OI" }, { k: "put", label: "Put OI" }, { k: "total", label: "Total OI" }].map((t) => (
            <button
              key={t.k}
              data-testid={`oi-tab-${t.k}`}
              onClick={() => setTab(t.k)}
              className={`rounded-full px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider transition-colors ${
                tab === t.k ? "bg-ember text-white" : "bg-white/5 text-cloud hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
          <span className="mx-1 hidden h-4 w-px bg-night-line sm:block" />
          {OI_COL_TOGGLES.map((c) => (
            <button
              key={c.key}
              data-testid={`oi-col-${c.key}`}
              onClick={() => setCols((s) => ({ ...s, [c.key]: !s[c.key] }))}
              className={`rounded-full border px-2.5 py-1 font-mono text-[9px] font-bold transition-colors ${
                cols[c.key] ? "border-signal/40 bg-signal/10 text-signal" : "border-night-line text-cloud/60 hover:text-cloud"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto" data-lenis-prevent>
          <table className="w-full text-left font-mono text-[10px]">
            <thead>
              <tr className="border-b border-night-line text-cloud/70">
                {show("callChg") && <th className="px-2 py-2 font-semibold">Call Chg%</th>}
                {show("callOi") && <th className="px-2 py-2 text-right font-semibold">Call OI</th>}
                {show("callOi") && <th className="px-2 py-2 text-right font-semibold">Call High</th>}
                {show("callOi") && <th className="px-2 py-2 text-right font-semibold">Call Δ</th>}
                {show("strike") && <th className="px-2 py-2 text-center font-semibold text-paper">Strike</th>}
                {show("iv") && <th className="px-2 py-2 font-semibold">IV</th>}
                {show("putOi") && <th className="px-2 py-2 font-semibold">Put OI</th>}
                {show("putOi") && <th className="px-2 py-2 font-semibold">Put High</th>}
                {show("putOi") && <th className="px-2 py-2 text-right font-semibold">Put Δ</th>}
                {show("putChg") && <th className="px-2 py-2 text-right font-semibold">Put Chg%</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const atm = Math.abs(r.strike - OI_SPOT) <= 25;
                return (
                  <tr
                    key={r.strike}
                    data-testid={`oi-row-${r.strike}`}
                    onClick={() => onStrike?.(r.strike)}
                    className={`cursor-pointer border-b border-night-line/60 transition-colors hover:bg-white/10 ${atm ? "bg-ember/10" : ""}`}
                  >
                    {show("callChg") && <td className={`px-2 py-1.5 font-bold ${r.callChg >= 0 ? "text-signal" : "text-rose-400"}`}>{r.callChg}%</td>}
                    {show("callOi") && (
                      <>
                        <td className="px-2 py-1.5 text-right font-bold text-white">{r.callOi}</td>
                        <td className="px-2 py-1.5 text-right text-cloud">{maxCallOi.toFixed(1)}</td>
                        <td className={`px-2 py-1.5 text-right font-bold ${maxCallOi - r.callOi === 0 ? "text-ember" : "text-slate"}`}>{(maxCallOi - r.callOi).toFixed(1)}</td>
                      </>
                    )}
                    {show("strike") && <td className={`px-2 py-1.5 text-center font-bold ${atm ? "text-ember" : "text-paper"}`}>{r.strike}</td>}
                    {show("iv") && <td className="px-2 py-1.5 text-cloud">{r.iv}</td>}
                    {show("putOi") && (
                      <>
                        <td className="px-2 py-1.5 text-right font-bold text-white">{r.putOi}</td>
                        <td className="px-2 py-1.5 text-right text-cloud">{maxPutOi.toFixed(1)}</td>
                        <td className={`px-2 py-1.5 text-right font-bold ${maxPutOi - r.putOi === 0 ? "text-ember" : "text-slate"}`}>{(maxPutOi - r.putOi).toFixed(1)}</td>
                      </>
                    )}
                    {show("putChg") && <td className={`px-2 py-1.5 text-right font-bold ${r.putChg >= 0 ? "text-signal" : "text-rose-400"}`}>{r.putChg}%</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="border-t border-night-line px-4 py-2.5 text-[10px] text-cloud/60">
          Demo option chain — click any strike to open its signal note. Randomly generated test data.
        </p>
      </Collapse>
    </div>
  );
}

const FY_COLS = ["FY 2011", "FY 2012", "FY 2013", "FY 2014", "FY 2015", "Current/LTM", "FY 2016 Est"];
const mkSeries = (base, g) => FY_COLS.map((_, i) => base * Math.pow(1 + g, i));
const moneyFmt = (v) => (v < 0 ? `(${Math.round(Math.abs(v)).toLocaleString("en-IN")})` : Math.round(v).toLocaleString("en-IN"));

const buildFundamentals = () => {
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
const buildAltRows = () =>
  ALT_METRICS.map((m, mi) => {
    const h = mixHash(`alt-${m}`);
    const base = 800 + (h % 4000) + mi * 137;
    const lvl = [base * 3.25, base, base / 4].map((v) => (v >= 100 ? Math.round(v).toLocaleString("en-IN") : v.toFixed(2)));
    const gr = [0, 1, 2].map((i) => ((h >> (i * 3 + mi)) % 240 - 110) / 10);
    return { m, lvl, gr };
  });

const SALES_WEEKS = ["16-Apr", "23-Apr", "30-Apr", "07-May", "14-May", "21-May", "28-May", "04-Jun", "11-Jun", "18-Jun", "25-Jun", "02-Jul"];
const SALES_ROWS = ["Analyst Curated (BI)", "Nifty 50 Basket", "Sensex Basket", "Bank Nifty Basket", "Midcap Basket"];
const NAV_TABS = ["ADJ", "Key Stats", "Highlights", "GAAP Highlights", "Financial Analysis", "Annuals"];
const ALT_TABS = ["Inflection", "KPI Correlation", "Trend Analysis"];
const GROWTH_PERIODS = ["3M", "6M", "1Y", "2Y", "3Y", "5Y", "Max"];

const TermPanel = ({ title, id, collapsed, onToggle, right, children }) => (
  <section className="overflow-hidden rounded-md border border-[#262626] bg-[#080808]" data-testid={id}>
    <header className="flex items-center justify-between gap-2 border-b border-[#262626] bg-[#0d0d0d] px-3 py-1.5">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">{title}</span>
      <span className="flex items-center gap-2">
        {right}
        {onToggle && <MinBtn id={`min-${id}`} collapsed={collapsed} onClick={onToggle} dark />}
      </span>
    </header>
    <Collapse open={!collapsed}>
      <div className="overflow-x-auto" data-lenis-prevent>{children}</div>
    </Collapse>
  </section>
);

const cellTone = {
  pos: "text-green-400",
  neg: "text-red-400",
  neu: "text-[#d7d7d7]",
  muted: "text-[#555]",
};

export function MarketView({ onBack }) {
  const [instrumentIdx, setInstrumentIdx] = useState(0);
  const instrument = INSTRUMENTS[instrumentIdx];
  const [tick, setTick] = useState(0);
  const [live, setLive] = useState(true);
  const [enabled, setEnabled] = useState([true, true, true, true, true]);
  const [history, setHistory] = useState([]);
  const [signalFor, setSignalFor] = useState(null);
  const [collapsed, setCollapsed] = useState({ fund: false, alt: false, sales: false, stocks: false, oi: false, inst: false });
  const [navTab, setNavTab] = useState("Financial Analysis");
  const [altTab, setAltTab] = useState("Inflection");
  const [currency, setCurrency] = useState("INR");
  const [growthPeriod, setGrowthPeriod] = useState("3M");
  const [compSource, setCompSource] = useState("Analyst Curated (BI)");
  const [growthType, setGrowthType] = useState("Year-over-Year");
  const [periodicity, setPeriodicity] = useState("Weekly");

  const togglePanel = (k) => setCollapsed((c) => ({ ...c, [k]: !c[k] }));
  const setAll = (v) => setCollapsed({ fund: v, alt: v, sales: v, stocks: v, oi: v, inst: v });
  const openStrike = (strike) =>
    setSignalFor({ name: `NIFTY ${strike} STRIKE`, px: strike.toLocaleString("en-IN"), chg: "+0.00%" });
  const toggleIndicator = (i) =>
    setEnabled((e) => {
      const next = [...e];
      next[i] = !next[i];
      return next.some(Boolean) ? next : e;
    });

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setTick((t) => t + 1), 4000);
    return () => clearInterval(id);
  }, [live]);

  useEffect(() => {
    if (tick === 0) return;
    const strong = INSTRUMENTS.map((m) => ({ m, sig: buildSignal(m, tick, enabled) }))
      .filter((x) => x.sig.confidence >= 90)
      .slice(0, 2);
    if (strong.length > 0) playAlertBeep();
    strong.forEach(({ m, sig }) => {
      const fn = sig.buy ? toast.success : toast.error;
      fn(`Strong Signal: ${m.name}`, {
        id: `strong-${slug(m.name)}-${tick}`,
        description: `${sig.dir} · ${sig.confidence}% confidence · demo test model`,
        style: sig.buy
          ? { background: "#00D084", color: "#06281C", border: "1px solid #00B573" }
          : { background: "#F43F5E", color: "#FFFFFF", border: "1px solid #E11D48" },
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  useEffect(() => {
    if (!signalFor) return;
    const sig = buildSignal(signalFor, tick, enabled);
    const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
    setHistory((h) =>
      [{ name: signalFor.name, dir: sig.dir, buy: sig.buy, confidence: sig.confidence, time }, ...h].slice(0, 8)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signalFor, tick]);

  const px = parseFloat(instrument.px.replace(/,/g, ""));
  const chgNum = parseFloat(instrument.chg);
  const hh = mixHash(`hdr-${instrument.name}`);
  const vol = (1.2 + (hh % 80) / 10).toFixed(1);
  const fx = (v, dec = 2) =>
    currency === "USD"
      ? `$${(v / 84).toLocaleString("en-US", { maximumFractionDigits: dec })}`
      : `₹${v.toLocaleString("en-IN", { maximumFractionDigits: dec })}`;
  const up = chgNum >= 0;
  const hdrStats = [
    { l: "Volume", v: `${vol}M` },
    { l: "Bid", v: fx(px * 0.9998) },
    { l: "Ask", v: fx(px * 1.0002) },
    { l: "Open", v: fx(px / (1 + chgNum / 100)) },
    { l: "High", v: fx(px * 1.008) },
    { l: "Low", v: fx(px * 0.991) },
    { l: "Value", v: `${fx(px * parseFloat(vol) * 10, 0)} Cr` },
  ];
  const funds = buildFundamentals();
  const altRows = buildAltRows();
  const selSig = buildSignal(instrument, tick, enabled);

  return (
    <Shell testid="market-view" onBack={onBack} title="Market Terminal"
      desc="Bloomberg-style demo terminal — every figure on this page is fictional test data.">
      <div className="space-y-3">
        <section className="rounded-md border border-[#262626] bg-[#080808]" data-testid="terminal-header">
          <div className="flex flex-wrap items-center gap-2 border-b border-[#262626] px-3 py-2">
            <select
              data-testid="instrument-selector"
              value={instrumentIdx}
              onChange={(e) => setInstrumentIdx(+e.target.value)}
              className="rounded border border-[#333] bg-[#050505] px-2.5 py-1.5 font-mono text-xs font-bold text-amber-400 outline-none focus:border-amber-400"
            >
              {INSTRUMENTS.map((m, i) => (
                <option key={m.name} value={i}>{m.name}</option>
              ))}
            </select>
            {["Related Functions", "Menu"].map((b) => (
              <button
                key={b}
                data-testid={`terminal-${slug(b)}`}
                onClick={() => toast.info(`${b} — demo control`)}
                className="rounded border border-[#333] bg-[#111] px-2.5 py-1.5 font-mono text-[10px] font-semibold text-[#d7d7d7] transition-colors hover:bg-[#1a1a1a]"
              >
                {b} ▾
              </button>
            ))}
            <span className="ml-auto flex items-center gap-2">
              <button
                data-testid="market-live-toggle"
                onClick={() => setLive((l) => !l)}
                className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  live ? "border-green-800 bg-green-950/60 text-green-400" : "border-[#333] bg-[#111] text-[#888]"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-green-400 animate-pulse-dot" : "bg-[#666]"}`} />
                {live ? "Live" : "Paused"}
              </button>
              <button
                data-testid="terminal-refresh"
                onClick={() => { setTick((t) => t + 1); toast.success("Data refreshed", { description: "Demo feed ticked forward." }); }}
                className="inline-flex items-center gap-1.5 rounded border border-[#333] bg-[#111] px-2.5 py-1.5 font-mono text-[10px] font-semibold text-[#d7d7d7] transition-colors hover:bg-[#1a1a1a]"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </span>
          </div>

          <div className="flex flex-wrap items-end gap-x-6 gap-y-2 px-3 py-2.5">
            <div>
              <p className="font-mono text-2xl font-bold leading-none text-white" data-testid="terminal-price">{fx(px)}</p>
              <p className={`mt-1 font-mono text-xs font-bold ${up ? "text-green-400" : "text-red-400"}`} data-testid="terminal-change">
                {up ? "▲" : "▼"} {fx(Math.abs((px * chgNum) / 100))} ({instrument.chg})
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4 lg:grid-cols-7">
              {hdrStats.map((s) => (
                <div key={s.l}>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[#777]">{s.l}</p>
                  <p className="font-mono text-[11px] font-semibold text-[#e5e5e5]">{s.v}</p>
                </div>
              ))}
            </div>
            <button
              data-testid="terminal-signal-button"
              onClick={() => setSignalFor(instrument)}
              className={`ml-auto inline-flex items-center gap-1.5 rounded px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white transition-all active:scale-95 ${
                selSig.buy ? "bg-green-600 hover:bg-green-500" : "bg-red-600 hover:bg-red-500"
              }`}
            >
              <Zap className="h-3 w-3" /> Signal · {selSig.dir}
            </button>
          </div>

          <nav className="flex flex-wrap items-center gap-1 border-t border-[#262626] px-2 py-1">
            {NAV_TABS.map((t) => (
              <button
                key={t}
                data-testid={`nav-tab-${slug(t)}`}
                onClick={() => setNavTab(t)}
                className={`rounded px-2.5 py-1 font-mono text-[10px] font-semibold transition-colors ${
                  navTab === t ? "bg-[#1a1a1a] text-amber-400 shadow-[inset_0_-2px_0_#F5A623]" : "text-[#999] hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
            <select
              data-testid="currency-selector"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="ml-auto rounded border border-[#333] bg-[#050505] px-2 py-1 font-mono text-[10px] font-bold text-[#d7d7d7] outline-none"
            >
              <option value="INR">INR ₹</option>
              <option value="USD">USD $</option>
            </select>
            <button
              data-testid="terminal-settings"
              onClick={() => toast.info("Terminal settings — demo control")}
              className="inline-flex items-center gap-1 rounded border border-[#333] bg-[#111] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#d7d7d7] hover:bg-[#1a1a1a]"
            >
              <Settings className="h-3 w-3" /> Settings
            </button>
          </nav>
        </section>

        <div className="flex items-center justify-end gap-2">
          <button data-testid="market-minimize-all" onClick={() => setAll(true)}
            className="rounded border border-[#333] bg-[#111] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#999] transition-colors hover:bg-[#1a1a1a]">
            Minimize All
          </button>
          <button data-testid="market-expand-all" onClick={() => setAll(false)}
            className="rounded bg-amber-400 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-black transition-all hover:brightness-110">
            Expand All
          </button>
        </div>

        <TermPanel title={`Financial Fundamentals — ${instrument.name}`} id="fund-panel"
          collapsed={collapsed.fund} onToggle={() => togglePanel("fund")}
          right={<span className="font-mono text-[9px] text-[#777]">{navTab} · {currency}</span>}>
          <table className="w-full min-w-[760px] text-left font-mono text-[10px]">
            <thead>
              <tr className="border-b border-[#262626] text-[#999]">
                <th className="px-3 py-1.5 text-left font-semibold">₹ Cr</th>
                {FY_COLS.map((c) => (
                  <th key={c} className={`px-3 py-1.5 text-center font-semibold ${c.includes("Est") || c.includes("LTM") ? "text-amber-400" : ""}`}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {funds.map((r, ri) => (
                <tr key={ri} className="border-b border-[#1c1c1c] transition-colors hover:bg-white/[0.03]">
                  <td className={`whitespace-nowrap px-3 py-1 ${r.key ? "font-bold text-amber-400" : "text-[#c9c9c9]"}`}>{r.label}</td>
                  {r.cells.map((c, ci) => (
                    <td key={ci} className={`px-3 py-1 text-right ${cellTone[c.tone]}`}>{c.t}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </TermPanel>

        <TermPanel title={`Alternative Data Metrics Summary — ${instrument.name}`} id="alt-panel"
          collapsed={collapsed.alt} onToggle={() => togglePanel("alt")}
          right={
            <span className="flex items-center gap-1">
              {ALT_TABS.map((t) => (
                <button key={t} data-testid={`alt-tab-${slug(t)}`} onClick={() => setAltTab(t)}
                  className={`rounded px-2 py-0.5 font-mono text-[9px] font-semibold transition-colors ${altTab === t ? "bg-amber-400 text-black" : "text-[#999] hover:text-white"}`}>
                  {t}
                </button>
              ))}
            </span>
          }>
          <table className="w-full min-w-[680px] text-left font-mono text-[10px]">
            <thead>
              <tr className="border-b border-[#262626] text-[#999]">
                <th className="px-3 py-1.5 font-semibold">Metric</th>
                {["91 Day", "28 Day", "7 Day"].map((c) => <th key={`l-${c}`} className="px-3 py-1.5 text-center font-semibold">{c}</th>)}
                {["91 Day", "28 Day", "7 Day"].map((c) => <th key={`g-${c}`} className="px-3 py-1.5 text-center font-semibold text-amber-400">{c} Δ</th>)}
              </tr>
            </thead>
            <tbody>
              {altRows.map((r) => (
                <tr key={r.m} className="border-b border-[#1c1c1c]">
                  <td className="whitespace-nowrap px-3 py-1 text-[#c9c9c9]">{r.m}</td>
                  {r.lvl.map((v, i) => <td key={i} className="px-3 py-1 text-right text-[#e5e5e5]">{v}</td>)}
                  {r.gr.map((g, i) => (
                    <td key={i} className={`px-3 py-1 text-right font-bold ${g >= 0 ? "bg-[#0d2b1a] text-green-400" : "bg-[#3a0d12] text-red-400"}`}>
                      {g >= 0 ? "+" : ""}{g.toFixed(1)}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </TermPanel>

        <TermPanel title="Observed Sales YoY Growth" id="sales-panel"
          collapsed={collapsed.sales} onToggle={() => togglePanel("sales")}
          right={
            <span className="flex items-center gap-1">
              {GROWTH_PERIODS.map((p) => (
                <button key={p} data-testid={`period-${p.toLowerCase()}`} onClick={() => setGrowthPeriod(p)}
                  className={`rounded px-2 py-0.5 font-mono text-[9px] font-bold transition-colors ${growthPeriod === p ? "bg-amber-400 text-black" : "text-[#999] hover:text-white"}`}>
                  {p}
                </button>
              ))}
            </span>
          }>
          <div className="flex flex-wrap items-center gap-3 border-b border-[#262626] px-3 py-2">
            {[
              { l: "Comp Source", v: compSource, set: setCompSource, opts: ["Analyst Curated (BI)", "Company Reported"], id: "comp-source" },
              { l: "Growth", v: growthType, set: setGrowthType, opts: ["Year-over-Year", "Quarter-over-Quarter"], id: "growth-type" },
              { l: "Period", v: periodicity, set: setPeriodicity, opts: ["Weekly", "Monthly"], id: "periodicity" },
            ].map((c) => (
              <label key={c.id} className="flex items-center gap-1.5 font-mono text-[10px] text-[#999]">
                {c.l}:
                <select data-testid={`sales-${c.id}`} value={c.v} onChange={(e) => c.set(e.target.value)}
                  className="rounded border border-[#333] bg-[#050505] px-2 py-1 font-semibold text-[#d7d7d7] outline-none">
                  {c.opts.map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
            ))}
            <span className="ml-auto font-mono text-[9px] text-[#777]">{growthPeriod} · {growthType} · {periodicity}</span>
          </div>
          <table className="w-full min-w-[900px] text-left font-mono text-[10px]">
            <thead>
              <tr className="border-b border-[#262626] text-[#999]">
                <th className="px-3 py-1.5 font-semibold">Week Ending</th>
                {SALES_WEEKS.map((w) => <th key={w} className="px-2 py-1.5 text-center font-semibold">{w}</th>)}
              </tr>
            </thead>
            <tbody>
              {SALES_ROWS.map((row, ri) => (
                <tr key={row} className="border-b border-[#1c1c1c]">
                  <td className={`whitespace-nowrap px-3 py-1 ${ri === 0 ? "font-bold text-amber-400" : "text-[#c9c9c9]"}`}>{row}</td>
                  {SALES_WEEKS.map((w, wi) => {
                    const g = (mixHash(`sales-${row}-${w}-${growthPeriod}-${compSource}`) % 300 - 140) / 10;
                    return (
                      <td key={w} className={`px-2 py-1 text-right font-bold ${g >= 0 ? "bg-[#0d2b1a] text-green-400" : "bg-[#3a0d12] text-red-400"}`}>
                        {g >= 0 ? "+" : ""}{g.toFixed(1)}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </TermPanel>

        <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
          <NiftyStocksBoard compact collapsed={collapsed.stocks} onToggle={() => togglePanel("stocks")} />
          <OiChainCard tick={tick} onStrike={openStrike} collapsed={collapsed.oi} onToggle={() => togglePanel("oi")} />
          <section className="overflow-hidden rounded-md border border-[#262626] bg-[#080808]" data-testid="instruments-panel">
            <header className="flex items-center justify-between gap-2 border-b border-[#262626] bg-[#0d0d0d] px-3 py-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">Instruments · Live Signals</span>
              <MinBtn id="min-inst" collapsed={collapsed.inst} onClick={() => togglePanel("inst")} dark />
            </header>
            <Collapse open={!collapsed.inst}>
              <div className="grid max-h-[560px] grid-cols-1 gap-2 overflow-y-auto p-3 2xl:grid-cols-2" data-lenis-prevent>
                {INSTRUMENTS.map((m) => {
                  const active = instrument.name === m.name;
                  const sig = buildSignal(m, tick, enabled);
                  return (
                    <div
                      key={m.name}
                      role="button"
                      tabIndex={0}
                      data-testid={`market-instrument-${slug(m.name)}`}
                      onClick={() => setInstrumentIdx(INSTRUMENTS.indexOf(m))}
                      onKeyDown={(e) => e.key === "Enter" && setInstrumentIdx(INSTRUMENTS.indexOf(m))}
                      className={`group cursor-pointer rounded border p-2.5 transition-colors ${
                        active ? "border-amber-400 bg-amber-400/5" : "border-[#262626] bg-[#0d0d0d] hover:border-[#444]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          data-testid={`market-light-${slug(m.name)}`}
                          className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded transition-colors duration-500 ${
                            sig.buy ? "bg-green-600 text-white" : "bg-red-600 text-white"
                          }`}
                        >
                          {sig.buy ? <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} /> : <TrendingDown className="h-3.5 w-3.5" strokeWidth={2.5} />}
                          <span className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#080808] animate-pulse-dot ${sig.buy ? "bg-green-400" : "bg-red-400"}`} />
                        </span>
                        <button
                          data-testid={`market-signal-${slug(m.name)}`}
                          onClick={(e) => { e.stopPropagation(); setSignalFor(m); }}
                          className="inline-flex shrink-0 items-center gap-1 rounded bg-[#1a1a1a] px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-[#999] transition-colors hover:bg-amber-400 hover:text-black"
                        >
                          <Zap className="h-3 w-3" /> Signal
                        </button>
                      </div>
                      <p className={`mt-2 text-[10px] font-bold uppercase leading-snug tracking-wide ${active ? "text-amber-400" : "text-[#c9c9c9]"}`}>{m.name}</p>
                      <p className="mt-0.5 font-mono text-[11px] font-semibold text-white">{fx(parseFloat(m.px.replace(/,/g, "")))}</p>
                      <p className={`font-mono text-[10px] font-semibold ${m.chg.startsWith("+") ? "text-green-400" : "text-red-400"}`}>{m.chg}</p>
                    </div>
                  );
                })}
              </div>
            </Collapse>
          </section>
        </div>

        <section className="overflow-hidden rounded-md border border-[#262626] bg-[#080808]" data-testid="signal-history">
          <header className="flex items-center justify-between border-b border-[#262626] bg-[#0d0d0d] px-3 py-1.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">Signal History</span>
            {history.length > 0 && (
              <button data-testid="signal-history-clear" onClick={() => setHistory([])}
                className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#777] transition-colors hover:text-red-400">
                Clear
              </button>
            )}
          </header>
          {history.length === 0 ? (
            <p className="px-3 py-3 font-mono text-[10px] text-[#777]">Open any Signal panel to start logging demo signals here.</p>
          ) : (
            <div className="divide-y divide-[#1c1c1c]">
              {history.map((h, i) => (
                <div key={`${h.time}-${i}`} data-testid={`signal-history-row-${i}`} className="flex items-center justify-between gap-3 px-3 py-1.5 font-mono text-[10px]">
                  <span className="text-[#777]">{h.time}</span>
                  <span className="font-bold text-[#e5e5e5]">{h.name}</span>
                  <span className={`rounded px-2 py-0.5 font-bold ${h.buy ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{h.dir}</span>
                  <span className="font-semibold text-[#999]">{h.confidence}%</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <SignalDrawer
        instrument={signalFor}
        tick={tick}
        live={live}
        onToggleLive={() => setLive((l) => !l)}
        enabled={enabled}
        onToggleIndicator={toggleIndicator}
        onRefresh={() => setTick((t) => t + 1)}
        onClose={() => setSignalFor(null)}
      />
    </Shell>
  );
}
