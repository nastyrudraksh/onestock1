import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal, SectionTag } from "./Reveal";

const FAQS = [
  { q: "What is TradeSense?", a: "TradeSense is a financial technology platform that brings broker connectivity, strategy automation, portfolio monitoring, and market analytics together in a single dashboard — built for modern traders who want control without complexity." },
  { q: "How does automated trading work?", a: "You define a strategy and risk rules, connect your broker, and the platform monitors the market and executes orders on your behalf according to your configuration. You can pause, modify, or stop any strategy at any time." },
  { q: "Which brokers are supported?", a: "The platform is designed to connect with leading Indian brokerage accounts through secure, official API-based flows. The exact broker list shown in this prototype is illustrative demo content." },
  { q: "Is my account secure?", a: "Yes. We use encrypted connections, isolated execution environments, and never store your broker passwords. Connections are established through official broker authentication flows, and you can revoke access at any time." },
  { q: "Can I monitor my trades in real time?", a: "Absolutely. Positions, orders, P&L, and strategy status stream live to your dashboard, with instant alerts for fills, stops, and risk-limit events." },
  { q: "Can I cancel my subscription?", a: "Yes. There are no lock-ins. You can upgrade, downgrade, or cancel your plan at any time from your account settings, and your access continues until the end of the billing cycle." },
  { q: "Do you provide trading strategies?", a: "We provide strategy templates and automation tooling for educational and execution purposes. TradeSense does not provide investment advice, and no strategy guarantees profits." },
  { q: "How can I contact support?", a: "You can reach us through the Help Center, by email, or via priority support channels on higher plans. Our platform itself is monitored 24/7." },
];

export default function FAQ() {
  return (
    <section data-testid="faq-section" className="bg-paper py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 sm:px-12 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <SectionTag>FAQ</SectionTag>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Questions, Answered
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-slate">
            Everything you need to know about the platform. Can't find what you're
            looking for? Reach out to our support team anytime.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="lg:col-span-3">
          <Accordion type="single" collapsible className="w-full" data-testid="faq-accordion">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-edge" data-testid={`faq-item-${i}`}>
                <AccordionTrigger
                  data-testid={`faq-trigger-${i}`}
                  className="text-left font-display text-base sm:text-lg font-bold tracking-tight hover:text-ember hover:no-underline"
                >
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-slate">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
