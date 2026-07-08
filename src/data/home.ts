/**
 * Static, presentational data for the home page.
 * Kept separate from layout so designers/copywriters can edit copy
 * without touching React markup, and so section components stay pure.
 */
import {
  Bot,
  Database,
  GitBranch,
  Megaphone,
  Palette,
  Sparkles,
  Target,
  Workflow,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import brandPabnaNagorik from "@/assets/brands/pabna-nagorik-committee.jpeg";
import brandHbEduverse from "@/assets/brands/hb-eduverse.jpeg";
import brandMarieElliot from "@/assets/brands/marie-j-elliot.jpeg";
import brandPabnaDebate from "@/assets/brands/pabna-debate-society.jpeg";
import brandStarpath from "@/assets/brands/starpath-tech.jpeg";
import brandVerdafluxSpectrum from "@/assets/brands/verdaflux-spectrum.webp";
import brandFluxBeam from "@/assets/brand-fluxbeam.webp";

export type OperatedBrand = {
  name: string;
  role: string;
  logo: string;
  href?: string;
  fb?: string;
  impact?: string;
  tagline?: string;
  paid?: boolean;
};

export const OPERATED_BRANDS: OperatedBrand[] = [
  {
    name: "TrendFlux Digital",
    role: "Founder · AI-Native Growth OS",
    logo: "/trendflux-logo.webp",
    href: "https://trendflux.digital",
    fb: "https://www.facebook.com/trendfluxdigital/",
  },
  {
    name: "TrendFlux Space",
    role: "Product · Live + on-demand EdTech",
    logo: brandFluxBeam,
    href: "https://trendflux.space",
    impact: "Verified teachers · Bangla + English",
    tagline: "Real-time whiteboard, slides & AI assistant — live classes plus on-demand courses",
  },
  {
    name: "VerdaFlux Spectrum",
    role: "Product · Private access app",
    logo: brandVerdafluxSpectrum,
    href: "https://spectrum.trendflux.space",
    impact: "A TrendFlux Product",
    tagline: "PIN-gated workspace for authorised TrendFlux operators only",
  },
  {
    name: "Starpath Technology & Consultancy",
    role: "Strategy, systems & content lead — in-house",
    logo: brandStarpath,
    href: "https://facebook.com/starpathtech",
    impact: "588 REHAB leads · 5–8M BDT pitches",
    tagline: "GHL + Wix CRM hybrid, McKinsey-grade proposals, 4-week AI content OS",
    paid: true,
  },
  {
    name: "Pabna Nagorik Committee",
    role: "Website, social & content — full stack solo",
    logo: brandPabnaNagorik,
    href: "https://www.facebook.com/PabnaNagorikCommittee",
    impact: "485K+ organic views",
    tagline: "নাগরিক ঐক্যেই বদলাবে পাবনা — strategy, creative, setup, ops",
    paid: true,
  },
  { name: "H&B EduVerse", role: "Growth systems · EdTech", logo: brandHbEduverse },
  { name: "Marie J. Elliot", role: "Brand & funnel · Child Parenting", logo: brandMarieElliot },
  { name: "Pabna Debate Society", role: "Community ops · Education", logo: brandPabnaDebate },
];

export type IconItem = { icon: LucideIcon; label: string };

export const TRUST: IconItem[] = [
  { icon: Bot, label: "AI Automation" },
  { icon: Database, label: "CRM Infrastructure" },
  { icon: Megaphone, label: "Meta Ad Systems" },
  { icon: GitBranch, label: "Workflow Orchestration" },
  { icon: Palette, label: "Creative Frameworks" },
  { icon: Sparkles, label: "Analytics Intelligence" },
];

export type Service = { icon: LucideIcon; title: string; desc: string };

export const SERVICES: Service[] = [
  { icon: Megaphone, title: "Meta Ads", desc: "Advantage+ funnels engineered for sub-$8 CAC and compounding ROAS." },
  { icon: Bot, title: "AI Automation", desc: "Agents and workflows that replace 20+ manual hours weekly." },
  { icon: Database, title: "CRM Systems", desc: "Lead scoring, lifecycle, and pipeline visibility — one source of truth." },
  { icon: Workflow, title: "Funnel Engineering", desc: "Acquisition, activation, retention — wired end to end." },
  { icon: Palette, title: "Creative Strategy", desc: "Hook-rate framework, weekly creative tests, motion + UGC at scale." },
  { icon: Target, title: "Founder Branding", desc: "Position founders as category operators, not commodity service providers." },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
  logo: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "TrendFlux replaced three agencies and two internal hires. Our pipeline is now an audited system, not a guessing game.",
    name: "Director of Growth",
    role: "Series-A SaaS · $14M ARR",
    company: "Starpath Technology",
    logo: brandStarpath,
  },
  {
    quote:
      "Within 60 days we cut CAC by 38% and reclaimed 22 founder hours a week. The OS framing is real — not marketing copy.",
    name: "Founder & CEO",
    role: "DTC portfolio · 7-figure scale",
    company: "H&B EduVerse",
    logo: brandHbEduverse,
  },
  {
    quote:
      "The only operator I've worked with who treats growth like infrastructure. Every workflow is observable and ownable.",
    name: "Head of Operations",
    role: "B2B services · $6M ARR",
    company: "Pabna Nagorik Committee",
    logo: brandPabnaNagorik,
  },
];

