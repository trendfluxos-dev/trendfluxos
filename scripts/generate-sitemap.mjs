#!/usr/bin/env node
/**
 * Regenerates public/sitemap.xml (a sitemap INDEX) and one child
 * sitemap per content category:
 *   - sitemap-pages.xml             core static pages
 *   - sitemap-case-studies.xml      /case-studies/:slug
 *   - sitemap-research.xml          /research/:slug
 *   - sitemap-implementations.xml   /implementations/:slug
 *
 * Why a sitemap index: it lets Google fetch each category independently
 * and rediscovers new pages faster (only the touched child changes
 * `lastmod`, so Google re-crawls just that file).
 *
 * Usage: `node scripts/generate-sitemap.mjs`
 * Runs automatically before every `vite build` via the `prebuild` hook.
 *
 * Add a new route to `staticRoutes` whenever a new public page ships.
 * Add it to `noindexRoutes` instead when the page is noindex'd
 * (those are intentionally omitted to avoid conflicting signals).
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
  "/alternatives/bloom-growth",
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
  "/justice-appeal",
  "/media-reports",
  "/share-kit",
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
function buildUrlset(paths) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (p) => `  <url>
    <loc>${SITE_URL}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreqFor(p)}</changefreq>
    <priority>${priorityFor(p)}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
}

const children = [
  { file: "sitemap-pages.xml", paths: staticRoutes },
  {
    file: "sitemap-case-studies.xml",
    paths: caseSlugs.map((s) => `/case-studies/${s}`),
  },
  {
    file: "sitemap-research.xml",
    paths: researchSlugs.map((s) => `/research/${s}`),
  },
  {
    file: "sitemap-implementations.xml",
    paths: implementationSlugs.map((s) => `/implementations/${s}`),
  },
];

const publicDir = path.join(root, "public");
let total = 0;
for (const { file, paths } of children) {
  fs.writeFileSync(path.join(publicDir, file), buildUrlset(paths));
  total += paths.length;
  console.log(`Wrote public/${file} (${paths.length} URLs)`);
}

const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${children
  .map(
    ({ file }) => `  <sitemap>
    <loc>${SITE_URL}/${file}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`,
  )
  .join("\n")}
</sitemapindex>
`;

fs.writeFileSync(path.join(publicDir, "sitemap.xml"), indexXml);
console.log(
  `Wrote public/sitemap.xml (index of ${children.length} sitemaps, ${total} URLs total)`,
);
