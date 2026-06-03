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
  tagline: "The AI-Native Growth Execution OS for Modern Brands",
  /** Long-form description used for meta description & OG tags. */
  description:
    "TrendFlux is the AI-Native Growth Execution OS — one connected system for automation, CRM orchestration, paid media, creative, and analytics. Replace fragmented tools. Reclaim 20+ manual hours weekly. Scale with transparency.",
  /** Twitter / X handle (with @). */
  twitterHandle: "@TrendFlux",
  /** Canonical production URL. */
  url: "https://trendflux.digital",
  /** Default social/OG image (absolute path under public or full URL). */
  ogImage: "/trendflux-logo.webp",
  /** Hero copy used on the landing page. */
  hero: {
    headlineLead: "Build your brand's",
    headlineTrail: "AI-Native Growth Execution OS.",
    subheadline:
      "Replace scattered marketing tools with one connected system — automation, CRM, paid media, creative, and analytics running in sync. Reclaim 20+ hours weekly and scale with transparency.",
    primaryCta: "Build My Growth OS",
    secondaryCta: "Explore the Ecosystem",
  },
} as const;


/** Convenience: full SEO title `Brand — Tagline`. */
export const BRAND_SEO_TITLE = `${BRAND.name} — ${BRAND.tagline}`;
