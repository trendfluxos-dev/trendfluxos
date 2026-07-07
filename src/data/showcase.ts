export type ShowcaseCategory =
  | "Client Project"
  | "Social Platform"
  | "Website"
  | "Enterprise System"
  | "Personal Initiative"
  | "Media Coverage";

export type ShowcaseSize = "sm" | "md" | "lg";

/**
 * Faceted taxonomies used by the /showcase filter UI.
 * Keep these closed unions so the filter chips render only known values.
 */
export type ShowcaseIndustry =
  | "EdTech"
  | "Civic / Non-profit"
  | "Media & Storytelling"
  | "Wedding & Lifestyle"
  | "Studio & Production"
  | "HR & Careers"
  | "Enterprise / B2B"
  | "Personal Brand"
  | "Advocacy"
  | "Press"
  | "News & Journalism"
  | "Hospitality & Skills";

export type ShowcaseService =
  | "Web Development"
  | "Brand Architecture"
  | "Content Engine"
  | "AI Automation"
  | "CRM & Workflow"
  | "Paid Media"
  | "Community Ops"
  | "Documentary";

export type ShowcaseTech =
  | "React"
  | "TypeScript"
  | "Tailwind"
  | "Supabase"
  | "Vercel"
  | "n8n"
  | "OpenAI"
  | "Meta Ads"
  | "Facebook"
  | "LinkedIn"
  | "WordPress"
  | "Wix"
  | "GHL";

/**
 * Business stage of a project — used by the Showcase filter to help
 * visitors quickly find work at a comparable maturity level.
 */
export type ShowcaseStage = "Pilot" | "Live" | "Scaling" | "Ongoing";

export type ShowcaseItem = {
  id: string;
  title: string;
  category: ShowcaseCategory;
  year: string;
  summary: string;
  metrics?: { label: string; value: string }[];
  tags?: string[];
  industry?: ShowcaseIndustry;
  services?: ShowcaseService[];
  tech?: ShowcaseTech[];
  stage?: ShowcaseStage;
  href?: string; // internal route or external URL
  external?: boolean;
  size?: ShowcaseSize; // controls visual prominence
  accent?: "cyan" | "gold" | "violet" | "rose" | "emerald";
  videoUrl?: string; // if set, YouTube-share tab unlocks
  /**
   * Optional at-a-glance case-study breakdown. When present, the showcase
   * card renders a Problem → System → Result strip so the value lands in
   * one read. Reserve for top-performing / flagship items.
   */
  caseStudy?: {
    problem: string;
    system: string;
    result: string;
  };
  /**
   * Long-form narrative paragraphs shown on the dedicated project detail
   * page (`/showcase/:id`). When omitted, the detail page falls back to
   * `summary` + `caseStudy` copy.
   */
  narrative?: string[];
  /** Bullet outcomes shown on the detail page under "Outcomes". */
  outcomes?: string[];
  /** Optional external live link label for the detail page CTA. */
  liveLabel?: string;
};

