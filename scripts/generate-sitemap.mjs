#!/usr/bin/env node
/**
 * Regenerates public/sitemap.xml.
 *
 * Usage: `node scripts/generate-sitemap.mjs`
 *
 * Source of truth for the sitemap. Runs automatically before every
 * `vite build` via the `prebuild` npm hook so deployed builds always
 * ship a sitemap that mirrors the routes in `src/App.tsx`.
 *
 * Two lists below:
 *   - `staticRoutes` — every public, indexable React-Router route
 *   - `noindexRoutes` — public routes that explicitly set
 *     <meta name="robots" content="noindex" /> via Helmet. They are
 *     INTENTIONALLY OMITTED from the sitemap to avoid sending Google
 *     conflicting signals (sitemap = please index; meta = please don't).
 *
 * Add a new route to `staticRoutes` whenever a new public page ships.
 * Add it to `noindexRoutes` instead when the page is noindex'd.
 * Kept dependency-free so it runs in any Node 18+ env.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const SITE_URL = "https://trendflux.digital";

// Mirror of caseStudies slugs in src/data/caseStudies.ts
const caseSlugs = [
  "organic-reach-485k",
  "content-engine-200",
  "global-strategy-us-uk",
  "whatsapp-lead-conversion",
  "sme-growth-architecture",
  "personal-brand-authority",
];

// Mirror of research/implementation slugs in src/data/research.ts
const researchSlugs = [
  "civic-content-engine-bangladesh",
  "ai-share-routing-platform-aware",
  "founder-voice-on-linkedin-bd",
];
const implementationSlugs = [
  "trendflux-ecosystem-buildout",
  "luxe-veil-invite-gate",
  "the-stand-share-cards",
];

// Every public, indexable route in src/App.tsx. Keep in sync.
const staticRoutes = [
  "/",
  "/ecosystem",
  "/services",
  "/about",
  "/contact",
  "/explore",
  "/showcase",
  "/portfolio",
  "/enterprise",
  "/toolkit",
  "/masterclass",
  "/course/trendflux",
  "/project-lead",
  "/the-stand",
  "/the-stand/share",
  "/quiet-positions",
  "/marriage",
  "/brand-open",
  "/trendflux-talent",
  "/luxe-veil",
  "/brandtoki",
  "/stories/ai-expert-emon",
  "/trust",
];

// Public but Helmet-marked noindex. Intentionally omitted from sitemap.
// Kept here as documentation so the omission is explicit.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noindexRoutes = [
  "/justice-appeal",
  "/media-reports",
  "/share-kit",
  // Auth-gated / admin-only routes — never indexable.
  "/auth",
  "/dashboard",
  "/admin",
];

const today = new Date().toISOString().split("T")[0];

const urls = [
  ...staticRoutes,
  ...caseSlugs.map((s) => `/case-studies/${s}`),
  ...researchSlugs.map((s) => `/research/${s}`),
  ...implementationSlugs.map((s) => `/implementations/${s}`),
];

function priorityFor(p) {
  if (p === "/") return "1.0";
  if (p === "/services" || p === "/portfolio") return "0.9";
  if (p === "/ecosystem" || p === "/about" || p === "/contact") return "0.8";
  if (p.startsWith("/case-studies/")) return "0.8";
  if (p.startsWith("/research/") || p.startsWith("/implementations/")) return "0.7";
  if (p === "/explore" || p === "/showcase") return "0.7";
  return "0.6";
}

function changefreqFor(p) {
  if (p === "/") return "weekly";
  if (p === "/showcase" || p === "/explore") return "weekly";
  return "monthly";
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((p) => {
    return `  <url>
    <loc>${SITE_URL}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreqFor(p)}</changefreq>
    <priority>${priorityFor(p)}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>
`;

const outPath = path.join(root, "public", "sitemap.xml");
fs.writeFileSync(outPath, xml);
console.log(`Wrote ${outPath} (${urls.length} URLs)`);
