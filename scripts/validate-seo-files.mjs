#!/usr/bin/env node
/**
 * CI guard for public/sitemap.xml + public/robots.txt.
 *
 * Verifies:
 *   - sitemap-pages.xml is well-formed and every <loc> uses the production host
 *   - no duplicate URLs in any child sitemap
 *   - robots.txt has a `User-agent: *` block
 *   - robots.txt does NOT site-wide disallow `/`
 *   - robots.txt disallows `/dev/` and `/admin/`
 *   - robots.txt Sitemap directive points at production
 *
 * Exit code 1 on any failure so GitHub Actions blocks the PR.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "https://trendflux.digital";
const errors = [];
const warn = (m) => errors.push(m);

function readPublic(name) {
  const file = path.join(root, "public", name);
  if (!fs.existsSync(file)) {
    warn(`missing public/${name}`);
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

// --- sitemap children -------------------------------------------------
for (const name of [
  "sitemap.xml",
  "sitemap-pages.xml",
  "sitemap-case-studies.xml",
  "sitemap-research.xml",
  "sitemap-implementations.xml",
]) {
  const xml = readPublic(name);
  if (!xml) continue;
  if (!xml.includes("<?xml")) warn(`${name}: missing XML prolog`);
  const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
  const seen = new Set();
  for (const u of locs) {
    if (seen.has(u)) warn(`${name}: duplicate <loc> ${u}`);
    seen.add(u);
    if (!u.startsWith(HOST)) warn(`${name}: non-production host in ${u}`);
  }
  console.log(`✓ ${name}: ${locs.length} entries`);
}

// --- robots ------------------------------------------------------------
const robots = readPublic("robots.txt");
if (robots) {
  if (!/User-agent:\s*\*/i.test(robots)) warn("robots.txt: missing `User-agent: *` block");
  if (/^\s*Disallow:\s*\/\s*$/m.test(robots)) warn("robots.txt: blanket `Disallow: /` blocks the whole site");
  if (!/Disallow:\s*\/dev\//i.test(robots)) warn("robots.txt: should Disallow /dev/");
  if (!/Disallow:\s*\/admin\//i.test(robots)) warn("robots.txt: should Disallow /admin/");
  if (!new RegExp(`Sitemap:\\s*${HOST}/sitemap\\.xml`, "i").test(robots))
    warn(`robots.txt: Sitemap directive must point at ${HOST}/sitemap.xml`);
  console.log("✓ robots.txt validated");
}

if (errors.length) {
  console.error("\nSEO validation failed:");
  for (const e of errors) console.error("  ✗", e);
  process.exit(1);
}
console.log("\nAll SEO files valid.");