// Hardcoded Research + Implementation entries for the Showcase hub.
// Add new items by pushing to RESEARCH_ITEMS / IMPLEMENTATION_ITEMS below.

export type EntryKind = "research" | "implementation";

export type FrameworkSection = {
  heading: string;
  body: string; // plain paragraphs separated by \n\n
  bullets?: string[];
};

export type ResearchEntry = {
  slug: string;
  kind: EntryKind;
  title: string;
  subtitle?: string;
  category: string;
  publishedAt: string; // ISO date (YYYY-MM-DD)
  readingMinutes: number;
  tags: string[];
  cover?: { accent: "cyan" | "gold" | "violet" | "rose" | "emerald"; eyebrow?: string };
  excerpt: string;
  // Research-framework sections
  question: FrameworkSection;
  method: FrameworkSection;
  findings: FrameworkSection;
  implications: FrameworkSection;
  // Related links
  related?: { label: string; href: string; external?: boolean }[];
};

const r = (e: ResearchEntry): ResearchEntry => e;

export const RESEARCH_ITEMS: ResearchEntry[] = [
  r({
    slug: "civic-content-engine-bangladesh",
    kind: "research",
    title: "Civic Content Engine — How Pabna Reached 82% Organic",
    subtitle: "A 6-month study of narrative-led civic posts in Bangladesh",
    category: "Content Strategy",
    publishedAt: "2025-08-12",
    readingMinutes: 7,
    tags: ["Civic Brand", "Organic Reach", "Bangladesh", "Content Engine"],
    cover: { accent: "gold", eyebrow: "Field Study" },
    excerpt:
      "Why a structured civic content engine outperforms paid amplification — measured across 166 designs and 22 reels.",
    question: {
      heading: "Question",
      body: "Can a disciplined civic content engine — built without paid push — outperform conventional political ad spend on engagement quality and reach efficiency?",
    },
    method: {
      heading: "Method",
      body: "Tracked 166 static designs + 22 reels over 6 months for Pabna Nagarik Committee. Compared narrative-led, hierarchy-respecting posts against a control batch of generic civic announcements.",
      bullets: [
        "Weekly cohort analysis: reach, saves, shares, comment sentiment",
        "Brand-voice scorecard scored by 3 reviewers per post",
        "Reel retention curve segmented by hook archetype",
      ],
    },
    findings: {
      heading: "Findings",
      body: "Narrative-led posts produced ~3.4x the share-rate of generic ones. 82% of total reach was organic. Saves correlated more strongly with future shares than likes did.",
      bullets: [
        "4.85L+ total organic views in 6 months",
        "Top hook archetype: 'named-citizen + civic stake' (38% retention at 15s)",
        "Comment toxicity dropped 41% when posts opened with a question, not a claim",
      ],
    },
    implications: {
      heading: "Implications",
      body: "For civic brands in Bangladesh, building a small but disciplined content engine — with a single voice and a strict hook library — beats scattered paid pushes. The engine compounds; the spend doesn't.",
    },
    related: [
      { label: "Showcase: Pabna Nagarik Committee", href: "/showcase" },
      { label: "Project Lead", href: "/project-lead" },
    ],
  }),
  r({
    slug: "ai-share-routing-platform-aware",
    kind: "research",
    title: "Platform-Aware Share Routing with a Single AI Call",
    subtitle: "One source, four voices: FB · LinkedIn · X · YouTube",
    category: "AI Systems",
    publishedAt: "2025-09-02",
    readingMinutes: 5,
    tags: ["AI", "Gemini", "Share Systems", "Edge Functions"],
    cover: { accent: "cyan", eyebrow: "Engineering Note" },
    excerpt:
      "How a single edge function reshapes one canonical summary into four platform-native captions — and why fallback templates matter more than the model.",
    question: {
      heading: "Question",
      body: "Can one AI prompt reliably produce platform-native captions across four very different audiences, while staying cheap and resilient when the model fails?",
    },
    method: {
      heading: "Method",
      body: "Built a Supabase edge function calling Gemini 2.5 Flash with a platform-keyed prompt template. Each call returns one caption tuned to the target platform's tone, length, and emoji discipline. A deterministic template fallback runs if the model errors out.",
      bullets: [
        "Single endpoint: { platform, title, summary, url, tags }",
        "Per-platform tone rules baked into the system prompt",
        "Frontend ShareDialog with copy + native share-intent URLs",
      ],
    },
    findings: {
      heading: "Findings",
      body: "The single-prompt approach kept token cost low and quality stable. Most failures were transient network errors — the template fallback meant users never saw an empty editor.",
      bullets: [
        "Avg caption gen ~1.2s on Gemini Flash",
        "0 abandoned shares across staging — fallback always populated text",
        "LinkedIn captions scored highest on founder-voice review",
      ],
    },
    implications: {
      heading: "Implications",
      body: "For founder portfolios and small teams, you don't need a per-platform AI agent. One prompt + clean fallbacks + native share-intent URLs ships 90% of the value with a fraction of the complexity.",
    },
    related: [
      { label: "Showcase hub", href: "/showcase" },
      { label: "TrendFlux Ecosystem", href: "/ecosystem" },
    ],
  }),
  r({
    slug: "founder-voice-on-linkedin-bd",
    kind: "research",
    title: "Founder Voice on LinkedIn — What Actually Travels in BD",
    subtitle: "12 weeks of tracking Bangladeshi founder posts",
    category: "Audience Research",
    publishedAt: "2025-10-01",
    readingMinutes: 6,
    tags: ["LinkedIn", "Founders", "Bangladesh", "Distribution"],
    cover: { accent: "violet", eyebrow: "Audience Note" },
    excerpt:
      "Which post archetypes from Bangladeshi founders actually compound — and which look good but die in 24 hours.",
    question: {
      heading: "Question",
      body: "What distinguishes a Bangladeshi founder's LinkedIn post that compounds over 30 days from one that spikes and dies in 24 hours?",
    },
    method: {
      heading: "Method",
      body: "Sampled 120 posts from 18 founder accounts in Dhaka over 12 weeks. Logged hook type, post length, structure, and 30-day engagement curve.",
      bullets: [
        "Hook taxonomy: confession, contrarian, frame, list, story",
        "Engagement decay tracked at day 1, 7, 30",
        "Comment-to-like ratio used as 'depth' proxy",
      ],
    },
    findings: {
      heading: "Findings",
      body: "Confession and frame hooks compounded best. Pure list posts spiked then died. Posts with one concrete number in the first line outperformed those without by ~2.1x on saves.",
    },
    implications: {
      heading: "Implications",
      body: "Bangladeshi founders should lead with confession or frame, anchor with one concrete number, and write for the day-7 reader — not the day-1 scroll.",
    },
  }),
];

