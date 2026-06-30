import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, GraduationCap, Layers, Network } from "lucide-react";

/**
 * Shared cross-link surface that makes the three connected systems
 * legible everywhere in TrendFlux Digital:
 *
 *  1. কর্মশিক্ষা (Kormoshikkha) — the EdTech / learning surface
 *  2. TrendFlux Space          — the operator / community surface
 *  3. VerdaFlux Spectrum       — the operations & analytics surface
 *
 * Drop it into any page where the cross-system relationship needs to
 * be visible. Uses semantic design tokens only — no hardcoded colors.
 */

type Node = {
  id: "edtech" | "space" | "spectrum";
  badge: string;
  title: string;
  role: string;
  body: string;
  href: string;
  external: boolean;
  Icon: typeof Layers;
};

const NODES: Node[] = [
  {
    id: "edtech",
    badge: "Learn",
    title: "কর্মশিক্ষা · TED Plus",
    role: "EdTech & live cohort",
    body: "Courses, live classes, certificates and the teacher console.",
    href: "/edtech",
    external: false,
    Icon: GraduationCap,
  },
  {
    id: "space",
    badge: "Operate",
    title: "TrendFlux Space",
    role: "Operator hub for teachers",
    body: "Class life, planning, tutor tooling and content workflow.",
    href: "https://trendflux.space/",
    external: true,
    Icon: Network,
  },
  {
    id: "spectrum",
    badge: "Measure",
    title: "VerdaFlux Spectrum",
    role: "Analytics & ops layer",
    body: "Engagement, attendance and revenue signals across cohorts.",
    href: "https://spectrum.trendflux.space/",
    external: true,
    Icon: Layers,
  },
];

const ACTIVE_TONE = "border-primary/40 bg-primary/[0.06]";
const IDLE_TONE = "border-border/60 bg-card/40 hover:border-primary/30";

export interface TripleBridgeProps {
  active?: Node["id"];
  /** Title shown above the cards. */
  heading?: string;
  /** Subheading / supporting copy. */
  subheading?: string;
  /** Removes outer padding so it can sit inside an existing section. */
  bare?: boolean;
  className?: string;
}

export default function TripleBridge({
  active,
  heading = "One ecosystem · three connected systems",
  subheading = "Learning, operations and analytics share the same identity, the same brand and the same data signals.",
  bare = false,
  className,
}: TripleBridgeProps) {
  return (
    <section
      aria-label="Connected TrendFlux systems"
      className={[
        bare ? "" : "bg-background py-12 sm:py-16",
        className ?? "",
      ].join(" ")}
    >
      <div className={bare ? "" : "mx-auto max-w-5xl px-6 lg:px-10"}>
        <header className="mb-6 max-w-2xl">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
            <Layers className="h-3 w-3" aria-hidden /> Ecosystem
          </p>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {heading}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            {subheading}
          </p>
        </header>

        <ol className="grid gap-3 sm:grid-cols-3">
          {NODES.map((n, idx) => {
            const isActive = active === n.id;
            const Card = (
              <article
                className={[
                  "group relative h-full rounded-2xl border p-5 transition-colors",
                  isActive ? ACTIVE_TONE : IDLE_TONE,
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/65">
                    <n.Icon className="h-3 w-3 text-primary" aria-hidden />
                    {n.badge}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/40">
                    0{idx + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-[15px] font-semibold text-foreground">
                  {n.title}
                </h3>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.18em] text-primary/80">
                  {n.role}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-foreground/70">
                  {n.body}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-primary opacity-80 transition-opacity group-hover:opacity-100">
                  {isActive ? "You're here" : "Open"}
                  {!isActive && (n.external
                    ? <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    : <ArrowRight className="h-3.5 w-3.5" aria-hidden />)}
                </span>
              </article>
            );

            if (isActive) {
              return <li key={n.id} aria-current="true">{Card}</li>;
            }
            return (
              <li key={n.id}>
                {n.external ? (
                  <a
                    href={n.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                    aria-label={`${n.title} — opens in new tab`}
                  >
                    {Card}
                  </a>
                ) : (
                  <Link to={n.href} className="block h-full" aria-label={n.title}>
                    {Card}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>

        {/* Connector legend — explains the relationship */}
        <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-foreground/50">
          Learn → Operate → Measure · one operator, one identity, one stack.
        </p>
      </div>
    </section>
  );
}