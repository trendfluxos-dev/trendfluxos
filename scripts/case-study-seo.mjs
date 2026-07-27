/**
 * Per-case-study <head> metadata.
 *
 * Single source of truth for the STATIC (prerendered) head of every
 * `/case-studies/:slug` route. Mirrored at runtime by
 * `src/data/caseStudySeo.ts` — keep both files in sync when a case study
 * is added, renamed or removed.
 *
 * Titles stay under ~60 chars of meaningful copy before the brand suffix,
 * descriptions under 160 chars.
 */

/** @typedef {{ title: string, description: string }} CaseStudySeo */
/** @type {Record<string, CaseStudySeo>} */
export const CASE_STUDY_SEO = {
  "kormoshikkha-edtech-platform": {
    title: "কর্মশিক্ষা TED Plus EdTech Platform — Case Study | TrendFlux",
    description:
      "How TrendFlux built and operates কর্মশিক্ষা TED Plus: cohort enrollment, modular curriculum, payments and admin tooling on one owned stack.",
  },
  "organic-reach-485k": {
    title: "Scaling Organic Reach to 485K+ — Case Study | TrendFlux",
    description:
      "A reels-first content system that drove 485K+ organic video views, 80%+ organic reach and 45%+ engagement growth with zero ad spend.",
  },
  "content-engine-200": {
    title: "200+ Asset Content Engine — Case Study | TrendFlux",
    description:
      "Templates plus AI-assisted workflows turned ad-hoc content into a production engine: 200+ assets shipped with a consistent brand identity.",
  },
  "global-strategy-us-uk": {
    title: "US & UK Market Strategy — Case Study | TrendFlux",
    description:
      "Replacing a copy-pasted single-market playbook with market-aligned positioning and content for US and UK audiences.",
  },
  "whatsapp-lead-conversion": {
    title: "WhatsApp Lead Conversion Funnel — Case Study | TrendFlux",
    description:
      "An automated WhatsApp and CRM funnel that cut response time, kept inbound leads warm and lifted booked strategy calls.",
  },
  "sme-growth-architecture": {
    title: "SME Growth Architecture — Case Study | TrendFlux",
    description:
      "Turning an owner-led SME into a repeatable acquisition model: clear funnel structure, CRM integration and scalable operations.",
  },
  "personal-brand-authority": {
    title: "Personal Brand Authority System — Case Study | TrendFlux",
    description:
      "Positioning and content strategy that gave an operator a recognizable public voice, a defined niche and consistent audience growth.",
  },
};

/** All case-study slugs, in publication order. */
export const CASE_STUDY_SLUGS = Object.keys(CASE_STUDY_SEO);
