import { Quote } from "lucide-react";
import { TfSection, TfCard } from "@/components/tf/Section";
import { TESTIMONIALS, type Testimonial } from "@/data/home";

type TestimonialsSectionProps = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  items?: Testimonial[];
  tone?: "muted" | "light";
};

export const TestimonialsSection = ({
  eyebrow = "Operator Signal",
  title = "Trusted by founders running real P&Ls.",
  intro = "Selected feedback from operators inside live TrendFlux OS engagements. Names withheld under standard NDA.",
  items = TESTIMONIALS,
  tone = "muted",
}: TestimonialsSectionProps = {}) => (
  <TfSection eyebrow={eyebrow} title={title} intro={intro} tone={tone}>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {items.map((t) => (
        <TfCard key={`${t.company}-${t.name}`} className="flex h-full flex-col">
          <Quote className="h-5 w-5 text-primary/70" aria-hidden="true" />
          <p className="mt-5 flex-1 text-[14.5px] leading-relaxed text-foreground/90">
            “{t.quote}”
          </p>
          <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-background">
              <img
                src={t.logo}
                alt={`${t.company} logo`}
                loading="lazy"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-foreground">
                {t.name}
              </div>
              <div className="mt-0.5 truncate text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground">
                {t.role}
              </div>
              <div className="mt-0.5 truncate text-[11px] text-foreground/60">
                {t.company}
              </div>
            </div>
          </div>
        </TfCard>
      ))}
    </div>
  </TfSection>
);