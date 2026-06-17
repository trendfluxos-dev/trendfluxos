import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { TfSection } from "@/components/tf/Section";
import emonPortrait from "@/assets/zahid-hasan-emon.webp";

export const FounderSection = () => (
  <TfSection eyebrow="Founder" title="Built by an operator, not an agency.">
    <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 lg:grid-cols-[320px_1fr] lg:gap-16">
      <div className="relative mx-auto">
        <div className="absolute -inset-3 rounded-2xl bg-primary/10 blur-2xl" aria-hidden />
        <div className="relative overflow-hidden rounded-2xl border border-border bg-muted">
          <img
            src={emonPortrait}
            alt="Zahid Hasan Emon — Founder of TrendFlux"
            className="h-[380px] w-[320px] object-cover"
            loading="lazy"
          />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary">Zahid Hasan Emon</p>
        <h3 className="mt-3 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          Strategic operator. Systems-first builder. Transparency by default.
        </h3>
        <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
          TrendFlux exists because the modern brand is drowning in disconnected
          tools. Zahid architects growth as infrastructure — the same way
          engineers think about systems. No black boxes. No vanity dashboards.
          Just compounding leverage you can audit.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          {["Ethical Growth", "Systems Thinking", "Founder-Led", "Audit-Ready"].map((t) => (
            <span key={t} className="rounded-full border border-border bg-muted/60 px-3 py-1 text-[11px] font-medium text-foreground/80">
              {t}
            </span>
          ))}
        </div>
        <Link
          to="/about"
          className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          The full story <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  </TfSection>
);