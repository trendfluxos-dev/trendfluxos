#!/usr/bin/env node
/**
 * Redirect & SPA verification.
 *
 * Verifies, for the production domain:
 *   1. http://apex            → 301/308 https://(apex|www)
 *   2. http://www             → 301/308 https://(apex|www)
 *   3. apex ↔ www canonical redirect (whichever is primary returns 200)
 *   4. SPA deep links return 200 + serve the React shell (index.html fallback)
 *   5. /sitemap.xml and /robots.txt are reachable
 *
 * Usage:
 *   node scripts/verify-redirects.mjs
 *   DOMAIN=trendflux.digital PRIMARY=apex DEEP_LINKS=/edtech,/marriage \
 *     node scripts/verify-redirects.mjs
 *
 * Env:
 *   DOMAIN        apex domain to test (default trendflux.digital)
 *   PRIMARY       "apex" | "www" — which one is the canonical primary (default apex)
 *   DEEP_LINKS    comma-separated paths (default /edtech,/marriage,/portfolio,/brands,/the-stand)
 *
 * Exits non-zero if any check fails. Writes /tmp/redirect-verify.{json,md}.
 */
import { writeFileSync } from "node:fs";

const DOMAIN = process.env.DOMAIN || "trendflux.digital";
const PRIMARY = (process.env.PRIMARY || "apex").toLowerCase();
const APEX = DOMAIN;
const WWW = `www.${DOMAIN}`;
const PRIMARY_HOST = PRIMARY === "www" ? WWW : APEX;
const SECONDARY_HOST = PRIMARY === "www" ? APEX : WWW;
const DEEP_LINKS = (process.env.DEEP_LINKS
  ? process.env.DEEP_LINKS.split(",")
  : ["/edtech", "/marriage", "/portfolio", "/brands", "/the-stand"]
).map((s) => s.trim()).filter(Boolean);

const TIMEOUT_MS = 10000;

const probe = async (url, { method = "GET", followRedirects = false } = {}) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method,
      redirect: followRedirects ? "follow" : "manual",
      signal: ctrl.signal,
      headers: { "user-agent": "TrendFlux-RedirectVerifier/1.0" },
    });
    const body = method === "GET" && followRedirects ? await res.text() : "";
    return {
      url,
      status: res.status,
      location: res.headers.get("location"),
      finalUrl: res.url,
      contentType: res.headers.get("content-type"),
      latencyMs: Date.now() - started,
      body,
    };
  } catch (err) {
    return { url, error: err.message, latencyMs: Date.now() - started };
  } finally {
    clearTimeout(t);
  }
};

const results = [];
const record = (name, pass, detail) => {
  results.push({ name, pass, detail });
  const tag = pass ? "✅" : "❌";
  console.log(`${tag} ${name} — ${detail}`);
};

const isHttpsRedirect = (r, allowedHosts) => {
  if (!r || r.error) return false;
  if (![301, 302, 307, 308].includes(r.status)) return false;
  if (!r.location) return false;
  try {
    const u = new URL(r.location, r.url);
    return u.protocol === "https:" && allowedHosts.includes(u.hostname);
  } catch { return false; }
};

const isPrimaryRedirect = (r) => {
  if (!r || r.error) return false;
  if (![301, 302, 307, 308].includes(r.status)) return false;
  if (!r.location) return false;
  try {
    const u = new URL(r.location, r.url);
    return u.protocol === "https:" && u.hostname === PRIMARY_HOST;
  } catch { return false; }
};

