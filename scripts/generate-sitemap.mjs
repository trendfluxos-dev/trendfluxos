#!/usr/bin/env node
/**
 * Regenerates public/sitemap.xml.
 *
 * Usage: `node scripts/generate-sitemap.mjs`
 *
 * Add case-study slugs and routes here whenever a new one ships.
 * Kept intentionally dependency-free so it runs in any Node 18+ env.
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

const staticRoutes = [
  "/",
  "/the-stand",
  "/the-stand/share",
  "/enterprise",
  "/portfolio",
  "/masterclass",
  "/course/trendflux",
  "/toolkit",
  "/project-lead",
  "/marriage",
  "/brand-open",
  "/brandtoki",
  "/trendflux-talent",
  "/luxe-veil",
];

const today = new Date().toISOString().split("T")[0];

const urls = [
  ...staticRoutes,
  ...caseSlugs.map((s) => `/case-studies/${s}`),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((p) => {
    const priority =
      p === "/" ? "1.0" : p.startsWith("/case-studies/") ? "0.8" : "0.6";
    const changefreq = p === "/" ? "weekly" : "monthly";
    return `  <url>
    <loc>${SITE_URL}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>
`;

const outPath = path.join(root, "public", "sitemap.xml");
fs.writeFileSync(outPath, xml);
console.log(`Wrote ${outPath} (${urls.length} URLs)`);
