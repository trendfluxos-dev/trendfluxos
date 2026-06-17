import { Link } from "react-router-dom";
import { ArrowUpRight, GraduationCap } from "lucide-react";
import { TfSection, TfCard } from "@/components/tf/Section";
import { ACADEMY_MODULES } from "@/data/home";

export const AcademySection = () => (
  <TfSection
    eyebrow="TrendFlux Academy"
    title="Train the operator behind the system."
    intro="Modular education for founders, ops leads, and growth engineers learning to build with AI-native systems."
    tone="muted"
  >
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {ACADEMY_MODULES.map((m) => (
        <TfCard key={m.title}>
          <GraduationCap className="h-6 w-6 text-primary" aria-hidden="true" />
          <h3 className="mt-4 font-display text-base font-semibold text-foreground">{m.title}</h3>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{m.desc}</p>
        </TfCard>
      ))}
    </div>
    <div className="mt-12 text-center">
      <Link
        to="/course/trendflux"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
      >
        Enter the Academy <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  </TfSection>
);