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
    title: "KormoShikkha — Online EdTech Platform",
    description:
      "Designed and operated TrendFlux's flagship online learning platform — cohort-based AI masterclasses with modular curriculum, recordings, and end-to-end delivery infrastructure.",
    results: ["7+ modules live", "Cohort-based delivery", "End-to-end ownership"],
    Icon: ContentEngineIcon,
    situation:
      "TrendFlux needed a dedicated learning surface to productize its AI and growth expertise beyond 1-1 client work.",
    problem:
      "Knowledge lived in scattered docs and sessions — no scalable way to enroll students, deliver lessons, or track progress as a real platform.",
    solution:
      "Built KormoShikkha as a full edtech product: modular curriculum, cohort enrollment flow, recordings, payment + admin tooling, and an operating cadence for releases.",
    insight:
      "An edtech platform is an operating system, not a course — sustained value comes from the delivery loop, not the content drop.",
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
      outcome: "KormoShikkha — AI EdTech platform",
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
    service: "Branding",
    industry: "Personal Brand",
    stack: ["Meta Ads"],
    stage: "Startup",
    map: { city: "Rangpur", region: "North Frontier", x: 40, y: 14, system: "brand", outcome: "9.2× authority lift" },
  },
];

/** Custom event name used to open a case-study narrative from anywhere (e.g. impact map). */
export const CASE_STUDY_OPEN_EVENT = "case-study:open";
