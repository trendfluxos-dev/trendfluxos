import { ArrowUpRight, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { TfSection, TfCard } from "@/components/tf/Section";
import { ACADEMY_MODULES } from "@/data/home";
import { EDTECH } from "@/config/edtech";
import { track } from "@/lib/analytics";

export const AcademySection = () => (
  <TfSection
    eyebrow="কর্মশিক্ষা TED Plus · Online Edtech Platform"
    title="Train the operator behind the system."
    intro="Modular education for founders, ops leads, and growth engineers learning to build with AI-native systems. All masterclasses, cohorts, and recordings live on our dedicated learning platform."
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

    <div className="mt-14 mx-auto max-w-3xl rounded-2xl border border-border bg-card p-7 sm:p-9 shadow-sm">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Live Platform
          </p>
          <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {EDTECH.name} — {EDTECH.tagline}
          </h3>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
            Browse the Advanced AI Masterclass, cohorts, and module library on the official learning platform.
          </p>
        </div>
        <Link
          to={EDTECH.routes.home}
          onClick={() => track("edtech_platform_open", { location: "academy_section" })}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md"
        >
          Open Platform
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>

    <div className="mt-6 text-center">
      <Link
        to={EDTECH.routes.courses}
        onClick={() => track("edtech_platform_open", { location: "academy_section_secondary" })}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
      >
        Explore all masterclasses <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  </TfSection>
);