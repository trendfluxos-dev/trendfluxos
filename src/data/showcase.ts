export type ShowcaseCategory =
  | "Client Project"
  | "Social Platform"
  | "Website"
  | "Enterprise System"
  | "Personal Initiative"
  | "Media Coverage";

export type ShowcaseSize = "sm" | "md" | "lg";

export type ShowcaseItem = {
  id: string;
  title: string;
  category: ShowcaseCategory;
  year: string;
  summary: string;
  metrics?: { label: string; value: string }[];
  tags?: string[];
  href?: string; // internal route or external URL
  external?: boolean;
  size?: ShowcaseSize; // controls visual prominence
  accent?: "cyan" | "gold" | "violet" | "rose" | "emerald";
  videoUrl?: string; // if set, YouTube-share tab unlocks
};

export const SHOWCASE_ITEMS: ShowcaseItem[] = [
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