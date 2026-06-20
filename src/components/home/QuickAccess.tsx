import { Link } from "react-router-dom";
import {
  Compass,
  Layers,
  GraduationCap,
  Briefcase,
  Mail,
  ShieldCheck,
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
  { label: "Services",   desc: "What we build",          icon: Briefcase,    to: "/services" },
  { label: "Ecosystem",  desc: "How it connects",        icon: Layers,       to: "/ecosystem" },
  { label: "Case Work",  desc: "Proof & systems",        icon: Compass,      to: "/portfolio" },
  { label: "KormoShikkha", desc: "Online edtech",        icon: GraduationCap, href: EDTECH.url, external: true, badge: "Live" },
  { label: "Enterprise", desc: "Private control",        icon: ShieldCheck,  to: "/enterprise" },
  { label: "Contact",    desc: "Talk to the team",       icon: Mail,         to: "/contact" },
];

/**
 * Lightweight feature-discovery strip below the hero.
 * Surfaces the six primary destinations so first-time visitors can navigate
 * directly without scrolling the full home narrative.
 */
export const QuickAccess = () => (
  <section className="relative border-b border-border bg-background py-12 sm:py-14" aria-label="Quick access">
    <div className="mx-auto max-w-7xl px-6 lg:px-10">
      <p className="mb-6 text-center text-[10px] font-medium uppercase tracking-[0.4em] text-muted-foreground">
        Quick access · Find what you need
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ITEMS.map((it) => {
          const inner = (
            <>
              <span className="flex items-center justify-between">
                <it.icon className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110" aria-hidden />
                {it.badge && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-primary">
                    <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                    {it.badge}
                  </span>
                )}
              </span>
              <span className="mt-3 block text-[13px] font-semibold text-foreground">{it.label}</span>
              <span className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">{it.desc}</span>
            </>
          );
          const cls =
            "group block rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-sm";
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
    </div>
  </section>
);