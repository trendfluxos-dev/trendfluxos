import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Megaphone,
  GraduationCap,
  Building2,
  Layers,
  BookOpenCheck,
  Images,
  Flag,
  Presentation,
  Wrench,
  Cpu,
  Mail,
} from "lucide-react";

/**
 * Ecosystem Navigator — sticky jump-nav that maps the whole public
 * ecosystem into eleven large tap targets. Uses semantic tokens only
 * so it inherits the site's theme without redefining colour.
 */
type Item = {
  label: string;
  to: string;
  eyebrow: string;
  desc: string;
  Icon: typeof Megaphone;
};

const ITEMS: Item[] = [
  { label: "Marketing",   to: "/services",      eyebrow: "01",  desc: "Growth, brand & performance services.",     Icon: Megaphone },
  { label: "EdTech",      to: "/edtech",        eyebrow: "02",  desc: "Kormoshikkha — courses, live, certificates.", Icon: GraduationCap },
  { label: "Enterprise",  to: "/enterprise",    eyebrow: "03",  desc: "Growth OS deployments for scaling teams.",  Icon: Building2 },
  { label: "Brands",      to: "/brands",        eyebrow: "04",  desc: "Sub-brands under the TrendFlux umbrella.",  Icon: Layers },
  { label: "Case Studies",to: "/showcase",      eyebrow: "05",  desc: "Deployed outcomes with audit trail.",       Icon: BookOpenCheck },
  { label: "Portfolio",   to: "/portfolio",     eyebrow: "06",  desc: "Operator work across eight brands.",        Icon: Images },
  { label: "The Stand",   to: "/the-stand",     eyebrow: "07",  desc: "জাতীয় দলিল — civic accountability record.",  Icon: Flag },
  { label: "Masterclass", to: "/masterclass",   eyebrow: "08",  desc: "Founder-led operator masterclasses.",       Icon: Presentation },
  { label: "Toolkit",     to: "/toolkit",       eyebrow: "09",  desc: "Playbooks, templates & operator tools.",    Icon: Wrench },
  { label: "Growth OS",   to: "/course/trendflux", eyebrow: "10", desc: "The TrendFlux Growth OS course.",         Icon: Cpu },
  { label: "Contact",     to: "/contact",       eyebrow: "11",  desc: "Book a strategy call or send a brief.",     Icon: Mail },
];

export default function EcosystemNavigator() {
  return (
    <section
      aria-labelledby="ecosystem-navigator-title"
      className="relative isolate bg-background py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Sticky header — pins while cards scroll past on desktop */}
        <div className="lg:sticky lg:top-20 lg:z-10 lg:-mx-4 lg:px-4 lg:py-6 lg:backdrop-blur-md lg:bg-background/75 lg:border-b lg:border-border/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
                Ecosystem Navigator
              </p>
              <h2
                id="ecosystem-navigator-title"
                className="font-display text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[44px] md:leading-[1.05]"
              >
                Jump into any surface of the TrendFlux ecosystem.
              </h2>
              <p className="mt-4 text-[15px] leading-[1.7] text-muted-foreground sm:text-[16.5px]">
                Eleven doorways — marketing, learning, enterprise, brands, civic. Every card lands you on a live public route.
              </p>
            </div>
            <div className="hidden lg:block">
              <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                {ITEMS.length.toString().padStart(2, "0")} routes
              </span>
            </div>
          </div>
        </div>

        {/* Card grid */}
        <ul
          role="list"
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-14 lg:grid-cols-3 lg:gap-6"
        >
          {ITEMS.map(({ label, to, eyebrow, desc, Icon }) => (
            <li key={to} className="group">
              <Link
                to={to}
                className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_50px_-20px_hsl(var(--primary)/0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-7"
                aria-label={`${label} — ${desc}`}
              >
                {/* Premium gradient wash on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                {/* Corner mark */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-5 top-5 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/70 transition-colors duration-300 group-hover:text-primary"
                >
                  {eyebrow}
                </span>

                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-background transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary/[0.06]">
                  <Icon
                    className="h-5 w-5 text-foreground/70 transition-colors duration-300 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </div>

                <h3 className="relative mt-6 font-display text-xl font-semibold tracking-[-0.01em] text-foreground sm:text-2xl">
                  {label}
                </h3>
                <p className="relative mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
                  {desc}
                </p>

                <span className="relative mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
                  Enter
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}