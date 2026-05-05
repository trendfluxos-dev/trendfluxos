type Testimonial = {
  quote: string;
  name: string;
  role: string;
  outcome: string;
};

export const Testimonials = ({
  title = "Trusted by Brands & Creators in Dhaka",
  items,
}: {
  title?: string;
  items: Testimonial[];
}) => {
  return (
    <section className="mt-14">
      <h2 className="text-center text-[10px] uppercase tracking-[0.4em] text-gold/70 mb-2">
        Case Notes
      </h2>
      <h3 className="text-center font-display text-2xl md:text-3xl text-white mb-8">{title}</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {items.map((t) => (
          <figure
            key={t.name}
            className="rounded-2xl border border-gold/25 bg-white/[0.04] p-6 flex flex-col"
          >
            <span className="text-3xl text-gold leading-none">“</span>
            <blockquote className="mt-2 text-sm text-white/80 leading-relaxed flex-1">
              {t.quote}
            </blockquote>
            <div className="mt-5 pt-4 border-t border-gold/15">
              <figcaption className="text-sm font-semibold text-white">{t.name}</figcaption>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">{t.role}</p>
              <p className="mt-3 text-xs text-gold">▲ {t.outcome}</p>
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
};
