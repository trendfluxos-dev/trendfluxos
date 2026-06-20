import { useState } from "react";
import {
  ExternalLink,
  GraduationCap,
  Sparkles,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import { EDTECH } from "@/config/edtech";
import { track } from "@/lib/analytics";

const STACK = ["React", "TypeScript", "Tailwind", "Supabase", "Vercel"];
const HIGHLIGHTS = [
  "Cohort-based AI Masterclass",
  "Modular curriculum & recordings",
  "Founder-grade learning OS",
];

/**
 * Featured-project showcase for KormoShikkha — TrendFlux's online edtech
 * platform. Premium browser-chrome mock with live iframe preview, project
 * metadata, and dual CTAs. Fully responsive, keyboard-accessible.
 */
export const KormoShikkhaShowcase = () => {
  const [loaded, setLoaded] = useState(false);

  const onOpen = (location: string) =>
    track("edtech_platform_open", { location });

  return (
    <section
      aria-labelledby="kormoshikkha-title"
      className="relative isolate overflow-hidden border-y border-border bg-background py-24 sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-1/4 h-[420px] w-[420px] rounded-full bg-primary/8 blur-[140px]"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
            <Sparkles className="h-3 w-3" aria-hidden />
            Featured Project · Live
          </p>
          <h2
            id="kormoshikkha-title"
            className="font-display text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[44px] md:leading-[1.05]"
          >
            KormoShikkha — TrendFlux Online Edtech Platform
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-[1.7] text-muted-foreground sm:text-[16px]">
            A cohort-based AI learning platform built and operated end-to-end.
            All TrendFlux masterclasses, modules, and recordings live here.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          {/* Browser-chrome preview card */}
          <div className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
            {/* chrome */}
            <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-3">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
              </span>
              <div className="ml-2 flex flex-1 items-center gap-2 truncate rounded-md border border-border bg-background px-3 py-1 text-[11px] text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                <span className="truncate">kormoshikkha.trendflux.digital</span>
              </div>
              <a
                href={EDTECH.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open KormoShikkha in a new tab"
                onClick={() => onOpen("showcase_chrome")}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>

            {/* live preview */}
            <div className="relative aspect-[16/10] w-full bg-muted">
              {!loaded && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  aria-hidden
                >
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
              <iframe
                src={EDTECH.url}
                title="KormoShikkha — live platform preview"
                loading="lazy"
                onLoad={() => setLoaded(true)}
                sandbox="allow-scripts allow-same-origin allow-popups"
                className="absolute inset-0 h-full w-full border-0"
              />
              {/* clickable overlay → open full platform */}
              <a
                href={EDTECH.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open KormoShikkha platform in a new tab"
                onClick={() => onOpen("showcase_overlay")}
                className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-foreground/40 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
                  <PlayCircle className="h-3.5 w-3.5 text-primary" aria-hidden />
                  Open live platform
                </span>
              </a>
            </div>
          </div>

          {/* Project metadata */}
          <div>
            <div className="flex items-center gap-3">
              <span
                className="grid h-11 w-11 place-items-center rounded-xl border border-primary/20 bg-primary/[0.06] text-primary"
                aria-hidden
              >
                <GraduationCap className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                  Role · Founder, Designer, Operator
                </p>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {EDTECH.name}
                </h3>
              </div>
            </div>

            <ul className="mt-6 space-y-3">
              {HIGHLIGHTS.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-[14px] text-foreground/85">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
                Built with
              </p>
              <ul className="flex flex-wrap gap-2">
                {STACK.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={EDTECH.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onOpen("showcase_primary_cta")}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Visit Live Platform
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
              <a
                href="/portfolio"
                onClick={() => track("portfolio_open", { location: "kormoshikkha_showcase" })}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                See More Projects
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};