(async () => {
  console.log(`🔎 Verifying ${DOMAIN} (primary=${PRIMARY_HOST})\n`);

  // 1. http → https for apex
  const httpApex = await probe(`http://${APEX}/`);
  record(
    "http://apex → https",
    isHttpsRedirect(httpApex, [APEX, WWW]),
    httpApex.error ? `error: ${httpApex.error}` : `${httpApex.status} → ${httpApex.location || "(no location)"}`,
  );

  // 2. http → https for www
  const httpWww = await probe(`http://${WWW}/`);
  record(
    "http://www → https",
    isHttpsRedirect(httpWww, [APEX, WWW]),
    httpWww.error ? `error: ${httpWww.error}` : `${httpWww.status} → ${httpWww.location || "(no location)"}`,
  );

  // 3. secondary canonical redirect to primary (https)
  const httpsSecondary = await probe(`https://${SECONDARY_HOST}/`);
  record(
    `https://${SECONDARY_HOST} → https://${PRIMARY_HOST}`,
    isPrimaryRedirect(httpsSecondary) || httpsSecondary.status === 200, // some hosts serve both; warn only if neither
    httpsSecondary.error
      ? `error: ${httpsSecondary.error}`
      : `${httpsSecondary.status}${httpsSecondary.location ? ` → ${httpsSecondary.location}` : ""}`,
  );
  if (httpsSecondary.status === 200 && PRIMARY_HOST !== SECONDARY_HOST) {
    console.log(`   ⚠️  ${SECONDARY_HOST} serves 200 directly — consider a 301 to ${PRIMARY_HOST} for SEO canonicalisation.`);
  }

  // 4. primary apex 200
  const primaryRoot = await probe(`https://${PRIMARY_HOST}/`, { followRedirects: true });
  record(
    `https://${PRIMARY_HOST}/ returns 200`,
    primaryRoot.status === 200,
    primaryRoot.error ? `error: ${primaryRoot.error}` : `${primaryRoot.status} ${primaryRoot.contentType || ""} (${primaryRoot.latencyMs}ms)`,
  );

  // 5. SPA deep links: 200 + same React shell as root
  const rootMarker = primaryRoot.body && primaryRoot.body.match(/<div\s+id=["']root["']/i);
  for (const path of DEEP_LINKS) {
    const r = await probe(`https://${PRIMARY_HOST}${path}`, { followRedirects: true });
    const ok =
      r.status === 200 &&
      (r.contentType || "").includes("text/html") &&
      /<div\s+id=["']root["']/i.test(r.body || "");
    record(
      `SPA deep link ${path}`,
      ok,
      r.error
        ? `error: ${r.error}`
        : `${r.status} ${r.contentType || ""} hasReactRoot=${/<div\s+id=["']root["']/i.test(r.body || "")}`,
    );
    if (rootMarker && r.body && !r.body.includes(rootMarker[0])) {
      console.log(`   ⚠️  ${path} HTML shell differs from / — SPA fallback may be returning a custom page.`);
    }
  }

  // 6. sitemap & robots
  const sitemap = await probe(`https://${PRIMARY_HOST}/sitemap.xml`, { followRedirects: true });
  record(
    "/sitemap.xml reachable",
    sitemap.status === 200 && (sitemap.contentType || "").match(/xml/i),
    sitemap.error ? `error: ${sitemap.error}` : `${sitemap.status} ${sitemap.contentType || ""}`,
  );
  const robots = await probe(`https://${PRIMARY_HOST}/robots.txt`, { followRedirects: true });
  record(
    "/robots.txt reachable",
    robots.status === 200,
    robots.error ? `error: ${robots.error}` : `${robots.status} ${robots.contentType || ""}`,
  );

  // Report
  const fails = results.filter((r) => !r.pass);
  const report = { domain: DOMAIN, primary: PRIMARY_HOST, deepLinks: DEEP_LINKS, results, fails: fails.length };
  writeFileSync("/tmp/redirect-verify.json", JSON.stringify(report, null, 2));

  const md = [
    `# Redirect & SPA verification — ${DOMAIN}`,
    "",
    `Primary: \`${PRIMARY_HOST}\` · Run: ${new Date().toISOString()}`,
    "",
    "| Check | Result | Detail |",
    "|---|---|---|",
    ...results.map((r) => `| ${r.name} | ${r.pass ? "✅" : "❌"} | ${String(r.detail).replace(/\|/g, "\\|")} |`),
  ].join("\n");
  writeFileSync("/tmp/redirect-verify.md", md);

  console.log(`\nReport: /tmp/redirect-verify.md  (json: /tmp/redirect-verify.json)`);
  if (fails.length) {
    console.error(`\n❌ ${fails.length}/${results.length} checks failed.`);
    process.exit(1);
  }
  console.log(`\n✅ All ${results.length} checks passed.`);
})();