import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaTrend, CandleChart, Sparkline, intradayData } from "./charts";

const MARKET = [
  { sym: "NIFTY 50", px: "24,812.75", chg: "+0.84%", up: true, pts: [4, 6, 5, 8, 7, 10, 12] },
  { sym: "BANKNIFTY", px: "51,240.30", chg: "+1.12%", up: true, pts: [3, 5, 7, 6, 9, 11, 13] },
  { sym: "RELIANCE", px: "2,945.10", chg: "-0.32%", up: false, pts: [10, 8, 9, 7, 8, 6, 5] },
  { sym: "TCS", px: "4,182.55", chg: "+0.67%", up: true, pts: [5, 7, 6, 9, 8, 10, 11] },
];

const ACTIVITY = [
  { side: "BUY", sym: "RELIANCE", qty: 50, px: "2,945.10", time: "14:32" },
  { side: "SELL", sym: "TCS", qty: 25, px: "4,190.00", time: "13:58" },
  { side: "BUY", sym: "HDFCBANK", qty: 100, px: "1,642.35", time: "11:20" },
];

export default function DashboardMockup() {
  return (
    <div
      data-testid="hero-dashboard-mockup"
      className="relative w-full max-w-xl rounded-2xl border border-edge bg-white shadow-panel overflow-hidden"
    >
      <div className="flex items-center gap-2 border-b border-edge bg-mist/60 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-3 rounded-md border border-edge bg-white px-2.5 py-0.5 font-mono text-[10px] text-slate">
          app.tradesense.io/dashboard
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-signal">
          <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse-dot" /> Live
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate">Portfolio Value</p>
            <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-1">₹24,86,530</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-signal/10 px-2.5 py-1 font-mono text-xs font-semibold text-signal">
            <ArrowUpRight className="h-3.5 w-3.5" /> +2.42%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-edge bg-paper p-2.5">
            <p className="font-mono text-[9px] uppercase tracking-wider text-slate">Today's P&L</p>
            <p className="mt-1 font-mono text-sm font-semibold text-signal">+₹18,240</p>
          </div>
          <div className="rounded-xl border border-edge bg-paper p-2.5">
            <p className="font-mono text-[9px] uppercase tracking-wider text-slate">Active Trades</p>
            <p className="mt-1 font-mono text-sm font-semibold text-ink">12</p>
          </div>
          <div className="rounded-xl border border-edge bg-paper p-2.5">
            <p className="font-mono text-[9px] uppercase tracking-wider text-slate">Win Rate</p>
            <p className="mt-1 font-mono text-sm font-semibold text-ink">68%</p>
          </div>
        </div>

        <div className="rounded-xl border border-edge p-3">
          <div className="flex items-center justify-between mb-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate">Market Overview</p>
            <p className="font-mono text-[10px] text-slate">NSE · Demo Data</p>
          </div>
          <AreaTrend data={intradayData} height={110} />
          <div className="mt-2 h-12">
            <CandleChart className="h-full w-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-edge p-3 space-y-2">
            {MARKET.slice(0, 2).map((m) => (
              <div key={m.sym} className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-[10px] font-semibold">{m.sym}</p>
                  <p className="font-mono text-[10px] text-slate">₹{m.px}</p>
                </div>
                <Sparkline points={m.pts} positive={m.up} className="h-5 w-12" />
                <span className={`font-mono text-[10px] font-semibold ${m.up ? "text-signal" : "text-rose-500"}`}>{m.chg}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-edge p-3 space-y-2">
            {ACTIVITY.slice(0, 2).map((a, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold ${
                  a.side === "BUY" ? "bg-signal/10 text-signal" : "bg-rose-500/10 text-rose-500"
                }`}>
                  {a.side === "BUY" ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                  {a.side}
                </span>
                <span className="font-mono text-[10px] font-semibold">{a.sym}</span>
                <span className="font-mono text-[10px] text-slate">x{a.qty}</span>
                <span className="font-mono text-[10px] text-slate">{a.time}</span>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button data-testid="mockup-buy-button" className="flex-1 rounded-lg bg-signal py-1.5 font-mono text-[10px] font-bold text-white transition-transform hover:scale-[1.03] active:scale-95">BUY</button>
              <button data-testid="mockup-sell-button" className="flex-1 rounded-lg bg-rose-500 py-1.5 font-mono text-[10px] font-bold text-white transition-transform hover:scale-[1.03] active:scale-95">SELL</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