export const FIT: string[] = [
  "Founder-led brand doing $1M–$50M annual revenue",
  "Ready to consolidate scattered tools into one OS",
  "Committed to a 90-day systems engagement",
  "Values operating leverage over vanity reporting",
];

export type OutcomeType = "CAC" | "Engagement" | "Lead Capture" | "Content Cadence";

export type SystemStep = {
  icon: LucideIcon;
  step: string;
  title: string;
  window: string;
  desc: string;
  outputs: string[];
  outcome: { metric: string; label: string };
  /** Slug of the matching case study on /case-studies/:slug. */
  caseSlug?: string;
  /** Outcome-type tags for the filter UI on Systems He Built. */
  outcomeTypes: OutcomeType[];
};

export const SYSTEMS_HE_BUILT: SystemStep[] = [
  {
    icon: Target,
    step: "Step 01",
    title: "Signal & Positioning System",
    window: "Days 1–14",
    desc: "Audit the funnel, isolate the highest-leverage offer, and rewrite category positioning so every downstream asset compounds.",
    outputs: ["Positioning brief", "ICP scorecard", "Offer architecture"],
    outcome: { metric: "2.3×", label: "avg. lift in qualified reply rate" },
    caseSlug: "personal-brand-authority",
  },
  {
    icon: Megaphone,
    step: "Step 02",
    title: "Paid Acquisition System",
    window: "Days 15–35",
    desc: "Stand up Meta Advantage+ funnels with creative testing cadence, hook-rate tracking, and CAC ceilings wired to spend controls.",
    outputs: ["Ads account build", "Creative testing matrix", "CAC dashboard"],
    outcome: { metric: "−38%", label: "median CAC after 30 days" },
    caseSlug: "global-strategy-us-uk",
  },
  {
    icon: PenLine,
    step: "Step 03",
    title: "Content Engine System",
    window: "Days 20–50",
    desc: "A production pipeline for hook-led short-form, long-form authority, and always-on creative refresh — briefs, editors, and publishing cadence in one loop.",
    outputs: ["Editorial calendar", "Hook & script library", "Short-form production pipeline"],
    outcome: { metric: "12×", label: "publish cadence vs. baseline" },
    caseSlug: "content-engine-200",
  },
  {
    icon: Database,
    step: "Step 04",
    title: "CRM & Lifecycle System",
    window: "Days 30–55",
    desc: "One source of truth for every lead. Scoring, routing, and lifecycle automations replace spreadsheets and Slack handoffs.",
    outputs: ["CRM schema", "Lead-scoring model", "Lifecycle automations"],
    outcome: { metric: "100%", label: "leads scored & routed automatically" },
    caseSlug: "whatsapp-lead-conversion",
  },
  {
    icon: Bot,
    step: "Step 05",
    title: "AI Automation System",
    window: "Days 45–75",
    desc: "Agents and workflows that replace 20+ manual hours weekly — qualification, follow-up, reporting, and content ops.",
    outputs: ["Agent stack", "Workflow library", "SOP playbooks"],
    outcome: { metric: "20+ hrs", label: "manual ops removed per week" },
    caseSlug: "kormoshikkha-edtech-platform",
  },
  {
    icon: Sparkles,
    step: "Step 06",
    title: "Analytics & Ownership System",
    window: "Days 70–90",
    desc: "Observable dashboards, governance, and handover. You exit the engagement owning the OS — not renting it.",
    outputs: ["Exec dashboard", "Governance doc", "Team training"],
    outcome: { metric: "1", label: "exec dashboard, full-team trained" },
    caseSlug: "sme-growth-architecture",
  },
  {
    icon: ShieldCheck,
    step: "Outcome",
    title: "Your Growth OS",
    window: "Day 91+",
    desc: "Six systems, one operating layer. Audited, documented, and built to run without an agency on retainer.",
    outputs: ["Audit-ready OS", "Founder ownership", "Compounding leverage"],
    outcome: { metric: "0", label: "agency retainer required to operate" },
    caseSlug: "organic-reach-485k",
  },
];

export type AcademyModule = { title: string; desc: string };

export const ACADEMY_MODULES: AcademyModule[] = [
  { title: "Systems Thinking", desc: "Architect leverage, not tasks." },
  { title: "AI Marketing", desc: "Agents, prompts, automated funnels." },
  { title: "Operational Scaling", desc: "From 1 brand to a portfolio." },
  { title: "Founder Education", desc: "Position, price, and lead." },
];

// Re-export shared icons used by section components without re-importing
// lucide from each file (keeps section files lean and tree-shakeable).
export { CheckCircle2, GraduationCap };