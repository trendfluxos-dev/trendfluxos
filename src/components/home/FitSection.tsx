import { ArrowRight, CheckCircle2 } from "lucide-react";
import { TfSection } from "@/components/tf/Section";
import { FIT } from "@/data/home";

export const FitSection = ({ onOpenQuote }: { onOpenQuote: () => void }) => (
  <TfSection
    eyebrow="Engagement Fit"
    title={<>Built for operators. <span className="text-muted-foreground">Not for everyone.</span></>}
    intro="TrendFlux OS is a 90-day systems engagement, not a retainer. We work with a small number of founders per quarter."
  >
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
      {FIT.map((f) => (
        <div key={f} className="flex items-start gap-3 rounded-xl border border-border bg-card/40 p-5">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
          <span className="text-[14px] leading-relaxed text-foreground/90">{f}</span>
        </div>
      ))}
    </div>
    <div className="mt-10 text-center">
      <button
        type="button"
        onClick={onOpenQuote}
        className="tf-btn-primary inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_30px_-8px_rgba(220,38,38,0.5)] hover:bg-primary/90"
      >
        Request a Fit Assessment <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
      <p className="mt-4 text-[11.5px] uppercase tracking-[0.22em] text-muted-foreground">
        45-min call · No pitch · Operator to operator
      </p>
    </div>
  </TfSection>
);