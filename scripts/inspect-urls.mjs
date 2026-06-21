#!/usr/bin/env node
// Runs Google Search Console URL Inspection against key pages and reports
// which are failing, delayed, or not indexed.
//
// Usage:
//   LOVABLE_API_KEY=... GOOGLE_SEARCH_CONSOLE_API_KEY=... \
//     node scripts/inspect-urls.mjs [siteUrl]
//
// siteUrl defaults to the verified domain property "sc-domain:trendflux.digital".

const SITE_URL = process.argv[2] || "sc-domain:trendflux.digital";
const BASE = "https://www.trendflux.digital";

const PATHS = [
  "/",
  "/services",
  "/portfolio",
  "/about",
  "/contact",
  "/brands",
];

const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
const GSC_KEY = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;
if (!LOVABLE_API_KEY || !GSC_KEY) {
  console.error("Missing LOVABLE_API_KEY or GOOGLE_SEARCH_CONSOLE_API_KEY env var.");
  process.exit(2);
}

const GATEWAY =
  "https://connector-gateway.lovable.dev/google_search_console/v1/urlInspection/index:inspect";

async function inspect(path) {
  const inspectionUrl = path.startsWith("http") ? path : `${BASE}${path}`;
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GSC_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inspectionUrl, siteUrl: SITE_URL }),
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { raw: text }; }
  return { path: inspectionUrl, status: res.status, body };
}

function summarize({ path, status, body }) {
  if (status !== 200) {
    return { path, ok: false, verdict: `HTTP_${status}`, detail: body?.error?.message || body?.raw };
  }
  const idx = body.inspectionResult?.indexStatusResult ?? {};
  const verdict = idx.verdict || "UNKNOWN"; // PASS | PARTIAL | FAIL | NEUTRAL
  const coverage = idx.coverageState || "—";
  const lastCrawl = idx.lastCrawlTime || "never";
  const ok = verdict === "PASS";
  return { path, ok, verdict, coverage, lastCrawl, indexingState: idx.indexingState, robotsTxtState: idx.robotsTxtState };
}

const results = await Promise.all(PATHS.map(inspect));
const rows = results.map(summarize);

console.log(`URL Inspection report for ${SITE_URL}`);
console.log("─".repeat(80));
for (const r of rows) {
  console.log(`${r.ok ? "✅" : "⚠️ "} ${r.verdict.padEnd(8)} ${r.path}`);
  if (r.coverage) console.log(`    coverage: ${r.coverage}  lastCrawl: ${r.lastCrawl}`);
  if (!r.ok && r.detail) console.log(`    detail:   ${r.detail}`);
}

const failing = rows.filter((r) => !r.ok);
const delayed = rows.filter((r) => r.ok && r.lastCrawl === "never");
console.log("─".repeat(80));
console.log(`Total: ${rows.length}  Passing: ${rows.length - failing.length}  Failing: ${failing.length}  Never-crawled: ${delayed.length}`);

process.exit(failing.length > 0 ? 1 : 0);