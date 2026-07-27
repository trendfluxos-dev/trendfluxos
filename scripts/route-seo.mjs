/**
 * Per-route head metadata used to PRERENDER static <head> tags into
 * `dist/<route>/index.html` after `vite build`.
 *
 * Why: this project is a client-rendered SPA. `react-helmet-async` mutates
 * `document.head` only AFTER hydration, so social crawlers (Facebook,
 * LinkedIn, Slack, X, WhatsApp) — which do not execute JavaScript — always
 * saw the generic homepage title/description/og:url for every route.
 * Prerendering the head at build time makes the tags server-visible without
 * migrating the whole app to SSR.
 *
 * Keep this in sync with the `useSeo({...})` calls in `src/pages/*`.
 * The runtime Helmet tags remain the source of truth for JS-executing
 * crawlers; these static tags are the no-JS fallback and must match.
 */

import { CASE_STUDY_SEO } from "./case-study-seo.mjs";

export const SITE_URL = "https://trendflux.digital";
export const SITE_NAME = "TrendFlux Ecosystem";
export const TWITTER_SITE = "@TrendFlux";

/** Default social image — absolute URL, required by social crawlers. */
export const DEFAULT_OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/e5882995-2b9c-44a9-a705-716c60ced703";

/**
 * @typedef {{ title: string, description: string, type?: "website" | "article" | "profile", image?: string, noindex?: boolean }} RouteSeo
 * @type {Record<string, RouteSeo>}
 */
export const ROUTE_SEO = {
  "/": {
    title: "Trendflux Digital — Operator portfolio of Zahid Hasan Emon",
    description:
      "Operator portfolio of Zahid Hasan Emon — eight brands across EdTech, creative and growth, with The Stand manifesto and Algorithm Architecture case studies.",
  },
  "/ecosystem": {
    title: "The TrendFlux Ecosystem — Eight connected growth systems",
    description:
      "Explore the TrendFlux ecosystem: EdTech, creative studio, talent, media and automation layers operating as one connected growth stack.",
  },
  "/services": {
    title: "Services — Growth systems, automation & AI execution | TrendFlux",
    description:
      "Automation, CRM, paid media, creative production and analytics delivered as one managed growth system. See scopes, deliverables and engagement models.",
  },
  "/about": {
    title: "About TrendFlux — AI-native growth execution company",
    description:
      "How TrendFlux operates: an AI-native execution team building growth systems for founders and SMEs across Bangladesh and global markets.",
  },
  "/contact": {
    title: "Contact TrendFlux — Book a strategy call",
    description:
      "Talk to the TrendFlux team about automation, growth systems or a build engagement. Book a strategy call or send a project brief.",
  },
  "/explore": {
    title: "Explore TrendFlux — Search every page, system and case study",
    description:
      "Search across the full TrendFlux ecosystem: systems, case studies, research, implementations and brand properties.",
  },
  "/showcase": {
    title: "Showcase — Shipped systems and production work | TrendFlux",
    description:
      "A curated showcase of production systems shipped by TrendFlux — platforms, automations, creative engines and analytics builds.",
  },
  "/portfolio": {
    title: "Portfolio — Campaign performance and delivery proof | TrendFlux",
    description:
      "Campaign performance dashboards, technology stack and adaptability matrix behind TrendFlux delivery work.",
  },
  "/alternatives/bloom-growth": {
    title: "TrendFlux vs Bloom Growth — Growth OS comparison",
    description:
      "Compare TrendFlux's AI-native Growth Execution OS with Bloom Growth across automation, CRM, reporting and execution capacity.",
  },
  "/enterprise": {
    title: "Enterprise — AI systems and automation for organisations | TrendFlux",
    description:
      "Enterprise-grade AI agents, automation and analytics platforms built, secured and operated by TrendFlux.",
  },
  "/toolkit": {
    title: "Operator Toolkit — Templates, prompts and playbooks | TrendFlux",
    description:
      "Free operator toolkit: automation templates, AI prompts, growth playbooks and internal checklists used across TrendFlux builds.",
  },
  "/masterclass": {
    title: "Advanced AI Masterclass — AI Growth Operator | TrendFlux",
    description:
      "Operator-grade AI training: automation, content, and growth systems. Hosted on কর্মশিক্ষা TED Plus — TrendFlux's online edtech platform.",
  },
  "/course/trendflux": {
    title: "TrendFlux Course — Become an AI growth operator",
    description:
      "Hands-on training in AI automation, content systems and growth operations, taught from live production builds.",
  },
  "/project-lead": {
    title: "Book the Project Lead — Direct engagement | TrendFlux",
    description:
      "Book time directly with the TrendFlux project lead for scoping, architecture review or an execution engagement.",
  },
  "/the-stand": {
    title: "The Stand — জাতীয় দলিল | TrendFlux",
    description:
      "The Stand: a documented national manifesto and accountability record, published in Bangla and English.",
    type: "article",
  },
  "/the-stand/share": {
    title: "Share The Stand — Cards and assets | TrendFlux",
    description: "Generate and share cards from The Stand in Bangla and English.",
  },
  "/quiet-positions": {
    title: "Quiet Positions — Working notes | TrendFlux",
    description:
      "Quiet positions: working notes and stated positions on technology, media and accountability.",
    type: "article",
  },
  "/marriage": {
    title: "Marriage — A documented personal record | TrendFlux",
    description: "A documented personal record published with supporting evidence.",
    type: "article",
  },
  "/brand-open": {
    title: "Brand Open — Open brand operations | TrendFlux",
    description: "Open brand operations: transparent metrics, decisions and build logs.",
  },
  "/trendflux-talent": {
    title: "TrendFlux Talent — Apply to work with us",
    description:
      "Join TrendFlux Talent: roles across AI engineering, creative production, growth operations and media.",
  },
  "/luxe-veil": {
    title: "Luxe Veil — Invite-only brand experience | TrendFlux",
    description: "Luxe Veil: an invite-only brand experience built by TrendFlux.",
  },
  "/brandtoki": {
    title: "BrandToki — Brand storytelling system | TrendFlux",
    description: "BrandToki: the brand storytelling and content system in the TrendFlux ecosystem.",
  },
  "/stories/ai-expert-emon": {
    title: "এআই বিশেষজ্ঞ ইমন — Story | TrendFlux",
    description:
      "The story of Zahid Hasan Emon's path into AI-native operations, told with audio and documentation.",
    type: "article",
  },
  "/justice-appeal": {
    title: "Pabna Accountability Project — Appeal | TrendFlux",
    description: "Documentation and appeal for the Pabna accountability project.",
    type: "article",
    noindex: true,
  },
  "/media-reports": {
    title: "Media Reports — Press coverage | TrendFlux",
    description: "Press coverage and media reports referencing TrendFlux and its founder.",
    noindex: true,
  },
  "/share-kit": {
    title: "Share Kit — Assets for sharing | TrendFlux",
    description: "Downloadable share assets and card generators.",
    noindex: true,
  },
  "/news": {
    title: "Newsroom — নাগরিক বার্তা ২৪ feed | TrendFlux",
    description:
      "Latest reporting from নাগরিক বার্তা ২৪, aggregated live into the TrendFlux newsroom.",
  },

  // Narrative case-study pages — one entry per /case-studies/:slug.
  ...Object.fromEntries(
    Object.entries(CASE_STUDY_SEO).map(([slug, seo]) => [
      `/case-studies/${slug}`,
      { ...seo, type: "article" },
    ]),
  ),
};
