import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ShieldCheck, Lock, LineChart, TrendingUp } from "lucide-react";
import DashboardMockup from "./DashboardMockup";
import { scrollToSection } from "@/lib/scroll";

const LINES = ["Trade Smarter", "With Powerful", "Automation."];

const MaskedLine = ({ text, index }) => (
  <span className="block overflow-hidden pb-1 -mb-1">
    <motion.span
      className={`block font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.04] ${
        index === 2 ? "text-ember" : "text-ink"
      }`}
      initial={{ y: "112%" }}
      animate={{ y: 0 }}
      transition={{ duration: 0.9, delay: 0.15 + index * 0.13, ease: [0.16, 1, 0.3, 1] }}
    >
      {text}
    </motion.span>
  </span>
);

const FloatingPill = ({ className, children, delay = 0, duration = 4 }) => (
  <motion.div
    className={`absolute z-20 flex items-center gap-2 rounded-full border border-edge bg-white/90 px-3.5 py-2 shadow-lift backdrop-blur-md ${className}`}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
    transition={{
      opacity: { delay: delay + 0.9, duration: 0.5 },
      scale: { delay: delay + 0.9, duration: 0.5 },
      y: { repeat: Infinity, duration, ease: "easeInOut", delay },
    }}
  >
    {children}
  </motion.div>
);

export default function Hero({ onCta }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 120, damping: 18 });

  const onMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section
      id="home"
      data-testid="hero-section"
      onMouseMove={onMouseMove}
      className="relative overflow-hidden bg-paper bg-grid-light pt-6 lg:pt-10"
    >
      <div className="pointer-events-none absolute -top-32 right-[-10%] h-[480px] w-[480px] rounded-full bg-signal/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-20%] left-[-8%] h-[420px] w-[420px] rounded-full bg-ember/10 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-noise" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 pb-20 pt-14 sm:px-12 lg:grid-cols-2 lg:gap-10 lg:pb-28 lg:pt-24">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-edge bg-white px-4 py-1.5"
            data-testid="hero-badge"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse-dot" />
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate">
              Next-Gen Trading Technology
            </span>
          </motion.div>

          <h1 data-testid="hero-heading" className="max-w-xl">
            {LINES.map((l, i) => (
              <MaskedLine key={l} text={l} index={i} />
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-6 max-w-md text-base md:text-lg leading-relaxed text-slate"
            data-testid="hero-subtext"
          >
            Connect your broker, automate your trading strategies, monitor your
            portfolio, and make data-driven decisions from one powerful platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <button
              data-testid="hero-get-started-button"
              onClick={() => onCta("signup")}
              className="group inline-flex items-center gap-2 rounded-full bg-ember px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-95 shadow-glow-ember"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              data-testid="hero-explore-services-button"
              onClick={() => scrollToSection("services")}
              className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-7 py-3.5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-ink/5 active:scale-95"
            >
              Explore Services
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.95 }}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2"
            data-testid="hero-trust-indicator"
          >
            {[
              { icon: ShieldCheck, label: "Secure" },
              { icon: Lock, label: "Transparent" },
              { icon: LineChart, label: "Built for Modern Traders" },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate">
                <Icon className="h-3.5 w-3.5 text-signal" />
                {label}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative [perspective:1400px]"
        >
          <div className="absolute inset-0 -z-0 translate-y-8 scale-95 rounded-[2rem] bg-signal/15 blur-[70px]" />
          <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative z-10">
            <DashboardMockup />
          </motion.div>

          <FloatingPill className="-top-5 -right-3 sm:-right-8" delay={0.2}>
            <TrendingUp className="h-3.5 w-3.5 text-signal" />
            <span className="font-mono text-xs font-semibold text-ink">NIFTY <span className="text-signal">+0.84%</span></span>
          </FloatingPill>
          <FloatingPill className="-left-3 sm:-left-10 top-1/3" delay={0.6} duration={5}>
            <span className="h-2 w-2 rounded-full bg-signal animate-pulse-dot" />
            <span className="font-mono text-xs font-semibold text-ink">BUY RELIANCE <span className="text-slate">@ ₹2,945</span></span>
          </FloatingPill>
          <FloatingPill className="-bottom-5 right-8" delay={1} duration={4.5}>
            <span className="font-mono text-xs font-semibold text-slate">P&L Today</span>
            <span className="font-mono text-xs font-bold text-signal">+₹18,240</span>
          </FloatingPill>
        </motion.div>
      </div>
    </section>
  );
}
