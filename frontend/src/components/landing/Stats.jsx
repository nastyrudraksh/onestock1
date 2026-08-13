import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { Reveal } from "./Reveal";

const Counter = ({ to, decimals = 0, prefix = "", suffix = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref} className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-ink">
      {prefix}{val.toFixed(decimals)}{suffix}
    </span>
  );
};

const STATS = [
  { to: 10, suffix: "K+", label: "Active Users" },
  { to: 50, prefix: "₹", suffix: "Cr+", label: "Trading Volume" },
  { to: 99.9, decimals: 1, suffix: "%", label: "Platform Uptime" },
  { to: 24, suffix: "/7", label: "Platform Monitoring" },
];

export default function Stats() {
  return (
    <section data-testid="stats-section" className="border-y border-edge bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-6 py-14 sm:px-12 md:grid-cols-4 lg:py-16">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} y={24}>
            <div
              data-testid={`stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={`flex flex-col items-start gap-2 px-2 md:px-8 ${
                i > 0 ? "md:border-l md:border-edge" : ""
              }`}
            >
              <Counter to={s.to} decimals={s.decimals || 0} prefix={s.prefix || ""} suffix={s.suffix || ""} />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate">{s.label}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
