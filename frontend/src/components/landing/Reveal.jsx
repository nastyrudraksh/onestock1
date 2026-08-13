import { motion } from "framer-motion";

export const Reveal = ({ children, delay = 0, y = 40, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

export const SectionTag = ({ children, dark = false }) => (
  <span
    className={`inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] ${
      dark ? "text-cloud" : "text-slate"
    }`}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse-dot" />
    {children}
  </span>
);
