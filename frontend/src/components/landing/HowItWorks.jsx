import { motion } from "framer-motion";
import { Reveal, SectionTag } from "./Reveal";

const STEPS = [
  { n: "01", title: "Create Your Account", desc: "Register and create your secure OneStock account." },
  { n: "02", title: "Connect Your Broker", desc: "Connect a supported broker account and configure your trading preferences." },
  { n: "03", title: "Activate Your Strategy", desc: "Select your strategy, configure risk settings, and start monitoring your trades." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" data-testid="how-it-works-section" className="border-y border-edge bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        <Reveal>
          <SectionTag>How It Works</SectionTag>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Start Trading in 3 Simple Steps
          </h2>
        </Reveal>

        <div className="relative mt-16 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          <motion.div
            className="absolute left-6 top-0 h-full w-px bg-edge md:left-0 md:top-6 md:h-px md:w-full md:origin-left"
            initial={{ scaleY: 0, scaleX: 0 }}
            whileInView={{ scaleY: 1, scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "left top" }}
          />
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={0.2 + i * 0.18} y={30}>
              <div data-testid={`step-${s.n}`} className="relative flex gap-6 md:flex-col md:gap-0">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-edge bg-paper font-mono text-sm font-bold text-ember shadow-[0_0_0_8px_white]">
                  {s.n}
                </div>
                <div className="md:mt-8">
                  <h3 className="font-display text-xl font-bold tracking-tight">{s.title}</h3>
                  <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-slate">{s.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