export const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "trendflux-space",
    stage: "Live", "TrendFlux Space",
    category: "Website",
    year: "2025 — Present",
    summary:
      "TrendFlux Digital's dedicated product space — a sister surface that hosts experimental products, micro-tools and launch pads under the TrendFlux umbrella.",
    tags: ["Product Hub", "Sister Site", "TrendFlux"],
    industry: "Enterprise / B2B",
    services: ["Web Development", "Brand Architecture"],
    tech: ["React", "TypeScript", "Tailwind"],
    href: "https://trendflux.space",
    external: true,
    size: "md",
    accent: "cyan",
    narrative: [
      "TrendFlux Space is the sister surface to TrendFlux Digital — a dedicated product hub where experimental micro-tools, launch pads and sub-brands live without cluttering the main portfolio site.",
      "The domain acts as a namespace: every new SaaS-flavoured module (Spectrum, AgentAI SMM, Scheduler) mounts as a subdomain and inherits shared brand tokens, layout primitives and analytics wiring.",
    ],
    outcomes: [
      "Independent surface for shipping product experiments without diluting the primary brand",
      "Shared design system and Supabase auth across every trendflux.space subdomain",
      "Home base for launch pages of AgentAI SMM, Spectrum and future TrendFlux products",
    ],
  },
  {
    id: "verdaflux-spectrum",
    stage: "Pilot", "VerdaFlux Spectrum",
    category: "Website",
    year: "2025 — Present",
    summary:
      "Spectrum sub-product on TrendFlux Space — a focused VerdaFlux surface for spectrum/data-driven storytelling, operated as part of the TrendFlux Digital ecosystem.",
    tags: ["Sub-product", "Spectrum", "VerdaFlux"],
    industry: "Enterprise / B2B",
    services: ["Web Development", "Content Engine"],
    tech: ["React", "TypeScript", "Tailwind"],
    href: "https://spectrum.trendflux.space",
    external: true,
    size: "md",
    accent: "emerald",
    narrative: [
      "VerdaFlux Spectrum is a focused surface for data-driven storytelling — dashboards, spectrum reports and briefings distilled into shareable narrative units.",
      "Built as a sub-product on TrendFlux Space, it inherits the shared design system while keeping its own editorial voice and reporting cadence.",
    ],
    outcomes: [
      "Live spectrum/reporting surface operating under the TrendFlux Space namespace",
      "Editorial pipeline for turning raw data into shareable civic and market briefings",
    ],
  },
  {
    id: "kormoshikkha",
    stage: "Scaling", "কর্মশিক্ষা TED Plus — Online Edtech Platform",
    category: "Enterprise System",
    year: "2025 — Present",
    summary:
      "TrendFlux's online learning platform — cohort-based AI masterclasses, modular curriculum and recordings. Designed and operated end-to-end.",
    metrics: [
      { label: "Modules", value: "7+" },
      { label: "Status", value: "Live" },
    ],
    tags: ["EdTech", "AI Masterclass", "Cohort"],
    industry: "EdTech",
    services: ["Web Development", "Brand Architecture", "Content Engine"],
    tech: ["React", "TypeScript", "Tailwind", "Supabase", "Vercel"],
    href: "/edtech",
    size: "lg",
    accent: "emerald",
    caseStudy: {
      problem:
        "Founder Zahid Hasan Emon needed a structured online classroom — scattered cohorts, manual enrolments, no recordings home.",
      system:
        "End-to-end edtech platform: modular curriculum, cohort scheduling, payment-gated enrolment, recordings library and admin ops.",
      result:
        "Live platform running 7+ AI masterclass modules with recurring cohorts and an automated enrolment-to-classroom flow.",
    },
    narrative: [
      "কর্মশিক্ষা TED Plus is TrendFlux's Bangla-first online classroom. Before it existed, cohorts were run over Messenger threads, Zoom links and manual bKash confirmations — enrolments leaked, recordings vanished and instructors had no single source of truth.",
      "The platform now handles the full learner journey end-to-end: browse cohorts, pay via a gated enrolment flow, land in a personal classroom with lessons, live class links, teacher notes and recordings — all under one login.",
      "Instructor-side, an admin console handles cohort scheduling, enrolment approvals, recording uploads and certificate issuance without leaving the app.",
    ],
    outcomes: [
      "7+ live AI masterclass modules running on recurring cohorts",
      "Payment-gated enrolment with automated learner provisioning",
      "Recordings library, live class links and certificate issuance in one place",
      "Bilingual (Bangla + English) UI tuned for Bangladesh learners",
    ],
  },
  {
    id: "trendflux-ecosystem",
    stage: "Scaling", "TrendFlux Ecosystem",
    category: "Enterprise System",
    year: "2024 — Present",
    summary:
      "Founder-built growth operating system — combining AI automation, content engines, brand architecture and client delivery into one unified ecosystem.",
    metrics: [
      { label: "Engagement Growth", value: "45%+" },
      { label: "Modules Shipped", value: "12+" },
    ],
    tags: ["Founder", "AI Automation", "Growth OS"],
    industry: "Enterprise / B2B",
    services: ["AI Automation", "CRM & Workflow", "Brand Architecture", "Content Engine"],
    tech: ["React", "TypeScript", "Tailwind", "Supabase", "OpenAI", "n8n"],
    href: "/ecosystem",
    size: "lg",
    accent: "cyan",
    caseStudy: {
      problem:
        "Growth work was fragmented across tools — content, automation, CRM and brand each lived in disconnected silos.",
      system:
        "Founder-built Growth OS unifying AI automation, content engines, brand architecture and client delivery on one stack.",
      result:
        "12+ shipped modules and 45%+ engagement growth across operated brands, run by a single operator-led ecosystem.",
    },
    narrative: [
      "The TrendFlux Ecosystem is the founder-built growth operating system that ties every operated brand together — a single stack for automation, CRM, content engines, paid media, analytics and brand architecture.",
      "Rather than stitching a dozen SaaS tools, each module is a first-party component: leads flow from ad to CRM to nurture to closed loop; content ideas flow from research to publish to recap; classes flow from enrolment to classroom to certificate.",
      "The result is compounding leverage — every new brand plugged into the OS inherits automation, analytics and brand governance from day one.",
    ],
    outcomes: [
      "12+ shipped modules across marketing, learning, enterprise and civic surfaces",
      "45%+ engagement growth across operated brands",
      "Single-operator delivery model — no agency layer, no black boxes",
      "Shared design system, auth and analytics across the entire brand family",
    ],
  },
  {
    id: "pabna-nagarik",
    stage: "Scaling", "Pabna Nagorik Committee",
    category: "Client Project",
    year: "2024 — 2025",
    summary:
      "Built a structured civic content engine — 166 designs, 22 reels, narrative-driven brand voice with 82% organic reach.",
    metrics: [
      { label: "Organic Views", value: "4.85L+" },
      { label: "Organic Reach", value: "82%" },
    ],
    tags: ["Civic Brand", "Content Engine", "Bangladesh"],
    industry: "Civic / Non-profit",
    services: ["Brand Architecture", "Content Engine", "Community Ops"],
    tech: ["Facebook", "WordPress"],
    href: "https://pncpabna.live",
    external: true,
    size: "lg",
    accent: "gold",
    caseStudy: {
      problem:
        "A civic committee with strong intent but no consistent voice, visual system or distribution rhythm on social.",
      system:
        "Structured content engine: narrative brand voice, 166 designs, 22 reels and a weekly publishing cadence.",
      result:
        "4.85L+ organic views and 82% organic reach — built without paid amplification.",
    },
    narrative: [
      "Pabna Nagorik Committee arrived with strong civic intent and a fragmented voice — inconsistent visuals, ad-hoc posts and no distribution rhythm on social.",
      "The engagement rebuilt the brand from the ground up: a narrative POV, a repeatable visual system, a weekly publishing cadence, and a live web presence at pncpabna.live that mirrors the social voice.",
      "Content was structured as a compounding engine — 166 designs and 22 reels shipped over the cycle, all without paid amplification.",
    ],
    outcomes: [
      "4.85L+ organic views across Facebook and Reels",
      "82% organic reach — zero paid boost",
      "166 designs and 22 reels shipped under one consistent brand voice",
      "Live web presence at pncpabna.live mirroring the social identity",
    ],
  },
  {
    id: "nagarikbarta24",
    stage: "Live", "Nagorik Barta 24",
    category: "Client Project",
    year: "2025 — Present",
    summary:
      "Independent civic news portal — editorial CMS, category-driven newsroom layout and mobile-first reading experience for a Bangladesh audience.",
    tags: ["News", "Newsroom", "Bangladesh"],
    industry: "News & Journalism",
    services: ["Web Development", "Brand Architecture", "Content Engine"],
    tech: ["WordPress"],
    href: "https://nagarikbarta24.news",
    external: true,
    size: "md",
    accent: "emerald",
    narrative: [
      "Nagorik Barta 24 is an independent civic news portal serving a Bangladesh audience with a mobile-first reading experience and a category-driven newsroom layout.",
      "The engagement covered the full editorial stack — CMS setup, newsroom taxonomy, brand system, homepage architecture and reader-facing performance tuning.",
    ],
    outcomes: [
      "Live news portal at nagarikbarta24.news",
      "Editorial CMS with category-driven newsroom layout",
      "Mobile-first reading experience tuned for Bangladesh network conditions",
    ],
  },
  {
    id: "eish-live",
    stage: "Live", "EISH — Enter Institute of Skill & Hospitality",
    category: "Client Project",
    year: "2025 — Present",
    summary:
      "Skill & hospitality institute site — programme catalogue, admissions flow and brand system for a training institute in Bangladesh.",
    tags: ["Institute", "Hospitality", "Admissions"],
    industry: "Hospitality & Skills",
    services: ["Web Development", "Brand Architecture"],
    tech: ["React", "TypeScript", "Tailwind"],
    href: "https://www.eish.live",
    external: true,
    size: "md",
    accent: "emerald",
    narrative: [
      "EISH — Enter Institute of Skill & Hospitality — is a training institute site built to convert prospective students into applicants.",
      "The build covers the programme catalogue, admissions flow, faculty and campus story, and a coherent brand system that carries from web to print collateral.",
    ],
    outcomes: [
      "Live institute site at eish.live with full programme catalogue",
      "Structured admissions flow from browse → interest → apply",
      "Cohesive brand identity from web to print",
    ],
  },
  {
    id: "agentai-smm",
    stage: "Pilot", "AgentAI SMM",
    category: "Enterprise System",
    year: "2025 — Present",
    summary:
      "AI social-media agent — automated content ideation, scheduling and analytics for growth operators, running on the TrendFlux Space subdomain.",
    tags: ["AI Agent", "SMM", "Automation"],
    industry: "Enterprise / B2B",
    services: ["AI Automation", "Content Engine", "Web Development"],
    tech: ["React", "TypeScript", "Tailwind", "Supabase", "OpenAI", "n8n"],
    href: "https://agentai-smm.trendflux.space",
    external: true,
    size: "md",
    accent: "cyan",
    narrative: [
      "AgentAI SMM is TrendFlux's AI social-media agent — an automated ideation, scheduling and analytics layer built for growth operators who publish across multiple brands.",
      "The agent consumes a brand brief, produces on-voice content variants, schedules them across channels and closes the loop with performance analytics that feed back into the next ideation cycle.",
      "It runs on the TrendFlux Space subdomain and shares auth, design tokens and analytics with the rest of the ecosystem.",
    ],
    outcomes: [
      "AI-driven content ideation trained on per-brand voice briefs",
      "Multi-channel scheduling and publishing pipeline",
      "Analytics loop that feeds performance data back into ideation",
      "Runs on the shared TrendFlux Space namespace",
    ],
  },
  {
    id: "the-stand",
    stage: "Ongoing", "The Stand",
    category: "Personal Initiative",
    year: "2025",
    summary:
      "A personal whistleblower archive — long-form documentary, audio story, refusal stanzas and shareable quote engine.",
    tags: ["Storytelling", "Documentary", "Archive"],
    industry: "Media & Storytelling",
    services: ["Documentary", "Web Development", "Content Engine"],
    tech: ["React", "TypeScript", "Tailwind"],
    href: "/the-stand",
    size: "md",
    accent: "rose",
  },
  {
    id: "luxe-veil",
    stage: "Live", "Luxe Veil",
    category: "Website",
    year: "2025",
    summary:
      "Private invite-only wedding concierge platform — gated access, application flow and admin moderation panel.",
    tags: ["Invite-only", "Concierge", "Premium"],
    industry: "Wedding & Lifestyle",
    services: ["Web Development", "CRM & Workflow", "Brand Architecture"],
    tech: ["React", "TypeScript", "Tailwind", "Supabase"],
    href: "/luxe-veil",
    size: "md",
    accent: "violet",
  },
  {
    id: "brandtoki",
    stage: "Live", "Studio BrandToki",
    category: "Website",
    year: "2025",
    summary:
      "Production studio site — photography, videography and podcast booking flow for a Gulshan-based studio.",
    tags: ["Studio", "Production", "Booking"],
    industry: "Studio & Production",
    services: ["Web Development", "Brand Architecture"],
    tech: ["React", "TypeScript", "Tailwind"],
    href: "/brandtoki",
    size: "sm",
    accent: "gold",
  },
  {
    id: "trendflux-talent",
    stage: "Pilot", "TrendFlux Talent",
    category: "Website",
    year: "2025",
    summary:
      "Careers + talent platform connecting growth operators with founder-led brands across Bangladesh.",
    tags: ["Careers", "Talent"],
    industry: "HR & Careers",
    services: ["Web Development", "CRM & Workflow"],
    tech: ["React", "TypeScript", "Tailwind", "Supabase"],
    href: "/trendflux-talent",
    size: "sm",
    accent: "cyan",
  },
  {
    id: "enterprise-control",
    stage: "Pilot", "Enterprise Control Portal",
    category: "Enterprise System",
    year: "2025",
    summary:
      "ERP-style control portal — dashboards, automation, compliance and audit modules for mid-market operators.",
    tags: ["ERP", "Automation", "Compliance"],
    industry: "Enterprise / B2B",
    services: ["AI Automation", "CRM & Workflow", "Web Development"],
    tech: ["React", "TypeScript", "Tailwind", "Supabase", "n8n"],
    href: "/enterprise",
    size: "md",
    accent: "emerald",
  },
  {
    id: "masterclass",
    stage: "Live", "Advanced AI Masterclass",
    category: "Personal Initiative",
    year: "2025",
    summary:
      "Training program for growth operators — AI workflows, automation, income systems and applied case studies.",
    tags: ["Education", "AI", "Training"],
    industry: "EdTech",
    services: ["Content Engine", "Brand Architecture"],
    tech: ["OpenAI", "React", "Tailwind"],
    href: "/masterclass",
    size: "sm",
    accent: "gold",
  },
  {
    id: "debate-emon",
    stage: "Scaling", "Debate Emon",
    category: "Social Platform",
    year: "2023 — Present",
    summary:
      "Personal authority brand — 50,000+ youth engagement, 65% interaction growth across reels and long-form content.",
    metrics: [
      { label: "Audience", value: "50K+" },
      { label: "Interaction", value: "65%" },
    ],
    tags: ["Authority Brand", "Education", "Reels"],
    industry: "Personal Brand",
    services: ["Content Engine", "Community Ops"],
    tech: ["Facebook"],
    href: "https://www.facebook.com/zhemongrowth/",
    external: true,
    size: "md",
    accent: "violet",
    caseStudy: {
      problem:
        "A founder voice with deep expertise but no compounding authority surface for youth-focused growth content.",
      system:
        "Personal authority brand: weekly reels, long-form posts and a recognisable narrative POV around growth and AI.",
      result:
        "50,000+ engaged youth audience and 65% interaction growth across reels and long-form content.",
    },
  },
  {
    id: "zhemongrowth-linkedin",
    stage: "Ongoing", "@zhemongrowth — LinkedIn",
    category: "Social Platform",
    year: "Ongoing",
    summary:
      "Founder voice on LinkedIn — narrative-led posts on AI, automation and growth operating systems.",
    tags: ["LinkedIn", "Thought Leadership"],
    industry: "Personal Brand",
    services: ["Content Engine"],
    tech: ["LinkedIn"],
    href: "https://www.linkedin.com/in/zhemongrowth",
    external: true,
    size: "sm",
    accent: "cyan",
  },
  {
    id: "justice-appeal",
    stage: "Ongoing", "Justice Appeal",
    category: "Personal Initiative",
    year: "2025",
    summary:
      "Public appeal page with documented evidence, legal context and shareable summary cards.",
    tags: ["Advocacy", "Documentation"],
    industry: "Advocacy",
    services: ["Web Development", "Documentary"],
    tech: ["React", "TypeScript", "Tailwind"],
    href: "/justice-appeal",
    size: "sm",
    accent: "rose",
  },
  {
    id: "media-reports",
    stage: "Ongoing", "Media Coverage Archive",
    category: "Media Coverage",
    year: "2024 — 2025",
    summary:
      "Curated press mentions, interviews and reports — verified URLs with backup snapshots.",
    tags: ["Press", "Interviews"],
    industry: "Press",
    services: ["Content Engine"],
    tech: ["React", "Tailwind"],
    href: "/media-reports",
    size: "sm",
    accent: "gold",
  },
];

export const SHOWCASE_CATEGORIES: ShowcaseCategory[] = [
  "Client Project",
  "Website",
  "Enterprise System",
  "Social Platform",
  "Personal Initiative",
  "Media Coverage",
];

// Derived facet lists — single source of truth for the filter UI.
export const SHOWCASE_INDUSTRIES = Array.from(
  new Set(SHOWCASE_ITEMS.flatMap((i) => (i.industry ? [i.industry] : []))),
).sort() as ShowcaseIndustry[];

export const SHOWCASE_SERVICES = Array.from(
  new Set(SHOWCASE_ITEMS.flatMap((i) => i.services ?? [])),
).sort() as ShowcaseService[];

export const SHOWCASE_TECH = Array.from(
  new Set(SHOWCASE_ITEMS.flatMap((i) => i.tech ?? [])),
).sort() as ShowcaseTech[];

/** Business stage — kept in a stable order (early → mature → ongoing). */
export const SHOWCASE_STAGES: ShowcaseStage[] = [
  "Pilot",
  "Live",
  "Scaling",
  "Ongoing",
];