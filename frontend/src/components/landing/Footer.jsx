import { TrendingUp } from "lucide-react";
import { scrollToSection } from "@/lib/scroll";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Dashboard", id: "home" },
      { label: "Trading Automation", id: "services" },
      { label: "Analytics", id: "features" },
      { label: "Broker Integration", id: "services" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", id: "about" },
      { label: "Services", id: "services" },
      { label: "Pricing", id: "pricing" },
      { label: "Contact", id: "contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", id: "contact" },
      { label: "FAQs", id: "faq" },
      { label: "Contact Support", id: "contact" },
      { label: "Privacy Policy", id: "contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", id: "contact" },
      { label: "Risk Disclosure", id: "contact" },
      { label: "Privacy Policy", id: "contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer id="contact" data-testid="footer" className="border-t border-night-line bg-ink">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-12">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper text-ink">
                <TrendingUp className="h-5 w-5" strokeWidth={2.4} />
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-paper">
                One<span className="text-ember">Stock</span>
              </span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cloud">
              Smarter Trading. Automated Decisions. Better Control. A modern
              fintech platform for trading automation, broker connectivity, and
              portfolio intelligence.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-cloud">{col.title}</p>
              <ul className="mt-5 space-y-3">
                {col.links.map((l, i) => (
                  <li key={`${l.label}-${i}`}>
                    <button
                      data-testid={`footer-link-${l.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                      onClick={() => scrollToSection(l.id)}
                      className="text-sm text-cloud/80 transition-colors hover:text-paper"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-night-line pt-8">
          <p className="max-w-4xl text-[11px] leading-relaxed text-cloud/70" data-testid="risk-disclaimer">
            Risk Disclosure: Trading in equities, derivatives, and other securities involves substantial risk of loss
            and is not suitable for every investor. Past performance is not indicative of future results. OneStock
            is a technology platform and does not provide investment advice, portfolio management, or guaranteed
            returns. This website is a design prototype — all data, statistics, pricing, and testimonials shown are
            fictional and for demonstration purposes only.
          </p>
          <div className="mt-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="font-mono text-xs text-cloud">© 2026 OneStock. All rights reserved.</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cloud/60">
              Secure · Transparent · Built for Modern Traders
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
