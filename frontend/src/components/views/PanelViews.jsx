import { useState } from "react";
import { toast } from "sonner";
import { Download, Play, ShoppingCart, XCircle, TicketCheck, BadgeCheck, Upload, Check } from "lucide-react";
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

const INSTRUMENTS = [
  { name: "NIFTY 50 OPTION", px: "24,812.75", chg: "+0.84%" },
  { name: "NIFTY 50 FUTURE", px: "24,905.30", chg: "+0.79%" },
  { name: "BANK NIFTY OPTION", px: "51,240.30", chg: "+1.12%" },
  { name: "BANK NIFTY FUTURE", px: "51,388.00", chg: "+1.05%" },
  { name: "SENSEX", px: "81,506.20", chg: "+0.61%" },
  { name: "SENSEX FUTURE", px: "81,842.75", chg: "+0.58%" },
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

export function MarketView({ onBack }) {
  const [instrument, setInstrument] = useState(null);
  const pickInstrument = (name) => {
    setInstrument(name);
    toast.success(`${name} activated`, { description: "Demo only — market added to your watchlist." });
  };

  return (
    <Shell testid="market-view" onBack={onBack} title="Market"
      desc="Choose the instrument you want to trade. All prices shown are demo data.">
      <Reveal>
        <div className="rounded-2xl border border-edge bg-white p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">Instruments</p>
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {INSTRUMENTS.map((m) => {
              const active = instrument === m.name;
              return (
                <button
                  key={m.name}
                  data-testid={`market-instrument-${slug(m.name)}`}
                  onClick={() => pickInstrument(m.name)}
                  className={`group flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all duration-200 active:scale-[0.98] ${
                    active ? "border-signal bg-signal/5 shadow-glow-signal" : "border-edge bg-paper hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-lift"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse-dot" />}
                    <span className={`text-xs font-bold tracking-wide ${active ? "text-ink" : "text-slate group-hover:text-ink"}`}>{m.name}</span>
                  </span>
                  <span className="text-right">
                    <span className="block font-mono text-[11px] font-semibold text-ink">₹{m.px}</span>
                    <span className={`block font-mono text-[10px] font-semibold ${m.chg.startsWith("+") ? "text-signal" : "text-rose-500"}`}>{m.chg}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>
      {instrument && (
        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-edge bg-white p-5" data-testid="market-selection-summary">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate">Selected Market</p>
            <span className="rounded-full bg-signal/10 px-3 py-1 font-mono text-xs font-bold text-signal">{instrument}</span>
            <button
              data-testid="market-apply-button"
              onClick={() => toast.success("Market applied", { description: "Demo only — configuration was not saved." })}
              className="ml-auto rounded-full bg-ember px-6 py-2.5 text-xs font-semibold text-white transition-all hover:brightness-110 active:scale-95"
            >
              Apply
            </button>
          </div>
        </Reveal>
      )}
    </Shell>
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
