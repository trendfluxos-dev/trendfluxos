import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BodySchema = z.object({
  source: z.string().trim().min(2).max(80),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  metadata: z.record(z.any()).optional(),
});

async function signHmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

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
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!rateLimit(ip)) {
    return new Response(JSON.stringify({ ok: false, error: "rate_limited" }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let raw: unknown;
  try { raw = await req.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid input", details: parsed.error.flatten() }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const body = parsed.data;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ ok: false, error: "Server not configured" }), {
      status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: inserted, error: insertErr } = await supabase
    .from("access_requests")
    .insert({
      source: body.source,
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone?.trim() || null,
      message: body.message?.trim() || null,
      metadata: body.metadata ?? {},
    })
    .select("id, source, name, email")
    .single();

  if (insertErr || !inserted) {
    console.error("access-request insert error", insertErr);
    return new Response(JSON.stringify({ ok: false, error: "submission_failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Fire Telegram notification (non-blocking for user response).
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");

  if (botToken && chatId) {
    try {
      const projectRef = supabaseUrl.replace(/^https?:\/\//, "").split(".")[0];
      const decisionBase = `${supabaseUrl}/functions/v1/access-decision`;
      const makeUrl = async (action: "approve" | "reject") => {
        const sig = await signHmac(`${inserted.id}:${action}`, serviceKey);
        const params = new URLSearchParams({ id: inserted.id, action, sig });
        return `${decisionBase}?${params.toString()}`;
      };
      const approveUrl = await makeUrl("approve");
      const rejectUrl = await makeUrl("reject");

      const lines = [
        `🔔 <b>New access request</b>`,
        `<b>Source:</b> ${escapeHtml(body.source)}`,
        `<b>Name:</b> ${escapeHtml(body.name)}`,
        `<b>Email:</b> ${escapeHtml(body.email)}`,
      ];
      if (body.phone) lines.push(`<b>Phone:</b> ${escapeHtml(body.phone)}`);
      if (body.message) lines.push(`<b>Message:</b> ${escapeHtml(body.message)}`);
      lines.push(`<i>id: ${inserted.id}</i>`);

      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: lines.join("\n"),
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [[
              { text: "✅ Approve", url: approveUrl },
              { text: "❌ Reject", url: rejectUrl },
            ]],
          },
        }),
      });
      const tgData = await tgRes.json().catch(() => ({} as Record<string, unknown>));
      if (!tgRes.ok || !(tgData as { ok?: boolean }).ok) {
        console.error("telegram sendMessage failed", tgRes.status, tgData);
        await supabase.from("telegram_error_logs").insert({
          function_name: "access-request",
          api_method: "sendMessage",
          http_status: tgRes.status,
          error_code: String((tgData as { error_code?: unknown }).error_code ?? ""),
          error_description: String((tgData as { description?: unknown }).description ?? ""),
          telegram_response: tgData,
          request_context: { access_request_id: inserted.id, source: body.source },
        });
      }
      // projectRef referenced to silence lint
      void projectRef;
    } catch (e) {
      console.error("telegram notify failed", e);
      await supabase.from("telegram_error_logs").insert({
        function_name: "access-request",
        api_method: "sendMessage",
        error_description: e instanceof Error ? e.message : String(e),
        request_context: { access_request_id: inserted.id, source: body.source, kind: "exception" },
      });
    }
  } else {
    console.warn("Telegram secrets missing; skipping notification");
  }

  return new Response(JSON.stringify({ ok: true, id: inserted.id }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});