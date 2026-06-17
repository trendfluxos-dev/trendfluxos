import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { TfSection, TfCard } from "@/components/tf/Section";
import { SERVICES } from "@/data/home";

export const ServicesSection = () => (
  <TfSection
    id="services"
    eyebrow="Services"
    title="Six disciplines. One operating layer."
    intro="Each service is a module of the OS — deployed standalone or composed into a full Growth OS engagement."
    tone="muted"
  >
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SERVICES.map((s) => (
        <TfCard key={s.title}>
          <s.icon className="h-6 w-6 text-primary" aria-hidden="true" />
          <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{s.title}</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{s.desc}</p>
        </TfCard>
      ))}
    </div>
    <div className="mt-12 text-center">
      <Link
        to="/services"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
      >
        All services <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  </TfSection>
);