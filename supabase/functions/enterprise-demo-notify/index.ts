// Edge function: enterprise-demo-notify
// Validates payload, inserts a row into public.enterprise_demo_requests
// using the service role, and returns { ok, id }.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TEAM_SIZES = ["1-10", "11-50", "51-200", "200+"] as const;

const BodySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  company: z.string().trim().min(2).max(150),
  role: z.string().trim().min(2).max(80),
  team_size: z.enum(TEAM_SIZES),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  source: z.string().trim().max(60).optional(),
});

// Per-instance in-memory rate limit (5 req / IP / 10 min).
const rateBuckets = new Map<string, { count: number; reset: number }>();
function rateLimit(ip: string, limit = 5, windowMs = 10 * 60_000): boolean {
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!rateLimit(ip)) {
    return new Response(JSON.stringify({ ok: false, error: "rate_limited" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "validation_failed",
        issues: parsed.error.flatten().fieldErrors,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({ ok: false, error: "server_misconfigured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("enterprise_demo_requests")
    .insert({
      name: parsed.data.name,
      email: parsed.data.email,
      company: parsed.data.company,
      role: parsed.data.role,
      team_size: parsed.data.team_size,
      message: parsed.data.message || null,
      source: parsed.data.source ?? "enterprise_page",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("enterprise-demo-notify insert error", error);
    return new Response(
      JSON.stringify({ ok: false, error: "insert_failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Best-effort admin notification log (Lovable Emails wiring can be added later).
  console.log(
    `New enterprise demo request: ${parsed.data.email} · ${parsed.data.company} · id=${data.id}`,
  );

  return new Response(JSON.stringify({ ok: true, id: data.id }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
