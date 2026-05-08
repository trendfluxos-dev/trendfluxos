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
      <h3 className="text-center font-display text-2xl md:text-3xl text-[#111111] mb-8">{title}</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {items.map((t) => (
          <figure
            key={t.name}
            className="rounded-2xl border border-[#E5E7EB] bg-white p-6 flex flex-col shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)] transition"
          >
            <span className="text-3xl text-gold leading-none">“</span>
            <blockquote className="mt-2 text-sm text-[#4B5563] leading-relaxed flex-1">
              {t.quote}
            </blockquote>
            <div className="mt-5 pt-4 border-t border-[#E5E7EB]">
              <figcaption className="text-sm font-semibold text-[#111111]">{t.name}</figcaption>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#4B5563]">{t.role}</p>
              <p className="mt-3 text-xs text-gold">▲ {t.outcome}</p>
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
};
