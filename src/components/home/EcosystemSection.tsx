import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { TfSection } from "@/components/tf/Section";
import EcosystemMap from "@/components/tf/EcosystemMap";

export const EcosystemSection = () => (
  <TfSection
    id="ecosystem"
    eyebrow="The Architecture"
    title={<>One connected system. <span className="text-muted-foreground">Zero glue work.</span></>}
    intro="Every module of the TrendFlux OS is engineered to plug into the next — automation feeds CRM, CRM informs creative, creative powers ads, ads feed analytics. Compounding by design."
  >
    <EcosystemMap />
    <div className="mt-12 text-center">
      <Link
        to="/ecosystem"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary"
      >
        View full architecture <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  </TfSection>
);