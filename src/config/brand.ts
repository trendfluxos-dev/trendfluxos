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
  tagline: "AI-Powered Digital Growth Systems",
  /** Long-form description used for meta description & OG tags. */
  description:
    "TrendFlux Ecosystem architects scalable growth systems combining AI automation, paid media, content strategy, CRM workflows and brand architecture.",
  /** Twitter / X handle (with @). */
  twitterHandle: "@TrendFlux",
  /** Canonical production URL. */
  url: "https://trendfluxdigital.lovable.app",
  /** Default social/OG image (absolute path under public or full URL). */
  ogImage: "/trendflux-logo.png",
  /** Hero copy used on the landing page. */
  hero: {
    headlineLead: "Digital Transformation",
    headlineTrail: "& Growth Operations",
    subheadline:
      "We engineer resilient growth engines for ambitious brands — pairing performance media, automation, and ecosystem design into one cinematic operating system.",
    primaryCta: "Launch Growth System",
    secondaryCta: "Book Strategic Consultation",
  },
} as const;

/** Convenience: full SEO title `Brand — Tagline`. */
export const BRAND_SEO_TITLE = `${BRAND.name} — ${BRAND.tagline}`;
