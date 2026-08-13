import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal, SectionTag } from "./Reveal";

export default function FinalCTA({ onCta }) {
  return (
    <section data-testid="final-cta-section" className="relative overflow-hidden bg-ink py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-0 bg-grid-dark" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/15 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 bg-noise" />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 left-0 select-none whitespace-nowrap font-display text-[22vw] font-bold leading-none text-outline-light opacity-40"
        animate={{ x: ["0%", "-12%"] }}
        transition={{ duration: 30, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
      >
        TRADESENSE
      </motion.span>

      <div className="relative mx-auto max-w-7xl px-6 sm:px-12">
        <Reveal>
          <SectionTag dark>Get Started Today</SectionTag>
          <h2 className="mt-5 max-w-3xl font-display text-4xl sm:text-6xl font-bold tracking-tighter text-paper">
            Ready to Upgrade Your Trading Experience?
          </h2>
          <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-cloud">
            Join the next generation of traders using smarter technology to
            monitor, manage, and automate their trading workflow.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              data-testid="final-cta-create-account-button"
              onClick={() => onCta("signup")}
              className="group inline-flex items-center gap-2 rounded-full bg-ember px-8 py-4 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95 shadow-glow-ember"
            >
              Create Free Account
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              data-testid="final-cta-talk-expert-button"
              onClick={() => onCta("contact")}
              className="inline-flex items-center gap-2 rounded-full border border-paper/20 px-8 py-4 text-sm font-semibold text-paper transition-colors duration-200 hover:bg-paper/10 active:scale-95"
            >
              Talk to an Expert
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
