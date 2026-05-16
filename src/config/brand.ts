/**
 * Single source of truth for brand identity across the app.
 * Update values here to change the brand name, tagline, hero copy, and SEO defaults globally.
 */

export const BRAND = {
  /** Primary brand wordmark (e.g. shown in nav/footer). */
  name: "TrendFlux Ecosystem",
  /** First word — typically rendered with gradient/accent. */
  nameLead: "TrendFlux",
  /** Second word — typically rendered in muted tone. */
  nameTrail: "Ecosystem",
  /** Legal/parent organization name (used in schema.org). */
  legalName: "TrendFlux",
  /** Short tagline shown under the hero / SEO title. */
  tagline: "The Growth Execution OS for Modern Operators",
  /** Long-form description used for meta description & OG tags. */
  description:
    "TrendFlux is the execution OS for AI-powered growth teams — unifying automation, performance media, CRM, and brand systems in one operating layer. Ship faster. Scale leaner.",
  /** Twitter / X handle (with @). */
  twitterHandle: "@TrendFlux",
  /** Canonical production URL. */
  url: "https://trendflux.digital",
  /** Default social/OG image (absolute path under public or full URL). */
  ogImage: "/trendflux-logo.webp",
  /** Hero copy used on the landing page. */
  hero: {
    headlineLead: "Your growth stack,",
    headlineTrail: "executed as one system.",
    subheadline:
      "TrendFlux replaces fragmented tools, agencies, and playbooks with a single execution OS — AI automation, performance media, CRM, and brand systems running in sync, measured in revenue.",
    primaryCta: "Access the Platform",
    secondaryCta: "Book a Strategy Call",
  },
} as const;

/** Convenience: full SEO title `Brand — Tagline`. */
export const BRAND_SEO_TITLE = `${BRAND.name} — ${BRAND.tagline}`;
