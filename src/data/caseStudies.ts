import {
  OrganicGrowthIcon,
  ContentEngineIcon,
  GlobalStrategyIcon,
  AutomationFunnelIcon,
  SmeGrowthIcon,
  PersonalBrandIcon,
} from "@/components/CaseIcons";

export type CaseIcon = (props: React.SVGProps<SVGSVGElement>) => JSX.Element;

export type System = "automation" | "media" | "ecosystem" | "brand";

/** A single quantified outcome surfaced on the narrative page. */
export type CaseOutcome = {
  /** Headline figure, e.g. "485K+" */
  metric: string;
  /** What the figure measures, e.g. "Organic video views" */
  label: string;
  /** One-line context explaining how it was achieved */
  detail: string;
};

/** Grouped technology / platform stack used to deliver the engagement. */
export type CaseTechGroup = {
  group: string;
  items: string[];
};

export type CaseStudy = {
  /** Stable slug used for routing/deep-linking */
  slug: string;
  category: string;
  title: string;
  description: string;
  results: string[];
  Icon: CaseIcon;
  situation: string;
  problem: string;
  solution: string;
  insight: string;
  /** Quantified outcomes rendered as a metric grid on the narrative page */
  outcomes: CaseOutcome[];
  /** Delivery stack rendered on the narrative page */
  techStack: CaseTechGroup[];
  /** Engagement shape, shown beside the stack */
  engagement: { duration: string; model: string };
  /** Filter taxonomy */
  service: "AI Automation" | "Paid Media" | "Funnels" | "Branding";
  industry: "Education" | "Retail" | "SaaS" | "Personal Brand";
  stack: ("Meta Ads" | "GoHighLevel" | "WhatsApp" | "CRM")[];
  stage: "Startup" | "Growth" | "Scale" | "Enterprise";
  /** Impact-map metadata (single source of truth for the map nodes) */
  map: {
    city: string;
    region: string;
    /** Position in % of map container */
    x: number;
    y: number;
    system: System;
    /** Headline outcome surfaced on the map tooltip */
    outcome: string;
  };
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "kormoshikkha-edtech-platform",
    category: "EdTech Platform",
    title: "কর্মশিক্ষা TED Plus — Online EdTech Platform",
    description:
      "Designed and operated TrendFlux's flagship online learning platform — cohort-based AI masterclasses with modular curriculum, recordings, and end-to-end delivery infrastructure.",
    results: ["7+ modules live", "Cohort-based delivery", "End-to-end ownership"],
    Icon: ContentEngineIcon,
    situation:
      "TrendFlux needed a dedicated learning surface to productize its AI and growth expertise beyond 1-1 client work.",
    problem:
      "Knowledge lived in scattered docs and sessions — no scalable way to enroll students, deliver lessons, or track progress as a real platform.",
    solution:
      "Built কর্মশিক্ষা TED Plus as a full edtech product: modular curriculum, cohort enrollment flow, recordings, payment + admin tooling, and an operating cadence for releases.",
    insight:
      "An edtech platform is an operating system, not a course — sustained value comes from the delivery loop, not the content drop.",
    outcomes: [
      {
        metric: "7+",
        label: "Modules shipped live",
        detail: "Modular curriculum released on a fixed cohort cadence instead of one-off drops.",
      },
      {
        metric: "100%",
        label: "In-house delivery ownership",
        detail: "Enrollment, payments, recordings and admin tooling run on one owned stack.",
      },
      {
        metric: "24/7",
        label: "Self-serve enrollment",
        detail: "Automated checkout and access provisioning removed manual onboarding work.",
      },
    ],
    techStack: [
      { group: "Product", items: ["React", "TypeScript", "Tailwind CSS"] },
      { group: "Backend", items: ["Postgres", "Row Level Security", "Edge Functions"] },
      { group: "Operations", items: ["CRM", "Payment reconciliation", "Admin console"] },
    ],
    engagement: { duration: "Ongoing platform ownership", model: "Build + operate" },
    service: "AI Automation",
    industry: "Education",
    stack: ["CRM"],
    stage: "Growth",
    map: {
      city: "Dhaka",
      region: "Bangladesh · EdTech",
      x: 54,
      y: 50,
      system: "ecosystem",
      outcome: "কর্মশিক্ষা TED Plus — AI EdTech platform",
    },
  },
  {
    slug: "organic-reach-485k",
    category: "Organic Growth System",
    title: "Scaling Organic Reach to 485K+",
    description:
      "Built a structured content system that generated massive organic reach without paid ads.",
    results: ["485K+ video views", "80%+ organic reach", "45%+ engagement growth"],
    Icon: OrganicGrowthIcon,
    situation: "The brand lacked visibility and had no structured content approach.",
    problem: "Inconsistent posting, low engagement, and no audience targeting.",
    solution:
      "Developed a reels-first content system using hooks, storytelling, and structured scheduling.",
    insight: "Content success is driven by structure and psychology — not volume.",
    outcomes: [
      {
        metric: "485K+",
        label: "Organic video views",
        detail: "Achieved with zero paid amplification across a single quarter of publishing.",
      },
      {
        metric: "80%+",
        label: "Share of reach that was organic",
        detail: "Hook-led reels formats outperformed boosted posts on cost per view.",
      },
      {
        metric: "45%+",
        label: "Engagement rate growth",
        detail: "Comment-first storytelling structure lifted saves and shares month over month.",
      },
    ],
    techStack: [
      { group: "Creative", items: ["Reels production system", "Hook library", "Caption frameworks"] },
      { group: "Distribution", items: ["Meta Business Suite", "Scheduling calendar"] },
      { group: "Measurement", items: ["Retention analytics", "Weekly performance review"] },
    ],
    engagement: { duration: "90-day sprint", model: "Content system build" },
    service: "Branding",
    industry: "Personal Brand",
    stack: ["Meta Ads"],
    stage: "Growth",
    map: { city: "Sylhet", region: "Diaspora Loop", x: 78, y: 32, system: "brand", outcome: "485K+ organic reach" },
  },
  {
    slug: "content-engine-200",
    category: "Content Engine",
    title: "200+ Digital Asset Production System",
    description:
      "Created a scalable content production engine using templates and AI-assisted workflows.",
    results: ["200+ assets delivered", "Faster content execution", "Consistent brand identity"],
    Icon: ContentEngineIcon,
    situation: "Manual asset production was slow and inconsistent across campaigns.",
    problem: "Bottlenecked design output, off-brand variations, missed launch windows.",
    solution:
      "Built a templated production engine combining Figma systems, Canva libraries, and AI copy workflows.",
    insight: "Systems out-produce talent when speed and consistency both matter.",
    outcomes: [
      {
        metric: "200+",
        label: "Assets delivered",
        detail: "Campaign-ready creative produced from a shared template system.",
      },
      {
        metric: "3×",
        label: "Faster turnaround",
        detail: "Brief-to-publish time compressed by removing bespoke design cycles.",
      },
      {
        metric: "1",
        label: "Single brand source of truth",
        detail: "Locked type, colour and layout tokens eliminated off-brand variants.",
      },
    ],
    techStack: [
      { group: "Design system", items: ["Figma component library", "Canva brand kit"] },
      { group: "AI workflow", items: ["Prompt templates", "Copy generation", "Automated QA pass"] },
      { group: "Delivery", items: ["Asset repository", "Approval pipeline"] },
    ],
    engagement: { duration: "6-week build", model: "Production engine handover" },
    service: "AI Automation",
    industry: "SaaS",
    stack: ["CRM"],
    stage: "Scale",
    map: { city: "Rajshahi", region: "North Belt", x: 28, y: 32, system: "automation", outcome: "200+ assets / month" },
  },
  {
    slug: "global-strategy-us-uk",
    category: "Global Strategy",
    title: "Multi-Market Digital Strategy (US/UK)",
    description: "Optimized content and marketing strategy for international audience targeting.",
    results: ["Improved engagement", "Market-aligned content", "Better audience targeting"],
    Icon: GlobalStrategyIcon,
    situation: "A single-market playbook was being copy-pasted across geographies.",
    problem: "Tone, references, and offers didn't resonate with US/UK audiences.",
    solution:
      "Rebuilt positioning, creative, and channel mix per market with localized creative variants.",
    insight: "Global growth is local execution — not translated copy.",
    outcomes: [
      {
        metric: "2",
        label: "Markets launched independently",
        detail: "US and UK ran separate positioning, offers and creative rotations.",
      },
      {
        metric: "Lower",
        label: "Cost per qualified lead",
        detail: "Market-specific creative beat the translated control set in every test cell.",
      },
      {
        metric: "Higher",
        label: "Message-market fit",
        detail: "Localized proof points and pricing framing lifted landing page engagement.",
      },
    ],
    techStack: [
      { group: "Paid media", items: ["Meta Ads", "Audience segmentation", "Creative testing matrix"] },
      { group: "Localization", items: ["Market positioning docs", "Offer variants"] },
      { group: "Data", items: ["CRM attribution", "Cohort reporting"] },
    ],
    engagement: { duration: "Quarterly retainer", model: "Strategy + media operations" },
    service: "Paid Media",
    industry: "Retail",
    stack: ["Meta Ads", "CRM"],
    stage: "Scale",
    map: { city: "Chattogram", region: "Coastal Hub", x: 70, y: 70, system: "media", outcome: "US/UK localized launches" },
  },
  {
    slug: "whatsapp-lead-conversion",
    category: "Automation Funnel",
    title: "WhatsApp Lead Conversion System",
    description: "Built an automated funnel to convert inquiries into booked strategy calls.",
    results: ["Faster response time", "Higher lead engagement", "Increased booking rate"],
    Icon: AutomationFunnelIcon,
    situation: "Inbound leads were dropping off before reaching a human.",
    problem: "Slow replies, no qualification, no follow-up sequence.",
    solution:
      "Wired a WhatsApp + CRM automation that qualified, nurtured, and booked calls 24/7.",
    insight: "Speed-to-lead is the cheapest conversion lever most brands ignore.",
    outcomes: [
      {
        metric: "<60s",
        label: "First response time",
        detail: "Automated qualification replies fire the moment an inquiry lands.",
      },
      {
        metric: "24/7",
        label: "Booking availability",
        detail: "Calendar handoff runs outside office hours and across time zones.",
      },
      {
        metric: "0",
        label: "Leads lost to follow-up gaps",
        detail: "Multi-step nurture sequences retry until the lead books or opts out.",
      },
    ],
    techStack: [
      { group: "Messaging", items: ["WhatsApp Business API", "Template messages"] },
      { group: "Automation", items: ["GoHighLevel", "Qualification logic", "Follow-up sequences"] },
      { group: "CRM", items: ["Lead lifecycle stages", "Calendar sync", "Owner alerts"] },
    ],
    engagement: { duration: "4-week implementation", model: "Funnel build + automation" },
    service: "Funnels",
    industry: "Education",
    stack: ["WhatsApp", "GoHighLevel", "CRM"],
    stage: "Growth",
    map: { city: "Dhaka", region: "HQ · Bangladesh", x: 52, y: 48, system: "ecosystem", outcome: "24/7 booked calls" },
  },
  {
    slug: "sme-growth-architecture",
    category: "SME Growth",
    title: "SME Growth System Architecture",
    description: "Designed structured growth systems for SMEs targeting scalable operations.",
    results: ["Clear funnel structure", "CRM integration", "Scalable business model"],
    Icon: SmeGrowthIcon,
    situation: "Owner-led SME with strong service but no repeatable acquisition model.",
    problem: "Revenue depended entirely on referrals and founder hustle.",
    solution:
      "Architected a top-to-bottom funnel with CRM, content, and outbound playbooks.",
    insight: "SMEs scale when founders escape every step of the customer journey.",
    outcomes: [
      {
        metric: "1",
        label: "Documented acquisition system",
        detail: "Referral dependency replaced with a repeatable, teachable funnel.",
      },
      {
        metric: "End-to-end",
        label: "CRM pipeline coverage",
        detail: "Every lead tracked from first touch through proposal and close.",
      },
      {
        metric: "Founder-free",
        label: "Top-of-funnel operation",
        detail: "Content and outbound playbooks run without the owner in every step.",
      },
    ],
    techStack: [
      { group: "Pipeline", items: ["GoHighLevel", "CRM stages", "Proposal templates"] },
      { group: "Acquisition", items: ["Outbound playbooks", "Content calendar"] },
      { group: "Enablement", items: ["SOP library", "Team training"] },
    ],
    engagement: { duration: "8-week architecture sprint", model: "Systems design + handover" },
    service: "Funnels",
    industry: "Retail",
    stack: ["GoHighLevel", "CRM"],
    stage: "Startup",
    map: { city: "Khulna", region: "South-West", x: 30, y: 70, system: "ecosystem", outcome: "Repeatable acquisition" },
  },
  {
    slug: "personal-brand-authority",
    category: "Personal Brand",
    title: "Authority-Based Personal Brand System",
    description: "Built positioning and content strategy for strong authority and engagement.",
    results: ["Clear niche positioning", "Strong audience connection", "Consistent brand identity"],
    Icon: PersonalBrandIcon,
    situation: "Talented operator with no recognizable public voice or positioning.",
    problem: "Generic content, no clear ICP, no compounding inbound.",
    solution:
      "Defined a sharp niche thesis and built a content engine around proof-driven storytelling.",
    insight: "Authority compounds when every post reinforces one undeniable thesis.",
    outcomes: [
      {
        metric: "9.2×",
        label: "Authority signal lift",
        detail: "Profile visits, saves and inbound mentions measured against the pre-launch baseline.",
      },
      {
        metric: "1",
        label: "Owned positioning thesis",
        detail: "Every asset now reinforces a single, defensible point of view.",
      },
      {
        metric: "Compounding",
        label: "Inbound conversations",
        detail: "Proof-driven storytelling turned audience growth into qualified inbound.",
      },
    ],
    techStack: [
      { group: "Positioning", items: ["Niche thesis", "ICP definition", "Message hierarchy"] },
      { group: "Content", items: ["Narrative frameworks", "Proof asset library"] },
      { group: "Distribution", items: ["Meta Ads", "Publishing cadence"] },
    ],
    engagement: { duration: "12-week program", model: "Positioning + content engine" },
    service: "Branding",
    industry: "Personal Brand",
    stack: ["Meta Ads"],
    stage: "Startup",
    map: { city: "Rangpur", region: "North Frontier", x: 40, y: 14, system: "brand", outcome: "9.2× authority lift" },
  },
];

/** Custom event name used to open a case-study narrative from anywhere (e.g. impact map). */
export const CASE_STUDY_OPEN_EVENT = "case-study:open";
