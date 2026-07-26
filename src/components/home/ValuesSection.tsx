import { ShieldCheck, Eye, Layers, Hammer, HeartHandshake, Compass } from "lucide-react";
import { TfSection, TfCard } from "@/components/tf/Section";

type Value = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  principle: string;
  proof: string;
};

const VALUES: Value[] = [
  {
    icon: ShieldCheck,
    title: "Ethical Growth",
    principle: "No dark patterns, no vanity metrics. Growth that compounds only when the customer wins.",
    proof: "Pabna Nagorik Committee — 4.85L+ organic views, 82% organic reach, zero paid amplification.",
  },
  {
    icon: Eye,
    title: "Radical Transparency",
    principle: "Every system is audit-ready. Numbers, sources and methods stay open to the operator.",
    proof: "The Stand — full documentary archive with primary sources, quotes and dated evidence.",
  },
  {
    icon: Layers,
    title: "Systems First",
    principle: "Ship infrastructure, not one-off campaigns. Automation, CRM and creative wired as one.",
    proof: "TrendFlux Growth OS — 12+ shipped modules powering 45%+ engagement growth across brands.",
  },
  {
    icon: Hammer,
    title: "Operator, Not Agency",
    principle: "Built end-to-end by the founder. No hand-offs, no black boxes, no account-manager layer.",
    proof: "8+ brands (EdTech, LuxeVeil, BrandToki, EISH, Nagorik Barta 24) architected and operated solo.",
  },
  {
    icon: HeartHandshake,
    title: "Civic Responsibility",
    principle: "Skill and reach come with a duty — to community, to justice, to the record.",
    proof: "Justice Appeal + Pabna Accountability Project — public documentation with legal context.",
  },
  {
    icon: Compass,
    title: "Bangladesh-Rooted",
    principle: "Built for founders operating from Bangladesh — bilingual, local-first, globally competitive.",
    proof: "কর্মশিক্ষা TED Plus — Bangla-first AI masterclass with 7+ live modules and recurring cohorts.",
  },
];

export const ValuesSection = () => (
  <TfSection
    id="values"
    eyebrow="Values"
    title={<>The principles behind <span className="text-muted-foreground">every system shipped.</span></>}
    intro="Six operating principles that shape how Zahid Hasan Emon designs, builds and runs the TrendFlux ecosystem — each backed by a live proof point."
  >
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {VALUES.map(({ icon: Icon, title, principle, proof }) => (
        <li key={title} className="group">
          <TfCard className="relative flex h-full flex-col">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.06] text-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{principle}</p>
            <div className="mt-5 border-t border-border/60 pt-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-primary">Proof</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/80">{proof}</p>
            </div>
          </TfCard>
        </li>
      ))}
    </ul>
  </TfSection>
);

export default ValuesSection;