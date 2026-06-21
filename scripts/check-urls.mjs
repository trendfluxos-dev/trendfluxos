#!/usr/bin/env node
// Usage: node scripts/check-urls.mjs [baseUrl]
// Defaults to https://www.trendflux.digital
// Reports any URL that doesn't return 200.

const BASE = process.argv[2] || process.env.SITE_URL || "https://www.trendflux.digital";

const STATIC_PATHS = [
  "/", "/ecosystem", "/services", "/about", "/contact", "/explore",
  "/project-lead", "/showcase", "/auth", "/dashboard",
  "/admin", "/admin/luxe-veil", "/admin/conversions", "/admin/enterprise-demos",
  "/admin/course-enrollments", "/admin/uptime", "/admin/errors",
  "/admin/web-vitals", "/admin/ga4-check", "/admin/secrets-health",
  "/marriage", "/the-stand", "/the-stand/share", "/quiet-positions",
  "/brand-open", "/trendflux-talent", "/luxe-veil", "/brandtoki",
  "/portfolio", "/enterprise", "/toolkit", "/course/trendflux",
  "/masterclass", "/justice-appeal", "/media-reports", "/share-kit",
  "/stories/ai-expert-emon", "/trust", "/settings",
];

// Sample dynamic routes — extend as needed.
const DYNAMIC_PATHS = [
  "/case-studies/sample",
  "/research/sample",
  "/implementations/sample",
  "/press/sample",
];

const PATHS = [...STATIC_PATHS, ...DYNAMIC_PATHS];

async function check(path) {
  const url = new URL(path, BASE).toString();
  const started = Date.now();
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": "url-check/1.0" } });
    return { path, url, status: res.status, ok: res.status === 200, ms: Date.now() - started };
  } catch (err) {
    return { path, url, status: 0, ok: false, ms: Date.now() - started, error: String(err) };
  }
}

const results = await Promise.all(PATHS.map(check));

const pad = (s, n) => String(s).padEnd(n);
console.log(`\nURL check against ${BASE}\n`);
console.log(pad("STATUS", 7), pad("MS", 6), "PATH");
console.log("-".repeat(60));
for (const r of results.sort((a, b) => a.path.localeCompare(b.path))) {
  const mark = r.ok ? "✓" : "✗";
  console.log(pad(`${mark} ${r.status}`, 7), pad(r.ms, 6), r.path, r.error ? `  ${r.error}` : "");
}

const broken = results.filter((r) => !r.ok);
console.log(`\n${results.length - broken.length}/${results.length} OK · ${broken.length} broken\n`);
if (broken.length) {
  console.log("Broken URLs:");
  for (const r of broken) console.log(`  ${r.status}  ${r.url}`);
  process.exit(1);
}