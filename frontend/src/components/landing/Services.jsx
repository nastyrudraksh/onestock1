import { Bot, Link2, PieChart, BarChart3, ShieldCheck, Headset, ArrowRight } from "lucide-react";
import { Reveal, SectionTag } from "./Reveal";

const SERVICES = [
  { icon: Bot, title: "Automated Trading", desc: "Automate predefined trading strategies and reduce manual intervention.", span: true },
  { icon: Link2, title: "Broker Integration", desc: "Connect supported brokerage accounts through a secure and simple process." },
  { icon: PieChart, title: "Portfolio Management", desc: "Monitor investments, positions, performance, and portfolio allocation in one place." },
  { icon: BarChart3, title: "Market Analytics", desc: "Get market insights, technical indicators, performance metrics, and trading data." },
  { icon: ShieldCheck, title: "Risk Management", desc: "Set trading limits, monitor exposure, and manage risk more effectively." },
  { icon: Headset, title: "Trading Support", desc: "Get assistance with account setup, platform usage, and trading technology.", span: true },
];

export default function Services() {
  return (
    <section id="services" data-testid="services-section" className="bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        <Reveal>
          <SectionTag>Our Services</SectionTag>
          <h2 className="mt-4 max-w-2xl font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Everything You Need to Trade Smarter
          </h2>
          <p className="mt-4 max-w-xl text-base md:text-lg text-slate">
            Powerful tools and services designed to simplify your trading experience.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06} className={s.span ? "lg:col-span-2" : ""}>
              <div
                data-testid={`service-card-${s.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="group relative h-full overflow-hidden rounded-2xl border border-edge bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-ember/0 blur-2xl transition-all duration-500 group-hover:bg-ember/10" />
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-signal transition-colors duration-300 group-hover:bg-ember group-hover:text-white">
                  <s.icon className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <h3 className="font-display text-xl font-bold tracking-tight">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate">{s.desc}</p>
                <button
                  data-testid={`service-learn-more-${s.title.toLowerCase().replace(/\s+/g, "-")}`}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors group-hover:text-ember"
                >
                  Learn More
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
