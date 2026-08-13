const ITEMS = [
  { t: "NIFTY 50", v: "+0.84%" }, { t: "Smarter Trading", o: true },
  { t: "BANKNIFTY", v: "+1.12%" }, { t: "Automated Decisions", o: true },
  { t: "RELIANCE", v: "-0.32%" }, { t: "Better Control", o: true },
  { t: "TCS", v: "+0.67%" }, { t: "Real-Time Data", o: true },
  { t: "HDFCBANK", v: "+0.45%" }, { t: "Risk Managed", o: true },
];

export default function Marquee() {
  const row = (
    <div className="flex shrink-0 items-center">
      {ITEMS.map((it, i) => (
        <span key={i} className="flex items-center">
          {it.o ? (
            <span className="mx-8 font-display text-3xl sm:text-4xl font-bold tracking-tight text-outline-dark whitespace-nowrap">
              {it.t}
            </span>
          ) : (
            <span className="mx-8 flex items-baseline gap-2 whitespace-nowrap">
              <span className="font-mono text-xl sm:text-2xl font-semibold text-ink">{it.t}</span>
              <span className={`font-mono text-sm font-semibold ${it.v.startsWith("+") ? "text-signal" : "text-rose-500"}`}>
                {it.v}
              </span>
            </span>
          )}
          <span className="h-1.5 w-1.5 rounded-full bg-ember" />
        </span>
      ))}
    </div>
  );

  return (
    <div data-testid="ticker-marquee" className="overflow-hidden border-b border-edge bg-paper py-7 mask-fade-x">
      <div className="flex w-max animate-marquee">
        {row}
        <div aria-hidden="true" className="flex shrink-0 items-center">{row.props.children}</div>
      </div>
    </div>
  );
}
