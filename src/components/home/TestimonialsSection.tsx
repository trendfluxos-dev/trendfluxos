import { Quote } from "lucide-react";
import { TfSection, TfCard } from "@/components/tf/Section";
import { TESTIMONIALS } from "@/data/home";

export const TestimonialsSection = () => (
  <TfSection
    eyebrow="Operator Signal"
    title="Trusted by founders running real P&Ls."
    intro="Selected feedback from operators inside live TrendFlux OS engagements. Names withheld under standard NDA."
    tone="muted"
  >
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {TESTIMONIALS.map((t) => (
        <TfCard key={t.name} className="flex h-full flex-col">
          <Quote className="h-5 w-5 text-primary/70" aria-hidden="true" />
          <p className="mt-5 flex-1 text-[14.5px] leading-relaxed text-foreground/90">“{t.quote}”</p>
          <div className="mt-6 border-t border-border pt-4">
            <div className="text-[13px] font-semibold text-foreground">{t.name}</div>
            <div className="mt-0.5 text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground">{t.role}</div>
          </div>
        </TfCard>
      ))}
    </div>
  </TfSection>
);