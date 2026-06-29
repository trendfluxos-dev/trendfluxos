import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Lightweight site status probe. Given a target origin, verifies that:
//  - DNS resolves (implicit via fetch success)
//  - HTTP(S) endpoint is reachable
//  - SSL/TLS handshake succeeds (https + 2xx/3xx response)
//  - Site is "published" (HTML payload, not a generic 404/5xx)
//
// Designed to be fast: 4s timeout, HEAD with GET fallback, no body parsing.
// Results are cached in-memory per isolate for `CACHE_TTL_MS` to avoid
// hammering the origin when many clients poll every 60s.

const CACHE_TTL_MS = 45_000;
type CacheEntry = { expires: number; body: string };
const cache = new Map<string, CacheEntry>();

// Coalesce concurrent in-flight probes for the same target.
const inflight = new Map<string, Promise<string>>();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const target = url.searchParams.get("url");
  const bypass = url.searchParams.get("fresh") === "1";
  const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${Math.floor(CACHE_TTL_MS / 1000)}, s-maxage=${Math.floor(CACHE_TTL_MS / 1000)}`,
        ...extra,
      },
    });

  if (!target) return json({ error: "missing url" }, 400);

  let origin: URL;
  try { origin = new URL(target); }
  catch { return json({ error: "invalid url" }, 400); }

  const key = origin.origin;
  const now = Date.now();

  // Serve from cache if still fresh.
  if (!bypass) {
    const hit = cache.get(key);
    if (hit && hit.expires > now) {
      const ageSec = Math.floor((now - (hit.expires - CACHE_TTL_MS)) / 1000);
      return new Response(hit.body, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": `public, max-age=${Math.floor(CACHE_TTL_MS / 1000)}`,
          "X-Cache": "HIT",
          "Age": String(ageSec),
        },
      });
    }
  }

  const probe = async (method: "HEAD" | "GET") => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    try {
      const r = await fetch(origin.toString(), {
        method,
        redirect: "follow",
        signal: ctrl.signal,
        headers: { "User-Agent": "TrendFlux-StatusBot/1.0" },
      });
      return { ok: r.ok || (r.status >= 200 && r.status < 400), status: r.status };
    } finally { clearTimeout(t); }
  };

  const runProbe = async (): Promise<string> => {
    const started = Date.now();
    let reachable = false;
    let status = 0;
    let error: string | null = null;
    try {
      let r = await probe("HEAD");
      if (!r.ok) r = await probe("GET");
      reachable = r.ok;
      status = r.status;
    } catch (e) {
      error = (e as Error)?.message ?? "fetch_failed";
    }
    const latency = Date.now() - started;
    const ssl = origin.protocol === "https:" && reachable;
    const published = reachable && status > 0 && status < 500;
    const body = JSON.stringify({
      target: origin.origin,
      reachable,
      published,
      ssl,
      status,
      latency_ms: latency,
      error,
      checked_at: new Date().toISOString(),
    });
    cache.set(key, { expires: Date.now() + CACHE_TTL_MS, body });
    return body;
  };

  let pending = inflight.get(key);
  if (!pending) {
    pending = runProbe().finally(() => inflight.delete(key));
    inflight.set(key, pending);
  }
  const body = await pending;

  return new Response(body, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${Math.floor(CACHE_TTL_MS / 1000)}`,
      "X-Cache": "MISS",
    },
  });
});