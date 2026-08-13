import { Lock, Activity, Cpu, FileText, Plug, Clock } from "lucide-react";
import { Reveal, SectionTag } from "./Reveal";

const ITEMS = [
  { icon: Lock, title: "Secure Infrastructure", desc: "Bank-grade encryption and isolated execution environments protect every session." },
  { icon: Activity, title: "Real-Time Monitoring", desc: "Live positions, orders, and P&L streaming to your dashboard with zero lag." },
  { icon: Cpu, title: "Smart Automation", desc: "Rule-based strategy execution that removes emotion from every trade." },
  { icon: FileText, title: "Transparent Reporting", desc: "Every order, fill, and fee is logged and exportable. No hidden numbers." },
  { icon: Plug, title: "Broker Connectivity", desc: "Connect supported broker accounts in minutes through a secure flow." },
  { icon: Clock, title: "24/7 Platform Availability", desc: "Round-the-clock monitoring and alerting, even when markets are closed." },
];

export default function WhyChooseUs() {
  return (
    <section id="features" data-testid="why-choose-us-section" className="bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        <Reveal>
          <SectionTag>Why TradeSense</SectionTag>
          <h2 className="mt-4 max-w-2xl font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Built for Traders Who Demand More
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-edge bg-edge sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it, i) => (
            <div
              key={it.title}
              data-testid={`why-card-${it.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="group relative bg-white p-8 transition-colors duration-300 hover:bg-mist/60"
            >
              <span className="font-mono text-xs font-semibold text-slate/60">/{String(i + 1).padStart(2, "0")}</span>
              <div className="mt-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-edge bg-paper text-ink transition-colors duration-300 group-hover:border-ember group-hover:bg-ember group-hover:text-white">
                <it.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold tracking-tight">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
