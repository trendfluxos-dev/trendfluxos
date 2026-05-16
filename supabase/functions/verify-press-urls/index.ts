import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_URLS = 50;

// Block private / link-local / loopback ranges to prevent SSRF.
function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal")) return true;
  // IPv6 loopback / link-local / unique-local
  if (h === "::1" || h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd")) return true;
  // IPv4
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [parseInt(m[1]), parseInt(m[2])];
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local / AWS metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a >= 224) return true; // multicast / reserved
  }
  return false;
}

async function getAllowedHosts(): Promise<Set<string>> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return new Set();
  const client = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data } = await client.from("press_items").select("href");
  const hosts = new Set<string>();
  for (const row of data ?? []) {
    try {
      hosts.add(new URL((row as { href: string }).href).hostname.toLowerCase());
    } catch { /* skip */ }
  }
  return hosts;
}

async function check(url: string): Promise<{ url: string; status: number; ok: boolean; reachable: boolean }> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: ctrl.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,bn;q=0.8",
      },
    });
    clearTimeout(t);
    // 403 from many BD news sites is bot-block, not broken — treat as reachable.
    const reachable = res.status < 500 && res.status !== 404 && res.status !== 410;
    return { url, status: res.status, ok: res.ok, reachable };
  } catch (_e) {
    return { url, status: 0, ok: false, reachable: false };
  }
}

// Simple in-memory rate limit (per cold-start instance).
const rateBuckets = new Map<string, { count: number; reset: number }>();
function rateLimit(ip: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = rateBuckets.get(ip);
  if (!b || now > b.reset) {
    rateBuckets.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    // Require an authenticated caller — this endpoint is admin-only.
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!supabaseUrl || !anonKey || !serviceKey || !jwt) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false },
    });
    const { data: userData } = await authClient.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    if (!rateLimit(ip, 10, 60_000)) {
      return new Response(JSON.stringify({ error: "rate_limited" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { urls } = await req.json();
    if (!Array.isArray(urls)) {
      return new Response(JSON.stringify({ error: "urls must be an array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (urls.length > MAX_URLS) {
      return new Response(JSON.stringify({ error: `too many urls (max ${MAX_URLS})` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allowed = await getAllowedHosts();
    const safeUrls: string[] = [];
    const rejected: Array<{ url: string; reason: string }> = [];
    for (const raw of urls) {
      const u = String(raw ?? "");
      let parsed: URL;
      try {
        parsed = new URL(u);
      } catch {
        rejected.push({ url: u, reason: "invalid_url" });
        continue;
      }
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        rejected.push({ url: u, reason: "bad_scheme" });
        continue;
      }
      const host = parsed.hostname.toLowerCase();
      if (isBlockedHost(host)) {
        rejected.push({ url: u, reason: "blocked_host" });
        continue;
      }
      if (allowed.size > 0 && !allowed.has(host)) {
        rejected.push({ url: u, reason: "host_not_allowlisted" });
        continue;
      }
      safeUrls.push(u);
    }

    // Run in parallel chunks of 6 to be polite.
    const results: Awaited<ReturnType<typeof check>>[] = [];
    const chunkSize = 6;
    for (let i = 0; i < safeUrls.length; i += chunkSize) {
      const chunk = safeUrls.slice(i, i + chunkSize);
      const part = await Promise.all(chunk.map((u: string) => check(u)));
      results.push(...part);
    }
    return new Response(JSON.stringify({ results, rejected }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});