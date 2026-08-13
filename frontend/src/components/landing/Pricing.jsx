import { Check } from "lucide-react";
import { Reveal, SectionTag } from "./Reveal";
import { scrollToSection } from "@/lib/scroll";

const PLANS = [
  {
    name: "Starter", price: "₹999", period: "/month",
    features: ["Basic analytics", "Portfolio monitoring", "Market insights", "Email support"],
    cta: "Start Free", popular: false, action: "signup",
  },
  {
    name: "Professional", price: "₹2,499", period: "/month",
    features: ["Advanced analytics", "Automated strategies", "Broker connectivity", "Risk management", "Priority support"],
    cta: "Get Started", popular: true, action: "signup",
  },
  {
    name: "Business", price: "₹4,999", period: "/month",
    features: ["Advanced automation", "Multiple accounts", "Advanced reporting", "Dedicated support", "API access"],
    cta: "Contact Sales", popular: false, action: "contact",
  },
];

export default function Pricing({ onCta }) {
  return (
    <section id="pricing" data-testid="pricing-section" className="bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        <Reveal className="text-left">
          <SectionTag>Pricing</SectionTag>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 max-w-xl text-base md:text-lg text-slate">
            Choose the plan that matches your trading style. Upgrade or cancel anytime.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1} y={40} className={p.popular ? "md:-mt-4" : ""}>
              <div
                data-testid={`pricing-card-${p.name.toLowerCase()}`}
                className={`relative flex h-full flex-col rounded-2xl border bg-white p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift ${
                  p.popular ? "border-ember shadow-glow-ember md:scale-[1.03]" : "border-edge"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3.5 left-8 rounded-full bg-ember px-4 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                    Most Popular
                  </span>
                )}
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate">{p.name}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold tracking-tighter">{p.price}</span>
                  <span className="font-mono text-sm text-slate">{p.period}</span>
                </div>
                <ul className="mt-7 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full ${p.popular ? "bg-ember/10" : "bg-signal/10"}`}>
                        <Check className={`h-3 w-3 ${p.popular ? "text-ember" : "text-signal"}`} strokeWidth={3} />
                      </span>
                      <span className="text-sm text-ink">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  data-testid={`pricing-cta-${p.name.toLowerCase()}`}
                  onClick={() => (p.action === "contact" ? scrollToSection("contact") : onCta("signup"))}
                  className={`mt-8 w-full rounded-full py-3.5 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                    p.popular
                      ? "bg-ember text-white hover:brightness-110"
                      : "border border-ink/10 bg-white text-ink hover:bg-ink/5"
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-10 font-mono text-xs text-slate" data-testid="pricing-demo-note">
            * Pricing and services shown are prototype/demo content for illustration only.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
