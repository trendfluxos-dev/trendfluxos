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
  | "Press";

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
  href?: string; // internal route or external URL
  external?: boolean;
  size?: ShowcaseSize; // controls visual prominence
  accent?: "cyan" | "gold" | "violet" | "rose" | "emerald";
  videoUrl?: string; // if set, YouTube-share tab unlocks
};

export const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "kormoshikkha",
    title: "KormoShikkha — Online Edtech Platform",
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
    href: "https://kormoshikkha.trendflux.digital/",
    external: true,
    size: "lg",
    accent: "emerald",
  },
  {
    id: "trendflux-ecosystem",
    title: "TrendFlux Ecosystem",
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
  },
  {
    id: "pabna-nagarik",
    title: "Pabna Nagarik Committee",
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
    size: "lg",
    accent: "gold",
  },
  {
    id: "the-stand",
    title: "The Stand",
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
    title: "Luxe Veil",
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
    title: "Studio BrandToki",
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
    title: "TrendFlux Talent",
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
    title: "Enterprise Control Portal",
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
    title: "Advanced AI Masterclass",
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
    title: "Debate Emon",
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
  },
  {
    id: "zhemongrowth-linkedin",
    title: "@zhemongrowth — LinkedIn",
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
    title: "Justice Appeal",
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
    title: "Media Coverage Archive",
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