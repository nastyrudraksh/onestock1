import { Star } from "lucide-react";
import { Reveal, SectionTag } from "./Reveal";

const TESTIMONIALS = [
  {
    quote: "OneStock simplified the way I monitor my trading strategies. Everything is available from one dashboard.",
    name: "Aarav Mehta", role: "Active Trader",
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3ODY2MDY2ODN8MA&ixlib=rb-4.1.0&q=85",
  },
  {
    quote: "The risk controls and real-time alerts changed how our desk operates. Clean, fast, and genuinely reliable.",
    name: "Priya Nair", role: "Portfolio Manager",
    img: "https://images.unsplash.com/photo-1676989880361-091e12efc056?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3ODY2MDY2ODN8MA&ixlib=rb-4.1.0&q=85",
  },
  {
    quote: "Broker connectivity that used to take weeks of integration now takes minutes. The analytics layer is superb.",
    name: "Rohan Kapoor", role: "Fintech Consultant",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3ODY2MDY2ODN8MA&ixlib=rb-4.1.0&q=85",
  },
];

export default function Testimonials() {
  return (
    <section id="about" data-testid="testimonials-section" className="border-y border-edge bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        <Reveal>
          <SectionTag>Testimonials</SectionTag>
          <h2 className="mt-4 max-w-2xl font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Trusted by Modern Traders
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1} className={i === 1 ? "md:translate-y-8" : ""}>
              <figure
                data-testid={`testimonial-card-${i}`}
                className="flex h-full flex-col rounded-2xl border border-edge bg-paper p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-ember text-ember" />
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 text-base leading-relaxed text-ink">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3.5 border-t border-edge pt-6">
                  <img
                    src={t.img}
                    alt={t.name}
                    loading="lazy"
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-edge"
                  />
                  <div>
                    <p className="font-display text-sm font-bold tracking-tight">{t.name}</p>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-slate">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
