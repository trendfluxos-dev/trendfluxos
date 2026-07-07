import { Fragment } from "react";
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

        {/* Three-pillar architectural diagram — visualises Learn → Operate → Measure data flow */}
        <figure
          aria-label="Learn to Operate to Measure — data flow diagram"
          className="relative mb-8 hidden overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 sm:block"
        >
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-4">
            {NODES.map((n, idx) => (
              <Fragment key={n.id}>
                <div className="flex flex-col items-center text-center">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-primary/40 bg-primary/[0.08] shadow-[0_0_40px_hsl(var(--primary)/0.15)]">
                    <n.Icon className="h-8 w-8 text-primary" aria-hidden />
                    <span className="absolute -top-2 -right-2 rounded-full border border-primary/40 bg-background px-1.5 py-0.5 font-mono text-[9px] font-semibold text-primary">
                      0{idx + 1}
                    </span>
                  </div>
                  <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                    {n.badge}
                  </span>
                  <span className="mt-1 text-[13px] font-semibold text-foreground">
                    {n.title.split("·")[0].trim()}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {n.role}
                  </span>
                </div>
                {idx < NODES.length - 1 && (
                  <svg
                    viewBox="0 0 80 24"
                    className="h-6 w-full text-primary"
                    fill="none"
                    aria-hidden
                  >
                    <defs>
                      <marker
                        id={`arrowhead-${idx}`}
                        markerWidth="8"
                        markerHeight="8"
                        refX="6"
                        refY="4"
                        orient="auto"
                      >
                        <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
                      </marker>
                    </defs>
                    <line
                      x1="0"
                      y1="12"
                      x2="72"
                      y2="12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                      markerEnd={`url(#arrowhead-${idx})`}
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        from="0"
                        to="-14"
                        dur="1.4s"
                        repeatCount="indefinite"
                      />
                    </line>
                  </svg>
                )}
              </Fragment>
            ))}
          </div>
          {/* Feedback loop arc — Measure informs Learn */}
          <svg
            viewBox="0 0 600 60"
            className="mt-4 h-10 w-full text-primary/50"
            fill="none"
            aria-hidden
          >
            <defs>
              <marker id="loop-head" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
              </marker>
            </defs>
            <path
              d="M 560 10 C 560 55, 40 55, 40 15"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 3"
              markerEnd="url(#loop-head)"
            />
            <text
              x="300"
              y="52"
              textAnchor="middle"
              className="fill-current font-mono"
              fontSize="9"
              letterSpacing="3"
            >
              SIGNAL FEEDBACK · MEASURE → LEARN
            </text>
          </svg>
          <figcaption className="sr-only">
            Data flows left-to-right from Learn (কর্মশিক্ষা) into Operate (TrendFlux Space) into Measure (VerdaFlux Spectrum), then loops back as signal feedback informing the next learning cycle.
          </figcaption>
        </figure>

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