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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
    return new Response(JSON.stringify({ ok: false, error: insertErr?.message || "Insert failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Fire Telegram notification (non-blocking for user response).
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const telegramKey = Deno.env.get("TELEGRAM_API_KEY");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");

  if (lovableKey && telegramKey && chatId) {
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

      await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": telegramKey,
          "Content-Type": "application/json",
        },
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
      // projectRef referenced to silence lint
      void projectRef;
    } catch (e) {
      console.error("telegram notify failed", e);
    }
  } else {
    console.warn("Telegram secrets missing; skipping notification");
  }

  return new Response(JSON.stringify({ ok: true, id: inserted.id }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});