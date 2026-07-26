#!/usr/bin/env node
/**
 * Prerenders per-route <head> metadata into the built SPA.
 *
 * Runs after `vite build` (see the `postbuild` npm hook). For every route in
 * `scripts/route-seo.mjs` it writes `dist/<route>/index.html` — a byte-for-byte
 * copy of the built `dist/index.html` with title, description, canonical,
 * robots, og:* and twitter:* rewritten for that route.
 *
 * Static hosting serves the concrete file when it exists and falls back to the
 * SPA shell otherwise, so routing and hydration are unchanged; only the head a
 * non-JS crawler sees improves. `react-helmet-async` still owns the runtime
 * head for JS-executing crawlers, and the values here mirror it.
 *
 * Dependency-free so it runs in any Node 18+ CI environment.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ROUTE_SEO,
  SITE_URL,
  SITE_NAME,
  TWITTER_SITE,
  DEFAULT_OG_IMAGE,
} from "./route-seo.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const shellPath = path.join(distDir, "index.html");

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Absolute, trailing-slash-normalized canonical for a route. */
const canonicalFor = (route) => (route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`);

/** Replace <title>, or insert one right after <head> if absent. */
function setTitle(html, title) {
  const tag = `<title>${escapeHtml(title)}</title>`;
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, tag);
  }
  return html.replace(/<head[^>]*>/i, (m) => `${m}\n    ${tag}`);
}

/**
 * Replace every <meta {attr}="{key}" ...> occurrence with a single tag
 * carrying the new content. Duplicates collapse to one — the built shell
 * historically carried both an early and a late og:title.
 */
function setMeta(html, attr, key, content) {
  const pattern = new RegExp(
    `[ \\t]*<meta[^>]*\\b${attr}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>\\s*`,
    "gi",
  );
  const tag = `    <meta ${attr}="${key}" content="${escapeHtml(content)}" />\n`;
  let replaced = false;
  let out = html.replace(pattern, () => {
    if (replaced) return "";
    replaced = true;
    return tag;
  });
  if (!replaced) {
    out = out.replace(/<\/head>/i, `${tag}  </head>`);
  }
  return out;
}

/** Replace (or insert) the canonical link. */
function setCanonical(html, href) {
  const tag = `    <link rel="canonical" href="${escapeHtml(href)}" />\n`;
  if (/<link[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
    let replaced = false;
    return html.replace(/[ \t]*<link[^>]*rel=["']canonical["'][^>]*>\s*/gi, () => {
      if (replaced) return "";
      replaced = true;
      return tag;
    });
  }
  return html.replace(/<\/head>/i, `${tag}  </head>`);
}

/** Point hreflang alternates at the route itself, not the homepage. */
function setAlternates(html, href) {
  let first = true;
  return html.replace(
    /<link([^>]*)rel=["']alternate["']([^>]*)hreflang=["']([^"']+)["']([^>]*)>/gi,
    (_m, _a, _b, lang) => {
      const tag = `<link rel="alternate" hreflang="${escapeHtml(lang)}" href="${escapeHtml(href)}" />`;
      first = false;
      return tag;
    },
  );
}

function buildRouteHtml(shell, route, seo) {
  const canonical = canonicalFor(route);
  const image = seo.image ?? DEFAULT_OG_IMAGE;
  let html = shell;

  html = setTitle(html, seo.title);
  html = setMeta(html, "name", "description", seo.description);
  html = setMeta(html, "name", "robots", seo.noindex ? "noindex,nofollow" : "index,follow");
  html = setCanonical(html, canonical);
  html = setAlternates(html, canonical);

  html = setMeta(html, "property", "og:title", seo.title);
  html = setMeta(html, "property", "og:description", seo.description);
  html = setMeta(html, "property", "og:type", seo.type ?? "website");
  html = setMeta(html, "property", "og:site_name", SITE_NAME);
  html = setMeta(html, "property", "og:url", canonical);
  html = setMeta(html, "property", "og:image", image);
  html = setMeta(html, "property", "og:image:secure_url", image);

  html = setMeta(html, "name", "twitter:card", "summary_large_image");
  html = setMeta(html, "name", "twitter:site", TWITTER_SITE);
  html = setMeta(html, "name", "twitter:title", seo.title);
  html = setMeta(html, "name", "twitter:description", seo.description);
  html = setMeta(html, "name", "twitter:image", image);

  return html;
}

function main() {
  if (!fs.existsSync(shellPath)) {
    console.error(`[prerender-head] dist/index.html not found — run \`vite build\` first.`);
    process.exit(1);
  }

  const shell = fs.readFileSync(shellPath, "utf8");
  let written = 0;

  for (const [route, seo] of Object.entries(ROUTE_SEO)) {
    const html = buildRouteHtml(shell, route, seo);
    const target =
      route === "/" ? shellPath : path.join(distDir, route.replace(/^\//, ""), "index.html");

    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, html, "utf8");
    written += 1;
  }

  console.log(`[prerender-head] wrote static <head> for ${written} routes`);
}

main();
