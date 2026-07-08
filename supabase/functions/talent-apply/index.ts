// Edge function: talent-apply
// Accepts a TrendFlux Talent application from the public site, persists it
// into public.talent_applications, and fires a Telegram alert to admins.
//
// Public endpoint (verify_jwt = false is set project-wide by default).
// IP-based rate limit prevents spam. PII is never logged.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ROLE_OPTIONS = [
  "Creator / Influencer",
  "Model",
  "Photographer / Videographer",
  "Brand / Business",
  "Agency",
  "Other",
] as const;

const BodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  role: z.enum(ROLE_OPTIONS),
  portfolio_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  linkedin_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  skills: z.array(z.string().trim().min(1).max(60)).max(20).optional().default([]),
  experience_years: z.number().int().min(0).max(60).optional(),
  cover_letter: z.string().trim().max(2000).optional().or(z.literal("")),
  source: z.string().trim().max(60).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Per-instance in-memory rate limit (5 req / IP / 60 min).
const rateBuckets = new Map<string, { count: number; reset: number }>();
function rateLimit(ip: string, limit = 5, windowMs = 60 * 60_000): boolean {
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

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function notifyTelegram(payload: {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  portfolio_url?: string;
  linkedin_url?: string;
}) {
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
  if (!botToken || !chatId) return;
  const lines = [
    "<b>🌟 New Talent Application</b>",
    `<b>Name:</b> ${escapeHtml(payload.name)}`,
    `<b>Role:</b> ${escapeHtml(payload.role)}`,
    `<b>Email:</b> ${escapeHtml(payload.email)}`,
  ];
  if (payload.phone) lines.push(`<b>Phone:</b> ${escapeHtml(payload.phone)}`);
  if (payload.portfolio_url) lines.push(`<b>Portfolio:</b> ${escapeHtml(payload.portfolio_url)}`);
  if (payload.linkedin_url) lines.push(`<b>LinkedIn:</b> ${escapeHtml(payload.linkedin_url)}`);
  lines.push(`\n<code>${payload.id}</code>`);
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    // Best-effort; do not fail the request if Telegram is down.
    console.error("talent-apply telegram notify failed", err);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
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
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ ok: false, error: "server_misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const d = parsed.data;
  const { data: inserted, error } = await supabase
    .from("talent_applications")
    .insert({
      name: d.name,
      email: d.email,
      phone: d.phone || null,
      role: d.role,
      portfolio_url: d.portfolio_url || null,
      linkedin_url: d.linkedin_url || null,
      skills: d.skills ?? [],
      experience_years: d.experience_years ?? null,
      cover_letter: d.cover_letter || null,
      source: d.source ?? "trendflux_talent_page",
      metadata: d.metadata ?? {},
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("talent-apply insert error", error);
    return new Response(JSON.stringify({ ok: false, error: "insert_failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log(`New talent application received · id=${inserted.id}`);

  // Fire-and-forget admin notification.
  await notifyTelegram({
    id: inserted.id,
    name: d.name,
    role: d.role,
    email: d.email,
    phone: d.phone || undefined,
    portfolio_url: d.portfolio_url || undefined,
    linkedin_url: d.linkedin_url || undefined,
  });

  return new Response(JSON.stringify({ ok: true, id: inserted.id }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});