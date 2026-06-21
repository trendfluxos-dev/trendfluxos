/**
 * KormoShikkha course catalog — seed data for the native /edtech platform.
 * Replace with Supabase-backed `course_modules` query in Phase 2.
 */
export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";
export type CourseFormat = "Cohort" | "Self-paced" | "Live + Recorded";

export interface CourseLesson {
  n: string;
  title: string;
  duration: string;
}

export interface Course {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  category: "AI & Automation" | "Growth Operator" | "Brand & Content" | "Career Skills";
  level: CourseLevel;
  format: CourseFormat;
  durationWeeks: number;
  lessons: CourseLesson[];
  outcomes: string[];
  audience: string[];
  instructor: { name: string; role: string };
  priceBdt: number;
  earlyBirdBdt?: number;
  nextCohort?: string;
  seatsLeft?: number;
  featured?: boolean;
  accent?: "cyan" | "emerald" | "gold" | "violet" | "rose";
}

export const EDTECH_COURSES: Course[] = [
  {
    slug: "advanced-ai-masterclass",
    title: "Advanced AI Masterclass",
    tagline: "Operator-grade AI for growth teams",
    summary:
      "Cohort-based program covering prompting, agents, workflow automation and a real capstone build. Live sessions + lifetime recordings.",
    category: "AI & Automation",
    level: "Advanced",
    format: "Live + Recorded",
    durationWeeks: 6,
    lessons: [
      { n: "01", title: "AI Foundation & Prompting", duration: "60 min" },
      { n: "02", title: "Workflow Automation with n8n", duration: "90 min" },
      { n: "03", title: "CRM & Data Systems", duration: "75 min" },
      { n: "04", title: "Content Engine on Autopilot", duration: "80 min" },
      { n: "05", title: "Analytics & Growth Loops", duration: "60 min" },
      { n: "06", title: "Agents & Multi-step Reasoning", duration: "90 min" },
      { n: "07", title: "Capstone Build & Review", duration: "120 min" },
    ],
    outcomes: [
      "Ship a production AI workflow end-to-end",
      "Design prompts and agents that scale across use cases",
      "Connect Supabase, n8n and OpenAI into one growth stack",
    ],
    audience: ["Founders", "Marketing operators", "Solo agency owners"],
    instructor: { name: "Zahid Hasan Emon", role: "Founder, TrendFlux" },
    priceBdt: 9900,
    earlyBirdBdt: 6900,
    nextCohort: "Next cohort — rolling enrolment",
    seatsLeft: 18,
    featured: true,
    accent: "cyan",
  },
  {
    slug: "growth-operator-foundations",
    title: "Growth Operator Foundations",
    tagline: "From freelancer to founder-grade operator",
    summary:
      "The operating system behind TrendFlux's client delivery — CRM, content, paid media, reporting and retention as one stack.",
    category: "Growth Operator",
    level: "Intermediate",
    format: "Cohort",
    durationWeeks: 4,
    lessons: [
      { n: "01", title: "The Operator Mindset", duration: "45 min" },
      { n: "02", title: "CRM & Pipeline Hygiene", duration: "60 min" },
      { n: "03", title: "Content Cadence & Voice", duration: "60 min" },
      { n: "04", title: "Paid Media Without the Burn", duration: "75 min" },
      { n: "05", title: "Reporting Founders Actually Read", duration: "60 min" },
    ],
    outcomes: [
      "Run a 5-figure retainer without chaos",
      "Build dashboards founders trust",
      "Move from execution to operating system thinking",
    ],
    audience: ["Freelancers", "Agency operators", "In-house growth leads"],
    instructor: { name: "Zahid Hasan Emon", role: "Founder, TrendFlux" },
    priceBdt: 5900,
    earlyBirdBdt: 3900,
    nextCohort: "Next cohort — rolling enrolment",
    seatsLeft: 24,
    featured: true,
    accent: "emerald",
  },
  {
    slug: "brand-architecture-intensive",
    title: "Brand Architecture Intensive",
    tagline: "Voice, system, story — built to compound",
    summary:
      "How to design a brand that survives platform shifts. Identity, narrative POV, content engine and the design tokens behind them.",
    category: "Brand & Content",
    level: "Intermediate",
    format: "Self-paced",
    durationWeeks: 3,
    lessons: [
      { n: "01", title: "Brand POV & Narrative", duration: "60 min" },
      { n: "02", title: "Identity & Design Tokens", duration: "75 min" },
      { n: "03", title: "Content Engine Templates", duration: "60 min" },
      { n: "04", title: "Distribution Rhythm", duration: "60 min" },
    ],
    outcomes: [
      "Define a brand POV worth defending",
      "Build a repeatable weekly publishing engine",
      "Avoid generic AI-aesthetic traps",
    ],
    audience: ["Founders", "Solopreneurs", "Brand designers"],
    instructor: { name: "Zahid Hasan Emon", role: "Founder, TrendFlux" },
    priceBdt: 3900,
    earlyBirdBdt: 2400,
    nextCohort: "Available now",
    accent: "gold",
  },
  {
    slug: "career-launchpad",
    title: "Career Launchpad",
    tagline: "From student to first growth job",
    summary:
      "Career skills for Bangladeshi students entering digital, growth and AI roles. Portfolio, interviewing and first-90-days playbook.",
    category: "Career Skills",
    level: "Beginner",
    format: "Self-paced",
    durationWeeks: 3,
    lessons: [
      { n: "01", title: "Mapping the Growth Landscape", duration: "45 min" },
      { n: "02", title: "Portfolio That Lands Interviews", duration: "60 min" },
      { n: "03", title: "Interview Lab", duration: "60 min" },
      { n: "04", title: "First-90-days Playbook", duration: "45 min" },
    ],
    outcomes: [
      "A portfolio that opens recruiter doors",
      "Confidence in technical + cultural interviews",
      "A 90-day plan to deliver in your first role",
    ],
    audience: ["University students", "Career switchers"],
    instructor: { name: "KormoShikkha Faculty", role: "TrendFlux Academy" },
    priceBdt: 1900,
    earlyBirdBdt: 990,
    nextCohort: "Available now",
    accent: "violet",
  },
  {
    slug: "automation-with-n8n",
    title: "Automation with n8n",
    tagline: "Stop doing what software should",
    summary:
      "Hands-on automation: triggers, queues, Supabase syncing, Telegram alerts and the integration patterns that survive production.",
    category: "AI & Automation",
    level: "Intermediate",
    format: "Self-paced",
    durationWeeks: 2,
    lessons: [
      { n: "01", title: "n8n Mental Model", duration: "45 min" },
      { n: "02", title: "Database & Webhook Patterns", duration: "60 min" },
      { n: "03", title: "AI Steps Inside Workflows", duration: "60 min" },
      { n: "04", title: "Reliability & Observability", duration: "60 min" },
    ],
    outcomes: [
      "Ship 5+ production automations you trust",
      "Replace manual ops with reliable flows",
      "Debug failures with confidence",
    ],
    audience: ["Operators", "Engineers", "Solo founders"],
    instructor: { name: "Zahid Hasan Emon", role: "Founder, TrendFlux" },
    priceBdt: 2900,
    earlyBirdBdt: 1900,
    nextCohort: "Available now",
    accent: "cyan",
  },
  {
    slug: "content-engine-on-autopilot",
    title: "Content Engine on Autopilot",
    tagline: "AI + brand POV = compounding distribution",
    summary:
      "The exact stack TrendFlux uses to ship 100+ designs and 20+ reels per quarter — without grinding 24/7.",
    category: "Brand & Content",
    level: "Beginner",
    format: "Self-paced",
    durationWeeks: 2,
    lessons: [
      { n: "01", title: "POV before Posts", duration: "30 min" },
      { n: "02", title: "AI-assisted Drafting", duration: "60 min" },
      { n: "03", title: "Design Templates that Compound", duration: "45 min" },
      { n: "04", title: "Weekly Cadence System", duration: "45 min" },
    ],
    outcomes: [
      "A weekly publishing rhythm you actually keep",
      "Templates and prompts that ship fast",
      "Distribution loops, not one-off posts",
    ],
    audience: ["Solo founders", "Personal brands", "Content teams"],
    instructor: { name: "KormoShikkha Faculty", role: "TrendFlux Academy" },
    priceBdt: 2400,
    earlyBirdBdt: 1490,
    nextCohort: "Available now",
    accent: "rose",
  },
  {
    slug: "applied-ai-for-founders",
    title: "Applied AI for Founders",
    tagline: "AI decisions you won't regret in 12 months",
    summary:
      "A strategy-first program for founders: what to build, what to buy, what to delay. With real cost models and team patterns.",
    category: "AI & Automation",
    level: "Intermediate",
    format: "Cohort",
    durationWeeks: 3,
    lessons: [
      { n: "01", title: "AI Decision Frameworks", duration: "60 min" },
      { n: "02", title: "Build vs Buy vs Wait", duration: "60 min" },
      { n: "03", title: "Team Patterns", duration: "60 min" },
      { n: "04", title: "Cost & Risk Models", duration: "60 min" },
    ],
    outcomes: [
      "An AI roadmap your team can execute",
      "Cost models you can defend to investors",
      "Avoid the 3 most common AI overspends",
    ],
    audience: ["Founders", "Heads of product", "CTOs"],
    instructor: { name: "Zahid Hasan Emon", role: "Founder, TrendFlux" },
    priceBdt: 7900,
    earlyBirdBdt: 4900,
    nextCohort: "Next cohort — rolling enrolment",
    seatsLeft: 12,
    accent: "emerald",
  },
];

export const getCourseBySlug = (slug: string): Course | undefined =>
  EDTECH_COURSES.find((c) => c.slug === slug);

export const EDTECH_CATEGORIES = Array.from(
  new Set(EDTECH_COURSES.map((c) => c.category)),
);

export const EDTECH_LEVELS: CourseLevel[] = ["Beginner", "Intermediate", "Advanced"];