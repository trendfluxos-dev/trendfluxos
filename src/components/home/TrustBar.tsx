import { TRUST } from "@/data/home";

/** Single-row brand-capability badge strip, sits below the hero. */
export const TrustBar = () => (
  <section className="relative border-y border-border bg-muted py-12" aria-label="Capabilities">
    <div className="mx-auto max-w-7xl px-6 lg:px-10">
      <p className="mb-7 text-center text-[10px] font-medium uppercase tracking-[0.4em] text-muted-foreground">
        One ecosystem · Six integrated layers
      </p>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
        {TRUST.map((t) => (
          <li
            key={t.label}
            className="group flex items-center justify-center gap-2 text-[12px] font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground"
          >
            <t.icon className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary" aria-hidden="true" />
            <span className="whitespace-nowrap">{t.label}</span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);