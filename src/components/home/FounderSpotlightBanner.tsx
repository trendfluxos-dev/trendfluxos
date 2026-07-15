import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import portrait from "@/assets/zahid-hasan-emon.webp";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/**
 * Full-width Founder Spotlight banner. Hosts the same identity card +
 * dialog that used to live in the hero's right column, but promoted to
 * its own edge-to-edge section so it sits prominently above the
 * Ecosystem Navigator.
 */
export const FounderSpotlightBanner = () => {
  const [open, setOpen] = useState(false);

  const jumpToSystems = () => {
    setOpen(false);
    requestAnimationFrame(() => {
      const target = document.getElementById("systems-he-built");
      if (!target) return;
      const navOffset =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--nav-offset")
        ) || 96;
      const y = target.getBoundingClientRect().top + window.scrollY - navOffset - 8;
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    });
  };

  return (
    <section
      aria-labelledby="founder-spotlight-heading"
      className="relative isolate w-full overflow-hidden bg-gradient-to-b from-noir via-noir to-noir py-10 sm:py-14"
    >
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-crimson-glow/50 to-transparent" />
      <span aria-hidden className="pointer-events-none absolute -top-24 left-1/4 h-56 w-56 rounded-full bg-crimson-glow/20 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -bottom-24 right-1/4 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />

      <h2 id="founder-spotlight-heading" className="sr-only">Founder spotlight</h2>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="founder-dialog"
          aria-label="Open founder profile: Zahid Hasan Emon, Founder and Brand Architect. Includes brand philosophy, experience highlights, and portfolio links."
          className="group relative flex w-full flex-col items-start gap-5 overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-noir via-noir to-noir p-6 text-left shadow-[0_20px_50px_-20px_rgba(226,90,90,0.45)] outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-crimson-glow hover:shadow-[0_28px_70px_-20px_rgba(226,90,90,0.6)] focus-visible:-translate-y-0.5 focus-visible:border-crimson-glow focus-visible:ring-2 focus-visible:ring-crimson-glow/80 focus-visible:ring-offset-4 focus-visible:ring-offset-noir sm:flex-row sm:items-center sm:gap-7 sm:p-8"
        >
          <span className="sr-only">Opens a dialog.</span>
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-crimson-glow/60 to-transparent" />
          <span
            aria-hidden
            className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-crimson-glow/40 bg-crimson-glow/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.25em] text-crimson-glow"
          >
            <span className="h-1 w-1 rounded-full bg-crimson-glow shadow-[0_0_6px_rgba(226,90,90,0.9)]" />
            Founder
          </span>

          <div className="relative shrink-0">
            <span aria-hidden className="absolute -inset-1 rounded-full bg-crimson-glow/30 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
            <img
              src={portrait}
              alt=""
              aria-hidden="true"
              width={104}
              height={104}
              loading="lazy"
              decoding="async"
              className="relative h-24 w-24 sm:h-[104px] sm:w-[104px] rounded-full object-cover ring-2 ring-primary/60 transition group-hover:ring-crimson-glow group-focus-visible:ring-crimson-glow"
            />
            <span aria-hidden className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary ring-2 ring-noir shadow-[0_0_12px_rgba(226,90,90,0.8)]" />
          </div>

          <div className="relative min-w-0 flex-1" aria-hidden="true">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.28em] text-crimson-glow">
              Founder · Operator
            </span>
            <div className="font-display text-xl sm:text-2xl font-bold leading-tight text-scrim-foreground transition-colors group-hover:text-crimson-mist group-focus-visible:text-crimson-mist">
              Zahid Hasan Emon
            </div>
            <div className="mt-1 text-[13px] sm:text-[14px] leading-snug text-crimson-mist/75">
              Brand Architect · AI-era Technologist
            </div>
            <span className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] text-crimson-glow/90 group-hover:text-crimson-glow group-focus-visible:text-crimson-glow">
              Open founder profile
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5" aria-hidden />
            </span>
          </div>
        </button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            id="founder-dialog"
            aria-labelledby="founder-dialog-title"
            aria-describedby="founder-dialog-desc"
            className="max-w-2xl overflow-hidden border-primary/40 bg-gradient-to-br from-noir via-noir to-noir p-0 text-scrim-foreground sm:rounded-2xl"
          >
            <div className="relative overflow-hidden px-6 pt-8 pb-6 sm:px-8 sm:pt-10">
              <span aria-hidden className="pointer-events-none absolute -top-24 -left-16 h-56 w-56 rounded-full bg-crimson-glow/25 blur-3xl" />
              <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-crimson-glow/60 to-transparent" />
              <div className="relative flex items-start gap-5">
                <div className="relative shrink-0">
                  <span aria-hidden className="absolute -inset-1.5 rounded-full bg-crimson-glow/30 blur-md" />
                  <img
                    src={portrait}
                    alt=""
                    width={96}
                    height={96}
                    className="relative h-24 w-24 rounded-full object-cover ring-2 ring-crimson-glow/70"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-crimson-glow/40 bg-crimson-glow/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-crimson-glow">
                    <Sparkles className="h-3 w-3" aria-hidden /> Founder · Operator
                  </span>
                  <DialogTitle
                    id="founder-dialog-title"
                    className="mt-3 font-display text-2xl font-bold leading-tight text-scrim-foreground sm:text-[28px]"
                  >
                    Zahid Hasan Emon
                  </DialogTitle>
                  <DialogDescription
                    id="founder-dialog-desc"
                    className="mt-1 text-[13px] leading-relaxed text-crimson-mist/75 sm:text-sm"
                  >
                    Brand Architect · AI-era Technologist — building a vertically integrated network of eight brands from Bangladesh.
                  </DialogDescription>
                </div>
              </div>
            </div>

            <div className="max-h-[55vh] overflow-y-auto px-6 pb-2 sm:px-8">
              <section aria-labelledby="founder-philosophy" className="mt-2">
                <h3 id="founder-philosophy" className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-crimson-glow">
                  Brand Philosophy
                </h3>
                <p className="mt-2 text-[14px] leading-[1.7] text-crimson-mist/85 sm:text-[15px]">
                  Systems over aesthetics. Ethical minimalism over noise. Every brand under TrendFlux is a compounding operator asset — designed to run measurably, ship weekly, and stay accountable to the people it serves.
                </p>
              </section>

              <section aria-labelledby="founder-highlights" className="mt-6">
                <h3 id="founder-highlights" className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-crimson-glow">
                  Experience Highlights
                </h3>
                <ul role="list" className="mt-3 space-y-2.5 text-[13.5px] text-crimson-mist/85 sm:text-[14.5px]">
                  {[
                    "8 operating brands — EdTech, Creative, Luxe, Infra — one integrated system.",
                    "$8.4M+ capital managed across deployed TrendFlux OS engagements.",
                    "99.98% system uptime across the ecosystem's shared infrastructure.",
                    "Author of The Stand (জাতীয় দলিল) — a public civic accountability record.",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2.5">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-crimson-glow shadow-[0_0_8px_rgba(226,90,90,0.7)]" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-scrim-foreground/10 bg-scrim/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <button
                type="button"
                onClick={jumpToSystems}
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-scrim-foreground/15 px-4 py-2 text-[12.5px] font-semibold uppercase tracking-[0.16em] text-scrim-foreground/85 transition-colors hover:border-crimson-glow/60 hover:text-scrim-foreground"
              >
                Jump to Systems He Built
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
              <Link
                to="/project-lead"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-[12.5px] font-semibold uppercase tracking-[0.16em] text-scrim-foreground shadow-[0_10px_30px_-10px_rgba(226,90,90,0.7)] transition-all hover:bg-crimson-glow hover:shadow-[0_14px_40px_-10px_rgba(226,90,90,0.85)]"
              >
                View Full Portfolio
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default FounderSpotlightBanner;