export const IMPLEMENTATION_ITEMS: ResearchEntry[] = [
  r({
    slug: "trendflux-ecosystem-buildout",
    kind: "implementation",
    title: "TrendFlux Ecosystem — End-to-End Build Log",
    subtitle: "From blank repo to a 12-module founder operating system",
    category: "Enterprise System",
    publishedAt: "2025-07-20",
    readingMinutes: 8,
    tags: ["Founder OS", "TrendFlux", "Implementation"],
    cover: { accent: "cyan", eyebrow: "Build Log" },
    excerpt:
      "How the TrendFlux ecosystem was built module-by-module — AI workflows, content engines, admin portals and share systems in one repo.",
    question: {
      heading: "Goal",
      body: "Ship a single repository that runs the founder's brand, intake, automation, content engine, and admin tooling — without separate SaaS stacks per function.",
    },
    method: {
      heading: "Build Method",
      body: "Lovable + React + Supabase. Module boundaries enforced by folder structure. Each module shipped behind a feature flag, then promoted to the public site.",
      bullets: [
        "12 modules: Project Lead, Showcase, Masterclass, Luxe Veil, Enterprise, etc.",
        "Shared design tokens — no per-module color drift",
        "Edge functions for AI tasks, kept stateless and fallback-safe",
      ],
    },
    findings: {
      heading: "Outcome",
      body: "Time-to-publish for a new module dropped from days to hours. Cross-module data (auth, roles, share) reused without duplication.",
      bullets: [
        "12+ modules shipped",
        "45%+ engagement growth on flagship surfaces",
        "One auth, one admin, one share system",
      ],
    },
    implications: {
      heading: "Takeaway",
      body: "A founder-grade OS does not need microservices. Disciplined module boundaries inside a single repo ship faster and stay coherent longer.",
    },
    related: [
      { label: "TrendFlux Ecosystem", href: "/ecosystem" },
      { label: "Project Lead", href: "/project-lead" },
    ],
  }),
  r({
    slug: "luxe-veil-invite-gate",
    kind: "implementation",
    title: "Luxe Veil — Invite-Only Gate & Admin Moderation",
    subtitle: "How a private concierge platform stays private",
    category: "Website",
    publishedAt: "2025-06-05",
    readingMinutes: 5,
    tags: ["Invite-only", "Auth", "Admin"],
    cover: { accent: "violet", eyebrow: "Implementation" },
    excerpt:
      "Invite codes, request queue, role-based admin — the full architecture behind the Luxe Veil gate.",
    question: {
      heading: "Goal",
      body: "Build a wedding concierge surface that is fully public-facing but only usable by approved invitees, with a clean admin queue for the founder.",
    },
    method: {
      heading: "Build Method",
      body: "Invite-code secret stored server-side; client gate component runs before any sensitive route paints. Admin panel uses RLS + has_role() to enforce access.",
      bullets: [
        "Server-side code validation, no client-side bypass",
        "Request queue table with status workflow",
        "Admin dashboard at /admin/luxe-veil with role guard",
      ],
    },
    findings: {
      heading: "Outcome",
      body: "Zero leaked URLs, clean moderation flow for the founder, fast triage of incoming requests.",
    },
    implications: {
      heading: "Takeaway",
      body: "Invite-only doesn't have to mean ugly. The gate can feel as premium as the platform behind it.",
    },
    related: [{ label: "Luxe Veil", href: "/luxe-veil" }],
  }),
  r({
    slug: "the-stand-share-cards",
    kind: "implementation",
    title: "The Stand — Shareable Quote Card Generator",
    subtitle: "Turning a long-form documentary into 1-tap shareable artifacts",
    category: "Personal Initiative",
    publishedAt: "2025-05-18",
    readingMinutes: 4,
    tags: ["Storytelling", "Share Cards", "The Stand"],
    cover: { accent: "rose", eyebrow: "Implementation" },
    excerpt:
      "How long-form testimony was decomposed into quote cards readers can share to Facebook, Instagram and X in one tap.",
    question: {
      heading: "Goal",
      body: "Make a 6,000-word documentary distributable in the feed era without compressing it into clickbait.",
    },
    method: {
      heading: "Build Method",
      body: "Picked refusal stanzas from the long-form, rendered each as a typographic card with consistent brand tokens, and shipped a /the-stand/share generator page.",
      bullets: [
        "Server-rendered OG images per quote",
        "Native share-intent URLs per platform",
        "Bengali + English typography presets",
      ],
    },
    findings: {
      heading: "Outcome",
      body: "Quote cards now do the discovery work; the long-form converts the curious reader.",
    },
    implications: {
      heading: "Takeaway",
      body: "Long-form survives in the feed era by shipping its own atomic units, not by being shortened.",
    },
    related: [
      { label: "The Stand", href: "/the-stand" },
      { label: "Share Cards", href: "/the-stand/share" },
    ],
  }),
];

export const ALL_ENTRIES = [...RESEARCH_ITEMS, ...IMPLEMENTATION_ITEMS];

export const getEntryBySlug = (slug: string): ResearchEntry | undefined =>
  ALL_ENTRIES.find((e) => e.slug === slug);