export type PortfolioHighlight = {
  title: string;
  tag: string;
  description: string;
  metric: string;
};

export const PORTFOLIO_HIGHLIGHTS: PortfolioHighlight[] = [
  {
    title: "Pabna Nagorik Committee",
    tag: "Civic Brand · Bangladesh",
    description:
      "4.85 Lakh+ views, 82% organic reach, 166 designs and 22 reels published as a structured content engine.",
    metric: "4.85L+ Views",
  },
  {
    title: "TrendFlux Ecosystem",
    tag: "Founder · Growth Studio",
    description:
      "AI-driven growth systems delivering 45%+ engagement growth across founder-led brands and consultancies.",
    metric: "45%+ Growth",
  },
  {
    title: "Debate Emon",
    tag: "Personal Brand · Education",
    description:
      "50,000+ youth engagement with 65% interaction growth via reels, long-form content and authority funnels.",
    metric: "65% Interaction",
  },
];

const PortfolioHighlightsSection = () => {
  return (
    <section className="px-6 lg:px-10 py-24 relative" aria-labelledby="portfolio-highlights-heading">
      <div className="absolute inset-0 bg-gradient-hero opacity-50" aria-hidden />
      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
          <div>
            <p className="text-primary uppercase tracking-[0.3em] text-xs mb-3">
              Portfolio Highlights
            </p>
            <h2
              id="portfolio-highlights-heading"
              className="font-display text-3xl md:text-5xl font-bold max-w-2xl"
            >
              Brands & systems <span className="text-gradient">built end-to-end</span>
            </h2>
          </div>
          <p className="text-foreground/60 max-w-md text-sm">
            Selected engagements where strategy, content and automation came
            together as a single growth machine.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PORTFOLIO_HIGHLIGHTS.map((p) => (
            <article
              key={p.title}
              className="glass glass-hover rounded-3xl p-7 group"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-primary">
                {p.tag}
              </span>
              <h3 className="font-display text-2xl font-bold mt-3">{p.title}</h3>
              <p className="text-gold font-semibold mt-2">{p.metric}</p>
              <p className="text-foreground/70 mt-4 leading-relaxed text-sm">
                {p.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioHighlightsSection;