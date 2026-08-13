import { ArrowUpRight, ArrowDownRight, ArrowRight, Activity } from "lucide-react";
import { Reveal, SectionTag } from "./Reveal";
import { AreaTrend, growthData } from "./charts";

const METRICS = [
  { label: "Portfolio Balance", value: "₹24.8L", delta: "+2.42%", up: true },
  { label: "Available Funds", value: "₹3.2L", delta: null },
  { label: "Active Trades", value: "12", delta: null },
  { label: "Total P&L", value: "+₹4.2L", delta: "+19.8%", up: true },
  { label: "Daily P&L", value: "+₹18.2K", delta: "+0.74%", up: true },
];

const WATCHLIST = [
  { sym: "RELIANCE", px: "2,945.10", chg: "-0.32%", up: false },
  { sym: "TCS", px: "4,182.55", chg: "+0.67%", up: true },
  { sym: "HDFCBANK", px: "1,642.35", chg: "+0.45%", up: true },
  { sym: "INFY", px: "1,584.20", chg: "+1.08%", up: true },
  { sym: "SBIN", px: "812.60", chg: "-0.21%", up: false },
];

const TXNS = [
  { time: "14:32", sym: "RELIANCE", side: "BUY", qty: 50, px: "2,945.10", status: "Executed" },
  { time: "13:58", sym: "TCS", side: "SELL", qty: 25, px: "4,190.00", status: "Executed" },
  { time: "11:20", sym: "HDFCBANK", side: "BUY", qty: 100, px: "1,642.35", status: "Executed" },
];

const STRATEGIES = [
  { name: "Momentum Alpha", status: "Running" },
  { name: "Mean Reversion v2", status: "Running" },
  { name: "Breakout Scout", status: "Paused" },
];

export default function PlatformPreview({ onCta }) {
  return (
    <section data-testid="platform-preview-section" className="relative overflow-hidden bg-ink py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-signal/10 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 bg-noise" />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-12">
        <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SectionTag dark>Platform Preview</SectionTag>
            <h2 className="mt-4 max-w-xl font-display text-4xl sm:text-5xl font-bold tracking-tight text-paper">
              One Platform. Complete Trading Control.
            </h2>
          </div>
          <button
            data-testid="platform-explore-button"
            onClick={() => onCta("signup")}
            className="group inline-flex items-center gap-2 rounded-full bg-ember px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95 shadow-glow-ember"
          >
            Explore the Platform
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </Reveal>

        <Reveal delay={0.15} y={60}>
          <div className="relative mt-14">
            <div className="absolute inset-0 translate-y-6 scale-[0.98] rounded-[2rem] bg-signal/20 blur-[80px]" />
            <div
              data-testid="platform-dashboard-mockup"
              className="relative rounded-2xl border border-night-line bg-panel p-4 shadow-panel sm:p-6"
            >
              <div className="flex items-center justify-between border-b border-night-line pb-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-signal" />
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-cloud">Trading Dashboard</span>
                </div>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-signal">
                  <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse-dot" /> Live · Demo
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
                {METRICS.map((m) => (
                  <div key={m.label} className="rounded-xl border border-night-line bg-ink/40 p-3.5">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-cloud">{m.label}</p>
                    <p className={`mt-1.5 font-mono text-base font-bold ${m.up ? "text-signal" : "text-paper"}`}>{m.value}</p>
                    {m.delta && <p className="font-mono text-[10px] text-signal">{m.delta}</p>}
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div className="rounded-xl border border-night-line bg-ink/40 p-4 lg:col-span-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cloud">Portfolio Growth · 12M</p>
                    <span className="font-mono text-xs font-semibold text-signal">+41.7%</span>
                  </div>
                  <AreaTrend data={growthData} dark height={190} />
                </div>
                <div className="rounded-xl border border-night-line bg-ink/40 p-4 lg:col-span-2">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-cloud">Market Watchlist</p>
                  <div className="space-y-2.5">
                    {WATCHLIST.map((w) => (
                      <div key={w.sym} className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-paper">{w.sym}</span>
                        <span className="font-mono text-xs text-cloud">₹{w.px}</span>
                        <span className={`inline-flex items-center gap-0.5 font-mono text-[11px] font-semibold ${w.up ? "text-signal" : "text-rose-400"}`}>
                          {w.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {w.chg}
                        </span>
                        <div className="flex gap-1">
                          <button data-testid={`watchlist-buy-${w.sym.toLowerCase()}`} className="rounded bg-signal/15 px-2 py-0.5 font-mono text-[9px] font-bold text-signal transition-colors hover:bg-signal hover:text-ink">B</button>
                          <button data-testid={`watchlist-sell-${w.sym.toLowerCase()}`} className="rounded bg-rose-500/15 px-2 py-0.5 font-mono text-[9px] font-bold text-rose-400 transition-colors hover:bg-rose-500 hover:text-white">S</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-night-line bg-ink/40 p-4">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-cloud">Recent Transactions</p>
                  <div className="space-y-2.5">
                    {TXNS.map((t, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] text-cloud">{t.time}</span>
                        <span className="font-mono text-xs font-semibold text-paper">{t.sym}</span>
                        <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold ${t.side === "BUY" ? "bg-signal/15 text-signal" : "bg-rose-500/15 text-rose-400"}`}>{t.side}</span>
                        <span className="font-mono text-[10px] text-cloud">x{t.qty}</span>
                        <span className="font-mono text-[10px] text-signal">{t.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-night-line bg-ink/40 p-4">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-cloud">Strategy Status</p>
                  <div className="space-y-2.5">
                    {STRATEGIES.map((s) => (
                      <div key={s.name} className="flex items-center justify-between">
                        <span className="font-mono text-xs text-paper">{s.name}</span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold ${
                          s.status === "Running" ? "bg-signal/15 text-signal" : "bg-amber-500/15 text-amber-400"
                        }`}>
                          <span className={`h-1 w-1 rounded-full ${s.status === "Running" ? "bg-signal animate-pulse-dot" : "bg-amber-400"}`} />
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-night-line bg-ink/40 p-4">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-cloud">Risk Indicator</p>
                  <div className="flex h-2.5 overflow-hidden rounded-full">
                    <div className="w-[35%] bg-signal" />
                    <div className="w-[30%] bg-amber-400/70" />
                    <div className="w-[35%] bg-rose-500/60" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-signal">Low-Moderate</span>
                    <span className="font-mono text-[10px] text-cloud">Exposure 34%</span>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-cloud">
                    Auto-deleverage triggers at 60% exposure. Limits configurable per strategy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
