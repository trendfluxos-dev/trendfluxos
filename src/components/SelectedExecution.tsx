import { useState } from "react";
import { ArrowUpRight, X, ExternalLink, Monitor, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

type Project = {
  index: string;
  category: string;
  title: string;
  summary: string;
  responsibilities: string[];
  stack: string[];
  href: string;
  external?: boolean;
  thumb: "grid" | "orbit" | "stack" | "wave" | "pulse";
};

const PROJECTS: Project[] = [
  {
    index: "01",
    category: "Civic memory · Digital archive",
    title: "The Stand — Documented Public Record",
    summary:
      "A Bangla-first civic memory experience preserving documented public records — built as a documentary, not a dashboard.",
    responsibilities: [
      "Editorial system design",
      "Bangla-first typography stack",
      "Documented press archive (18 verified reports)",
      "Civic memory layer · জুলাই ২০২৪",
    ],
    stack: ["React", "Editorial type system", "Supabase", "AI workflows"],
    href: "/the-stand",
    thumb: "grid",
  },
  {
    index: "02",
    category: "Premium ecosystem · Invite-only",
    title: "Luxe Veil — Gated Access Infrastructure",
    summary:
      "Invite-only premium ecosystem with admin approval flow, token persistence, and a restrained editorial veil.",
    responsibilities: [
      "Access-request architecture",
      "Admin approval pipeline",
      "Session & token persistence",
      "Premium UI · whitespace discipline",
    ],
    stack: ["React", "Supabase RLS", "Edge functions", "Telegram ops"],
    href: "/luxe-veil",
    thumb: "orbit",
  },
  {
    index: "03",
    category: "Brand system · Studio operations",
    title: "BrandToki — Studio System",
    summary:
      "Standalone studio surface with its own visual ecosystem, lead capture, and operational handoff into TrendFlux infrastructure.",
    responsibilities: [
      "Brand surface design",
      "Lead intake system",
      "Cross-brand routing",
      "Studio operational handoff",
    ],
    stack: ["React", "Brand tokens", "Supabase", "Analytics"],
    href: "/brandtoki",
    thumb: "stack",
  },
  {
    index: "04",
    category: "Enterprise · Strategic execution",
    title: "Enterprise Demo & Strategy Pipeline",
    summary:
      "Operational pipeline for enterprise demo requests — strategy sessions, intake validation, and quiet admin oversight.",
    responsibilities: [
      "Demo intake & validation",
      "Strategy session orchestration",
      "Admin dashboard & moderation",
      "Email & Telegram notifications",
    ],
    stack: ["React", "Supabase", "Edge functions", "GA4"],
    href: "/enterprise",
    thumb: "wave",
  },
  {
    index: "05",
    category: "Learning infrastructure · LMS",
    title: "TrendFlux Academy — Module Engine",
    summary:
      "Module-gated learning system with payment-driven unlocks, progression logic, and operational admin tooling.",
    responsibilities: [
      "Module progression engine",
      "bKash / Nagad payment flow",
      "Enrollment moderation",
      "Admin oversight tooling",
    ],
    stack: ["React", "Supabase RLS", "bKash", "Edge functions"],
    href: "/course/trendflux",
    thumb: "pulse",
  },
];

function Thumb({ kind }: { kind: Project["thumb"] }) {
  const common = "absolute inset-0 w-full h-full";
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-scrim border-b border-scrim-foreground/[0.06]">
      {/* Faint grid base */}
      <svg className={common} viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <pattern id={`g-${kind}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="320" height="200" fill={`url(#g-${kind})`} />

        {kind === "grid" && (
          <g>
            {Array.from({ length: 6 }).map((_, i) => (
              <line
                key={i}
                x1={40 + i * 40}
                y1={30}
                x2={40 + i * 40}
                y2={170}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="0.5"
              />
            ))}
            <line x1="40" y1="100" x2="280" y2="100" stroke="hsl(0 72% 51%)" strokeWidth="1" opacity="0.7" />
            <circle cx="160" cy="100" r="2.5" fill="hsl(0 72% 51%)" />
          </g>
        )}

        {kind === "orbit" && (
          <g>
            <circle cx="160" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" />
            <circle cx="160" cy="100" r="38" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />
            <circle cx="160" cy="100" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" />
            <circle cx="220" cy="100" r="2.5" fill="hsl(0 72% 51%)" />
            <circle cx="160" cy="62" r="1.6" fill="rgba(255,255,255,0.7)" />
            <circle cx="122" cy="100" r="1.6" fill="rgba(255,255,255,0.5)" />
          </g>
        )}

        {kind === "stack" && (
          <g>
            {[0, 1, 2, 3].map((i) => (
              <rect
                key={i}
                x={80 + i * 6}
                y={60 + i * 6}
                width="160"
                height="80"
                fill="none"
                stroke={i === 0 ? "hsl(0 72% 51%)" : "rgba(255,255,255,0.15)"}
                strokeWidth="0.7"
                opacity={i === 0 ? 0.9 : 0.4 - i * 0.05}
              />
            ))}
          </g>
        )}

        {kind === "wave" && (
          <g>
            <path
              d="M 20 120 Q 80 80 140 120 T 260 120 T 380 120"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="0.8"
            />
            <path
              d="M 20 130 Q 80 90 140 130 T 260 130 T 380 130"
              fill="none"
              stroke="hsl(0 72% 51%)"
              strokeWidth="0.8"
              opacity="0.7"
            />
            <circle cx="200" cy="115" r="2" fill="hsl(0 72% 51%)" />
          </g>
        )}

        {kind === "pulse" && (
          <g>
            <line x1="40" y1="100" x2="280" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            <path
              d="M 40 100 L 100 100 L 110 70 L 130 130 L 150 100 L 200 100 L 210 80 L 220 100 L 280 100"
              fill="none"
              stroke="hsl(0 72% 51%)"
              strokeWidth="1"
            />
          </g>
        )}
      </svg>

      {/* Soft vignette */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
      />
    </div>
  );
}

/**
 * Selected Execution — premium operational portfolio.
 * Documentary monochrome cards, restrained red accents, editorial spacing.
 * Presents real shipped systems as "documented execution", not a freelancer wall.
 */
export function SelectedExecution() {
  const [active, setActive] = useState<Project | null>(null);
  return (
    <section
      id="selected-execution"
      aria-labelledby="selected-execution-heading"
      className="relative bg-noir text-stone-100 px-6 lg:px-10 py-28 md:py-40 border-t border-scrim-foreground/[0.06]"
    >
      <div className="mx-auto max-w-6xl">
        {/* Editorial header */}
        <div className="max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[hsl(0_72%_55%)]">
            Selected Execution
          </p>
          <h2
            id="selected-execution-heading"
            className="mt-6 font-display text-3xl md:text-5xl leading-[1.1] font-semibold text-scrim-foreground"
          >
            Documented execution systems — shipped, operating, on the record.
          </h2>
          <p className="mt-6 max-w-2xl text-sm md:text-base leading-relaxed text-scrim-foreground/60">
            A curated index of systems built and operated through TrendFlux Digital — websites,
            access infrastructure, civic archives, learning engines, and enterprise pipelines.
            Each entry is live, observable, and accountable for its outcomes.
          </p>
          <p className="mt-8 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-scrim-foreground/40">
            <span aria-hidden className="h-px w-8 bg-[hsl(0_72%_55%)]/60" />
            {PROJECTS.length} active systems · operational archive
          </p>
        </div>

        {/* Project grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-px bg-paper/[0.06] border border-scrim-foreground/[0.06]">
          {PROJECTS.map((p) => {
            const isExternal = p.external || p.href.startsWith("http");
            return (
              <article
                key={p.index}
                className="group flex flex-col bg-noir transition-colors hover:bg-noir-elevated"
              >
                <button
                  type="button"
                  onClick={() => setActive(p)}
                  className="text-left w-full"
                  aria-label={`Preview ${p.title}`}
                >
                  <Thumb kind={p.thumb} />
                </button>
                <div className="flex flex-1 flex-col gap-6 p-8 md:p-10">
                  <header>
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-scrim-foreground/40">
                      <span className="font-mono text-scrim-foreground/70">{p.index}</span>
                      <span aria-hidden className="h-px w-6 bg-scrim-foreground/15" />
                      <span>{p.category}</span>
                    </div>
                    <h3 className="mt-5 font-display text-xl md:text-2xl leading-snug text-scrim-foreground">
                      {p.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-scrim-foreground/60">{p.summary}</p>
                  </header>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-scrim-foreground/35">
                      Responsibilities
                    </p>
                    <ul className="mt-3 grid gap-1.5 text-sm text-scrim-foreground/75">
                      {p.responsibilities.map((r) => (
                        <li key={r} className="flex gap-3">
                          <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-[hsl(0_72%_55%)]/70" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-2 pt-2 border-t border-scrim-foreground/[0.06]">
                    {p.stack.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] uppercase tracking-[0.25em] text-scrim-foreground/40 font-mono"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setActive(p)}
                      className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-scrim-foreground/70 hover:text-[hsl(0_72%_55%)] transition-colors"
                    >
                      Preview project
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </button>
                    {isExternal ? (
                      <a
                        href={p.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] uppercase tracking-[0.3em] text-scrim-foreground/35 hover:text-scrim-foreground/70 transition-colors"
                      >
                        Open ↗
                      </a>
                    ) : (
                      <Link
                        to={p.href}
                        className="text-[10px] uppercase tracking-[0.3em] text-scrim-foreground/35 hover:text-scrim-foreground/70 transition-colors"
                      >
                        Open ↗
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="mt-16 max-w-2xl text-xs leading-relaxed text-scrim-foreground/40">
          This is an operational archive, not a portfolio gallery. Each system listed here is
          live and observable. Private engagements, NDA work, and pre-launch infrastructure are
          intentionally omitted.
        </p>
      </div>

      <PreviewModal project={active} onClose={() => setActive(null)} />
    </section>
  );
}

function PreviewModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // iframe remounts on project/device change via `key`, so no extra reset needed.


  if (!project) return null;

  const isExternal = project.external || project.href.startsWith("http");
  const previewUrl = project.href;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} preview`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-scrim/85 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex h-full max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden bg-noir border border-scrim-foreground/[0.08] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between gap-4 border-b border-scrim-foreground/[0.06] px-6 py-4 md:px-8">
          <div className="min-w-0">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-scrim-foreground/40">
              <span className="font-mono text-[hsl(0_72%_55%)]">{project.index}</span>
              <span className="truncate">{project.category}</span>
            </div>
            <h3 className="mt-1 font-display text-base md:text-lg text-scrim-foreground truncate">
              {project.title}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              aria-label="Desktop preview"
              aria-pressed={device === "desktop"}
              className={`p-2 rounded transition-colors ${
                device === "desktop" ? "bg-scrim-foreground/10 text-scrim-foreground" : "text-scrim-foreground/40 hover:text-scrim-foreground/70"
              }`}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              aria-label="Mobile preview"
              aria-pressed={device === "mobile"}
              className={`p-2 rounded transition-colors ${
                device === "mobile" ? "bg-scrim-foreground/10 text-scrim-foreground" : "text-scrim-foreground/40 hover:text-scrim-foreground/70"
              }`}
            >
              <Smartphone className="h-4 w-4" />
            </button>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-scrim-foreground/70 hover:text-[hsl(0_72%_55%)] transition-colors"
            >
              Open <ExternalLink className="h-3 w-3" />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="ml-1 p-2 rounded text-scrim-foreground/50 hover:text-scrim-foreground hover:bg-scrim-foreground/5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Frame stage */}
        <div className="relative flex-1 overflow-auto bg-scrim p-4 md:p-8">
          <div
            className={`mx-auto h-full bg-paper shadow-xl transition-all duration-300 ${
              device === "mobile" ? "max-w-[400px]" : "max-w-full"
            }`}
          >
            {!failed ? (
              <>
                {!loaded && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-scrim-foreground/30 animate-pulse">
                      Loading preview…
                    </p>
                  </div>
                )}
                <iframe
                  key={`${project.href}-${device}`}
                  src={previewUrl}
                  title={`${project.title} live preview`}
                  className="h-full w-full border-0"
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  onLoad={() => setLoaded(true)}
                  onError={() => setFailed(true)}
                />
              </>
            ) : (
              <FallbackPreview project={project} />
            )}
          </div>
        </div>

        {/* Footer: outcomes */}
        <footer className="border-t border-scrim-foreground/[0.06] px-6 py-5 md:px-8 grid gap-4 md:grid-cols-[2fr_1fr]">
          <p className="text-sm leading-relaxed text-scrim-foreground/65">{project.summary}</p>
          <div className="flex flex-wrap items-center justify-start md:justify-end gap-x-3 gap-y-1.5">
            {project.stack.map((s) => (
              <span
                key={s}
                className="text-[10px] uppercase tracking-[0.25em] text-scrim-foreground/40 font-mono"
              >
                {s}
              </span>
            ))}
          </div>
        </footer>

        {isExternal && (
          <p className="px-6 md:px-8 pb-3 text-[10px] uppercase tracking-[0.3em] text-scrim-foreground/30">
            External site · embedded preview may be blocked by the destination
          </p>
        )}
      </div>
    </div>
  );
}

function FallbackPreview({ project }: { project: Project }) {
  return (
    <div className="flex h-full min-h-[400px] w-full items-center justify-center bg-noir p-10">
      <div className="max-w-md text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[hsl(0_72%_55%)]">
          Embedded preview unavailable
        </p>
        <h4 className="mt-4 font-display text-xl text-scrim-foreground">{project.title}</h4>
        <p className="mt-3 text-sm leading-relaxed text-scrim-foreground/60">
          The destination blocks iframe embedding for security. Open the live system in a new tab
          to view it.
        </p>
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 border border-scrim-foreground/15 px-5 py-3 text-[11px] uppercase tracking-[0.35em] text-scrim-foreground/80 hover:border-[hsl(0_72%_55%)] hover:text-[hsl(0_72%_55%)] transition-colors"
        >
          Open project <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

