import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { TfSection } from "@/components/tf/Section";
import ProofTabs from "@/components/tf/ProofTabs";

export const ProofSection = () => (
  <TfSection
    id="proof"
    eyebrow="Proof"
    title="Operating metrics, not vanity numbers."
    intro="Representative outcomes across deployed TrendFlux OS engagements. Audit trail available on request."
  >
    <ProofTabs />
    <div className="mt-12 text-center">
      <Link to="/portfolio" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary">
        View case studies <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  </TfSection>
);