/**
 * Production smoke test — fetches the live homepage and verifies key markers.
 *
 * Run locally:   bun run test:smoke
 * Run in CI:     .github/workflows/smoke.yml (post-deploy + scheduled)
 *
 * Override target with SMOKE_URL=https://example.com bun run test:smoke
 */
import { describe, it, expect, beforeAll } from "vitest";

const TARGET = process.env.SMOKE_URL ?? "https://trendflux.digital";
const TIMEOUT_MS = 30_000;

let status = 0;
let html = "";
let headers: Headers;

beforeAll(async () => {
  const res = await fetch(TARGET, {
    redirect: "follow",
    headers: { "user-agent": "trendflux-smoke/1.0" },
  });
  status = res.status;
  headers = res.headers;
  html = await res.text();
}, TIMEOUT_MS);

describe(`production smoke — ${TARGET}`, () => {
  it("returns HTTP 200", () => {
    expect(status).toBe(200);
  });

  it("serves HTML", () => {
    expect(headers.get("content-type") ?? "").toMatch(/text\/html/i);
    expect(html.length).toBeGreaterThan(500);
  });

  it("has a non-default <title>", () => {
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1].trim() ?? "";
    expect(title).not.toBe("Lovable App");
    expect(title.toLowerCase()).toContain("trendflux");
  });

  it("has a meta description", () => {
    expect(html).toMatch(/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{40,}/i);
  });

  it("ships the SPA root and bundled module entry", () => {
    expect(html).toMatch(/<div[^>]+id=["']root["']/i);
    expect(html).toMatch(/<script[^>]+type=["']module["']/i);
  });

  // Note: <link rel="canonical"> is injected client-side by react-helmet-async,
  // so it isn't present in the static HTML fetched here. Verified per-route in unit tests.

  it("exposes Open Graph tags for social previews", () => {
    expect(html).toMatch(/property=["']og:title["']/i);
    expect(html).toMatch(/property=["']og:description["']/i);
  });

  it("publishes sitemap.xml", async () => {
    const r = await fetch(new URL("/sitemap.xml", TARGET));
    expect(r.status).toBe(200);
    const xml = await r.text();
    expect(xml).toMatch(/<urlset[\s\S]+<\/urlset>/);
    expect(xml).toContain("<loc>");
  }, TIMEOUT_MS);

  it("publishes robots.txt without a blanket disallow", async () => {
    const r = await fetch(new URL("/robots.txt", TARGET));
    expect(r.status).toBe(200);
    const txt = await r.text();
    expect(txt).not.toMatch(/^\s*User-agent:\s*\*\s*\n\s*Disallow:\s*\/\s*$/im);
  }, TIMEOUT_MS);

  it("/the-stand route is reachable (SPA fallback serves index.html)", async () => {
    const r = await fetch(new URL("/the-stand", TARGET));
    expect(r.status).toBe(200);
    expect((r.headers.get("content-type") ?? "")).toMatch(/text\/html/i);
  }, TIMEOUT_MS);
});
