import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Compass,
  Crown,
  GraduationCap,
  Headphones,
  Layers,
  Mail,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { EDTECH } from "@/config/edtech";
import { track } from "@/lib/analytics";

type Item = {
  label: string;
  desc: string;
  icon: LucideIcon;
  to?: string;
  href?: string;
  external?: boolean;
  badge?: string;
};

const ITEMS: Item[] = [
  { label: "Services",     desc: "Systems we build & ship",      icon: Briefcase,    to: "/services" },
  { label: "Ecosystem",    desc: "How every surface connects",   icon: Layers,       to: "/ecosystem" },
  { label: "Case Work",    desc: "Proof, results & playbooks",   icon: Compass,      to: "/portfolio" },
  { label: "The Stand",    desc: "Editorial · long-form record", icon: BookOpen,     to: "/the-stand" },
  { label: "Audio Stories",desc: "Listen to chapter I & II",     icon: Headphones,   to: "/stories/ai-expert-emon" },
  { label: "Masterclass",  desc: "Live cohorts & curricula",     icon: Sparkles,     to: "/masterclass" },
  { label: "কর্মশিক্ষা", desc: "EdTech অনলাইন platform",       icon: GraduationCap, to: EDTECH.routes.home, badge: "Live" },
  { label: "Enterprise",   desc: "Private, NDA-grade control",   icon: ShieldCheck,  to: "/enterprise" },
  { label: "LuxeVeil",     desc: "Invite-only sub-brand",        icon: Crown,        to: "/luxe-veil" },
  { label: "Contact",      desc: "Talk to the team directly",    icon: Mail,         to: "/contact" },
];

/**
 * Wayfinding directory below the hero.
 * The single most-important "what's inside this site" surface — a first-time
 * visitor lands, glances here, and within a few seconds knows every primary
 * destination available. Numbered tiles read like a calm institutional
 * directory rather than a hero strip.
 */
export const QuickAccess = () => (
  <section
    className="relative border-y border-border bg-background py-16 sm:py-20 lg:py-24"
    aria-labelledby="quick-access-heading"
  >
    {/* hairline top accent */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
    />

    <div className="mx-auto max-w-7xl px-6 lg:px-10">
      {/* Heading block */}
      <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
        <span className="cd-eyebrow">Directory · Find what you need</span>
        <h2
          id="quick-access-heading"
          className="mt-5 font-display text-[26px] font-semibold leading-[1.1] tracking-[-0.02em] text-foreground sm:text-[36px]"
        >
          Everything inside the TrendFlux ecosystem
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[14px] leading-[1.7] text-muted-foreground sm:text-[15px]">
          Ten primary surfaces — pick the one closest to what you're here for.
          Every tile opens a real, working part of the system.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {ITEMS.map((it, i) => {
          const idx = String(i + 1).padStart(2, "0");
          const code = `M${i + 1}`;
          const inner = (
            <>
              <span aria-hidden className="cd-notch">{code}</span>
              <span className="flex items-start justify-between">
                <span className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] tabular-nums tracking-[0.18em] text-muted-foreground/70">
                    {idx}
                  </span>
                  <span
                    aria-hidden
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/40 text-primary transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary/[0.06]"
                  >
                    <it.icon className="h-4 w-4" />
                  </span>
                </span>
                {it.badge ? (
                  <span className="mr-10 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-primary">
                    <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                    {it.badge}
                  </span>
                ) : (
                  <ArrowUpRight
                    aria-hidden
                    className="mr-10 h-3.5 w-3.5 text-muted-foreground/50 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                )}
              </span>
              <span
                lang={/[\u0980-\u09FF]/.test(it.label) ? "bn" : undefined}
                className={
                  "mt-5 block text-[14px] tracking-[-0.005em] text-foreground group-hover:text-primary transition-colors " +
                  (/[\u0980-\u09FF]/.test(it.label)
                    ? "font-bold text-[15px] leading-[1.25]"
                    : "font-semibold")
                }
              >
                {it.label}
              </span>
              <span className="mt-1 block text-[12.5px] leading-[1.55] text-muted-foreground">
                {it.desc}
              </span>
              <span aria-hidden className="mt-4 flex items-center gap-2">
                <span className="h-px flex-1 bg-border/70 group-hover:bg-primary/50 transition-colors" />
                <span className="cd-mono cd-mono-accent">Open</span>
              </span>
            </>
          );
          const cls =
            "cd-card group block h-full rounded-xl p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
          return (
            <li key={it.label}>
              {it.external && it.href ? (
                <a
                  href={it.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("quick_access_click", { label: it.label, external: true })}
                  className={cls}
                >
                  {inner}
                </a>
              ) : (
                <Link
                  to={it.to ?? "/"}
                  onClick={() => track("quick_access_click", { label: it.label })}
                  className={cls}
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      {/* Footer line: pointer to the full ecosystem map */}
      <div className="mt-10 flex items-center justify-center gap-2 text-[12px] text-muted-foreground sm:mt-12">
        <span className="hidden h-px w-12 bg-border sm:inline-block" />
        <Link
          to="/ecosystem"
          className="group inline-flex items-center gap-1.5 font-medium text-foreground transition-colors hover:text-primary"
        >
          See how every surface connects
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
        <span className="hidden h-px w-12 bg-border sm:inline-block" />
      </div>
    </div>
  </section>
);