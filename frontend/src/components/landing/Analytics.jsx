import { Check } from "lucide-react";
import { Reveal, SectionTag } from "./Reveal";
import { AreaTrend, PnlBars, Donut, growthData, monthlyPerf } from "./charts";

const BULLETS = [
  "Real-time portfolio monitoring",
  "Trading performance analytics",
  "Strategy tracking",
  "Profit & loss reporting",
  "Risk monitoring",
];

export default function Analytics() {
  return (
    <section data-testid="analytics-section" className="border-y border-edge bg-white py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 sm:px-12 lg:grid-cols-2">
        <Reveal>
          <SectionTag>Performance Analytics</SectionTag>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Turn Market Data Into Actionable Insights
          </h2>
          <p className="mt-5 max-w-md text-base md:text-lg leading-relaxed text-slate">
            Monitor performance across every strategy and position. Understand what
            works, where risk lives, and how your portfolio behaves — so every
            decision is backed by data, not guesswork.
          </p>
          <ul className="mt-8 space-y-3.5">
            {BULLETS.map((b, i) => (
              <Reveal key={b} delay={0.1 + i * 0.07} y={16}>
                <li className="flex items-center gap-3" data-testid={`analytics-bullet-${i}`}>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-signal/10">
                    <Check className="h-3.5 w-3.5 text-signal" strokeWidth={3} />
                  </span>
                  <span className="text-sm font-semibold text-ink">{b}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15} y={50}>
          <div className="relative">
            <div className="absolute -inset-4 -z-0 rounded-[2rem] bg-signal/10 blur-[60px]" />
            <div className="relative rounded-2xl border border-edge bg-paper p-5 shadow-lift" data-testid="analytics-panel">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate">Portfolio Growth</p>
                <span className="rounded-full bg-signal/10 px-2.5 py-1 font-mono text-xs font-semibold text-signal">+41.7% YoY</span>
              </div>
              <div className="mt-2">
                <AreaTrend data={growthData} height={150} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-edge bg-white p-3.5">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-slate">Weekly P&L (₹K)</p>
                  <div className="mt-1">
                    <PnlBars height={90} />
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-edge bg-white p-3.5">
                  <Donut value={68} size={92} stroke={9} />
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-slate">Win Rate</p>
                    <p className="mt-1 font-mono text-[10px] text-slate">Active Positions</p>
                    <p className="font-mono text-lg font-bold text-ink">12</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-edge bg-white p-3.5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-slate">Monthly Performance</p>
                  <p className="font-mono text-[9px] text-slate">Demo Data</p>
                </div>
                <div className="flex h-14 items-end gap-1.5">
                  {monthlyPerf.map((m, i) => (
                    <div key={i} className="group flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-sm bg-signal/80 transition-colors group-hover:bg-ember"
                        style={{ height: `${m.v}%` }}
                      />
                      <span className="font-mono text-[8px] text-slate">{m.m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
