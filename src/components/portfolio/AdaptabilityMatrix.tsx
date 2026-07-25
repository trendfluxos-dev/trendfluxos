import { Briefcase, GraduationCap, LayoutTemplate, Users } from "lucide-react";

const SECTORS = [
  {
    sector: "Educational technology",
    icon: GraduationCap,
    org: "H&B EduVerse",
    desc: "Student acquisition, learning-community engagement and digital course distribution.",
  },
  {
    sector: "Global agency & SaaS",
    icon: LayoutTemplate,
    org: "Originate Marketing",
    desc: "High-volume international campaigns, B2B lead generation and scalable reporting.",
  },
  {
    sector: "Civic & non-profit",
    icon: Users,
    org: "Pabna Nagorik Committee",
    desc: "Advocacy campaigns, public trust management and engaged regional communities.",
  },
  {
    sector: "Startup & brand architecture",
    icon: Briefcase,
    org: "TrendFlux Digital",
    desc: "Zero-to-one brand identities, content systems and operator-grade digital foundations.",
  },
];

/** Cross-sector experience grid for the portfolio page. */
export function AdaptabilityMatrix() {
  return (
    <section className="border-y border-border bg-muted py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-14 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Cross-sector adaptability
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Versatile expertise across industries.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            Translating complex growth challenges into structured, measurable frameworks across
            EdTech, civic advocacy, global agencies and B2B SaaS.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:gap-8">
          {SECTORS.map(({ sector, icon: Icon, org, desc }) => (
            <article
              key={sector}
              className="flex flex-col items-start rounded-3xl border border-border bg-background p-6 transition-shadow duration-300 hover:shadow-lg md:p-8"
            >
              <span className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mb-3 font-display text-xl font-bold tracking-tight">{sector}</h3>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {org}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AdaptabilityMatrix;
