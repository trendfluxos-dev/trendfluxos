import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

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

// SSRF guard: only these hostnames may be probed. Anything else is rejected
// before any outbound fetch. Keeps the function from being used as a blind
// proxy into private/internal networks or cloud metadata endpoints.
const ALLOWED_HOSTS = new Set<string>([
  "trendflux.digital",
  "www.trendflux.digital",
  "trendflux.space",
  "spectrum.trendflux.space",
  "trendfluxos.lovable.app",
]);

const isPrivateHost = (host: string): boolean => {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  // IPv4 literal in private/loopback/link-local ranges
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true; // link-local / metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 0) return true;
  }
  // IPv6 loopback / link-local
  if (h === "::1" || h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd")) return true;
  return false;
};

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

  // Require a signed-in user. The status banner is rendered to authenticated
  // sessions and admin dashboards only; unauthenticated probes are not a
  // supported use case and were the SSRF vector.
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return json({ error: "unauthorized" }, 401);
  }
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: userData } = await userClient.auth.getUser();
  if (!userData?.user) return json({ error: "unauthorized" }, 401);

  if (!target) return json({ error: "missing url" }, 400);

  let origin: URL;
  try { origin = new URL(target); }
  catch { return json({ error: "invalid url" }, 400); }

  // Scheme + host allowlist + private-range block. All three must pass.
  if (origin.protocol !== "http:" && origin.protocol !== "https:") {
    return json({ error: "scheme not allowed" }, 400);
  }
  const host = origin.hostname.toLowerCase();
  if (isPrivateHost(host)) {
    return json({ error: "host not allowed" }, 400);
  }
  if (!ALLOWED_HOSTS.has(host)) {
    return json({ error: "host not in allowlist" }, 400);
  }

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