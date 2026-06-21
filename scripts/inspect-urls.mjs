#!/usr/bin/env node
// Reports Google Search Console indexing status for key pages.
//
// The Lovable connector gateway exposes the Search Console "webmasters/v3"
// surface (sitemaps + searchAnalytics) but NOT the URL Inspection API
// (urlInspection.index.inspect lives on searchconsole.googleapis.com which
// the gateway does not currently proxy). So we approximate URL Inspection
// using two signals that ARE available:
//
//   1. Sitemap submission status — confirms Google has fetched the sitemap
//      and how many of its URLs were indexed.
//   2. searchAnalytics per-page query — any URL with >0 impressions in the
//      last 28 days is confirmed indexed; URLs with 0 impressions are
//      flagged as "delayed / not yet indexed".
//
// Usage:
//   node scripts/inspect-urls.mjs [siteUrl]
// siteUrl defaults to "sc-domain:trendflux.digital".

const SITE_URL = process.argv[2] || "sc-domain:trendflux.digital";
const BASE = "https://www.trendflux.digital";
const SITEMAP = `${BASE}/sitemap.xml`;

const PAGES = [
  "/",
  "/services",
  "/portfolio",
  "/about",
  "/contact",
  "/brands",
].map((p) => `${BASE}${p}`);

const { LOVABLE_API_KEY, GOOGLE_SEARCH_CONSOLE_API_KEY: GSC_KEY } = process.env;
if (!LOVABLE_API_KEY || !GSC_KEY) {
  console.error("Missing LOVABLE_API_KEY or GOOGLE_SEARCH_CONSOLE_API_KEY env var.");
  process.exit(2);
}

const GW = "https://connector-gateway.lovable.dev/google_search_console";
const headers = {
  Authorization: `Bearer ${LOVABLE_API_KEY}`,
  "X-Connection-Api-Key": GSC_KEY,
  "Content-Type": "application/json",
};
const enc = (s) => encodeURIComponent(s);

async function gj(method, path, body) {
  const res = await fetch(`${GW}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 200)}`);
  return json;
}

function isoDaysAgo(n) {
  const d = new Date(Date.now() - n * 86400_000);
  return d.toISOString().slice(0, 10);
}

// 1. Sitemap status
let sitemap;
try {
  sitemap = await gj("GET", `/webmasters/v3/sites/${enc(SITE_URL)}/sitemaps/${enc(SITEMAP)}`);
} catch (e) {
  console.error("Sitemap fetch failed:", e.message);
}

// 2. Per-page impressions over last 28 days
const sa = await gj("POST", `/webmasters/v3/sites/${enc(SITE_URL)}/searchAnalytics/query`, {
  startDate: isoDaysAgo(28),
  endDate: isoDaysAgo(1),
  dimensions: ["page"],
  rowLimit: 25000,
});
const byPage = new Map((sa.rows || []).map((r) => [r.keys[0], r]));

console.log(`URL Inspection-style report for ${SITE_URL}`);
console.log("─".repeat(80));
if (sitemap) {
  const c = sitemap.contents?.[0] || {};
  console.log(
    `Sitemap: ${sitemap.path}\n` +
      `  lastSubmitted: ${sitemap.lastSubmitted}  pending: ${sitemap.isPending}\n` +
      `  errors: ${sitemap.errors}  warnings: ${sitemap.warnings}\n` +
      `  submitted: ${c.submitted || 0}  indexed: ${c.indexed || 0}`,
  );
  console.log("─".repeat(80));
}

const rows = PAGES.map((url) => {
  const row = byPage.get(url);
  const impressions = row?.impressions || 0;
  const clicks = row?.clicks || 0;
  let status;
  if (impressions > 0) status = "INDEXED";
  else status = "DELAYED"; // submitted but no impressions yet
  return { url, status, impressions, clicks };
});

for (const r of rows) {
  const icon = r.status === "INDEXED" ? "✅" : "⚠️ ";
  console.log(`${icon} ${r.status.padEnd(8)} ${r.url}  (impr: ${r.impressions}, clicks: ${r.clicks})`);
}

const delayed = rows.filter((r) => r.status !== "INDEXED");
console.log("─".repeat(80));
console.log(
  `Total: ${rows.length}  Indexed: ${rows.length - delayed.length}  Delayed/not-yet-indexed: ${delayed.length}`,
);
if (delayed.length) {
  console.log(
    "\nNote: 'Delayed' = no impressions in the last 28 days. The page may be\n" +
      "submitted but not yet crawled, or crawled but not yet ranking. Use the\n" +
      "Search Console UI's URL Inspection tool for the authoritative verdict\n" +
      "(the URL Inspection API is not exposed via the connector gateway).",
  );
}
process.exit(delayed.length ? 1 : 0);