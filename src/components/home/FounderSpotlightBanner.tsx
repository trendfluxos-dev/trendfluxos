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
      className="relative isolate w-full overflow-hidden bg-gradient-to-b from-[#08080d] via-[#0d0509] to-[#08080d] py-10 sm:py-14"
    >
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e25a5a]/50 to-transparent" />
      <span aria-hidden className="pointer-events-none absolute -top-24 left-1/4 h-56 w-56 rounded-full bg-[#e25a5a]/20 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -bottom-24 right-1/4 h-56 w-56 rounded-full bg-[#c11f1f]/15 blur-3xl" />

      <h2 id="founder-spotlight-heading" className="sr-only">Founder spotlight</h2>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="founder-dialog"
          aria-label="Open founder profile: Zahid Hasan Emon, Founder and Brand Architect. Includes brand philosophy, experience highlights, and portfolio links."
          className="group relative flex w-full flex-col items-start gap-5 overflow-hidden rounded-2xl border border-[#c11f1f]/40 bg-gradient-to-br from-[#1f0a0f] via-[#140609] to-[#08080d] p-6 text-left shadow-[0_20px_50px_-20px_rgba(226,90,90,0.45)] outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e25a5a] hover:shadow-[0_28px_70px_-20px_rgba(226,90,90,0.6)] focus-visible:-translate-y-0.5 focus-visible:border-[#e25a5a] focus-visible:ring-2 focus-visible:ring-[#e25a5a]/80 focus-visible:ring-offset-4 focus-visible:ring-offset-[#08080d] sm:flex-row sm:items-center sm:gap-7 sm:p-8"
        >
          <span className="sr-only">Opens a dialog.</span>
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e25a5a]/60 to-transparent" />
          <span
            aria-hidden
            className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-[#e25a5a]/40 bg-[#e25a5a]/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.25em] text-[#e25a5a]"
          >
            <span className="h-1 w-1 rounded-full bg-[#e25a5a] shadow-[0_0_6px_rgba(226,90,90,0.9)]" />
            Founder
          </span>

          <div className="relative shrink-0">
            <span aria-hidden className="absolute -inset-1 rounded-full bg-[#e25a5a]/30 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
            <img
              src={portrait}
              alt=""
              aria-hidden="true"
              width={104}
              height={104}
              loading="lazy"
              decoding="async"
              className="relative h-24 w-24 sm:h-[104px] sm:w-[104px] rounded-full object-cover ring-2 ring-[#c11f1f]/60 transition group-hover:ring-[#e25a5a] group-focus-visible:ring-[#e25a5a]"
            />
            <span aria-hidden className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#c11f1f] ring-2 ring-[#08080d] shadow-[0_0_12px_rgba(226,90,90,0.8)]" />
          </div>

          <div className="relative min-w-0 flex-1" aria-hidden="true">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.28em] text-[#e25a5a]">
              Founder · Operator
            </span>
            <div className="font-display text-xl sm:text-2xl font-bold leading-tight text-white transition-colors group-hover:text-[#ffd7d7] group-focus-visible:text-[#ffd7d7]">
              Zahid Hasan Emon
            </div>
            <div className="mt-1 text-[13px] sm:text-[14px] leading-snug text-[#f0c9c9]/75">
              Brand Architect · AI-era Technologist
            </div>
            <span className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#e25a5a]/90 group-hover:text-[#e25a5a] group-focus-visible:text-[#e25a5a]">
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
            className="max-w-2xl overflow-hidden border-[#c11f1f]/40 bg-gradient-to-br from-[#1f0a0f] via-[#140609] to-[#08080d] p-0 text-white sm:rounded-2xl"
          >
            <div className="relative overflow-hidden px-6 pt-8 pb-6 sm:px-8 sm:pt-10">
              <span aria-hidden className="pointer-events-none absolute -top-24 -left-16 h-56 w-56 rounded-full bg-[#e25a5a]/25 blur-3xl" />
              <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e25a5a]/60 to-transparent" />
              <div className="relative flex items-start gap-5">
                <div className="relative shrink-0">
                  <span aria-hidden className="absolute -inset-1.5 rounded-full bg-[#e25a5a]/30 blur-md" />
                  <img
                    src={portrait}
                    alt=""
                    width={96}
                    height={96}
                    className="relative h-24 w-24 rounded-full object-cover ring-2 ring-[#e25a5a]/70"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e25a5a]/40 bg-[#e25a5a]/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e25a5a]">
                    <Sparkles className="h-3 w-3" aria-hidden /> Founder · Operator
                  </span>
                  <DialogTitle
                    id="founder-dialog-title"
                    className="mt-3 font-display text-2xl font-bold leading-tight text-white sm:text-[28px]"
                  >
                    Zahid Hasan Emon
                  </DialogTitle>
                  <DialogDescription
                    id="founder-dialog-desc"
                    className="mt-1 text-[13px] leading-relaxed text-[#f0c9c9]/75 sm:text-sm"
                  >
                    Brand Architect · AI-era Technologist — building a vertically integrated network of eight brands from Bangladesh.
                  </DialogDescription>
                </div>
              </div>
            </div>

            <div className="max-h-[55vh] overflow-y-auto px-6 pb-2 sm:px-8">
              <section aria-labelledby="founder-philosophy" className="mt-2">
                <h3 id="founder-philosophy" className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e25a5a]">
                  Brand Philosophy
                </h3>
                <p className="mt-2 text-[14px] leading-[1.7] text-[#f0c9c9]/85 sm:text-[15px]">
                  Systems over aesthetics. Ethical minimalism over noise. Every brand under TrendFlux is a compounding operator asset — designed to run measurably, ship weekly, and stay accountable to the people it serves.
                </p>
              </section>

              <section aria-labelledby="founder-highlights" className="mt-6">
                <h3 id="founder-highlights" className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e25a5a]">
                  Experience Highlights
                </h3>
                <ul role="list" className="mt-3 space-y-2.5 text-[13.5px] text-[#f0c9c9]/85 sm:text-[14.5px]">
                  {[
                    "8 operating brands — EdTech, Creative, Luxe, Infra — one integrated system.",
                    "$8.4M+ capital managed across deployed TrendFlux OS engagements.",
                    "99.98% system uptime across the ecosystem's shared infrastructure.",
                    "Author of The Stand (জাতীয় দলিল) — a public civic accountability record.",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2.5">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e25a5a] shadow-[0_0_8px_rgba(226,90,90,0.7)]" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-white/10 bg-black/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <button
                type="button"
                onClick={jumpToSystems}
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-white/15 px-4 py-2 text-[12.5px] font-semibold uppercase tracking-[0.16em] text-white/85 transition-colors hover:border-[#e25a5a]/60 hover:text-white"
              >
                Jump to Systems He Built
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
              <Link
                to="/project-lead"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#c11f1f] px-5 py-2.5 text-[12.5px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_10px_30px_-10px_rgba(226,90,90,0.7)] transition-all hover:bg-[#e25a5a] hover:shadow-[0_14px_40px_-10px_rgba(226,90,90,0.85)]"
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
