import { Link } from "react-router-dom";
import { MessageCircle, Mail, Linkedin, ShieldCheck, Clock, ArrowRight } from "lucide-react";
import { n } from "@/config/socialConfig";
import portraitAsset from "@/assets/zahid-hasan-emon-podium.png.asset.json";

const portrait = portraitAsset.url;

/**
 * High-ticket conversion CTA — direct line to the Project Lead
 * (ZAHID HASAN EMON) with WhatsApp / email / LinkedIn plus a
 * "Book Private Strategy Call" primary. Sits between the
 * Transformation Stories and Values sections on the home page.
 */
export const BookProjectLeadSection = ({ onOpenQuote }: { onOpenQuote: () => void }) => {
  const zahid = n.zahid;
  return (
    <section
      aria-labelledby="book-project-lead-heading"
      className="relative isolate overflow-hidden bg-background py-20 sm:py-24"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 tf-grid-bg opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-1/2 h-[420px] w-[620px] -translate-y-1/2 rounded-full bg-primary/8 blur-[160px]"
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        {/* Portrait + trust chip */}
        <div className="relative">
          <div aria-hidden className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
            <img
              src={portrait}
              alt="ZAHID HASAN EMON — Founder & Project Lead, TrendFlux Digital"
              className="h-[420px] w-full object-cover sm:h-[480px]"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 border-t border-border/40 bg-scrim/70 px-4 py-3 text-scrim-foreground backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                Direct line · No gatekeepers
              </p>
            </div>
          </div>
        </div>

        {/* Copy + CTA stack */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
            <span className="h-1 w-1 rounded-full bg-primary" />
            High-ticket engagements
          </p>

          <h2
            id="book-project-lead-heading"
            className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[42px] md:leading-[1.05]"
          >
            Book direct with the <span className="tf-text-electric">Project Lead</span>.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-[1.7] text-muted-foreground sm:text-[16.5px]">
            Skip the intake form. Every strategy call is taken by <strong className="text-foreground">ZAHID HASAN EMON</strong> —
            founder, operator, and the person who will own the system inside your business. No junior handoff,
            no discovery-call theatre, no chased retainers.
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { icon: Clock, t: "45-min strategy call", d: "Working session — you leave with a systems map, not a pitch deck." },
              { icon: ShieldCheck, t: "Fit-first, always", d: "We qualify both sides. If we're not the right fit, we say so on the call." },
            ].map(({ icon: Icon, t, d }) => (
              <li key={t} className="flex gap-3 rounded-xl border border-border bg-card/60 p-4">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{t}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">{d}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={onOpenQuote}
              className="tf-btn-primary inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_30px_-8px_rgba(220,38,38,0.5)] hover:bg-primary/90"
            >
              Book Private Strategy Call <ArrowRight className="h-4 w-4" aria-hidden />
            </button>

            {zahid.whatsapp && (
              <a
                href={zahid.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-muted/50 px-6 py-3.5 text-sm font-semibold text-foreground transition hover:border-foreground/20 hover:bg-muted"
              >
                <MessageCircle className="h-4 w-4 text-wa-green" aria-hidden />
                WhatsApp Direct
              </a>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-muted-foreground">
            {zahid.email && (
              <a href={`mailto:${zahid.email}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                {zahid.email}
              </a>
            )}
            {zahid.linkedin && (
              <a
                href={zahid.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-primary"
              >
                <Linkedin className="h-3.5 w-3.5" aria-hidden />
                LinkedIn
              </a>
            )}
            <Link to="/founder" className="inline-flex items-center gap-1 hover:text-primary">
              Founder dossier <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>

          <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Limited to 4 new engagements per quarter · Founder-to-founder only
          </p>
        </div>
      </div>
    </section>
  );
};

export default BookProjectLeadSection;