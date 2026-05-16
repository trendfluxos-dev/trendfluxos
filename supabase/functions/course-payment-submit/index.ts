import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BodySchema = z.object({
  module_index: z.number().int().min(1).max(8),
  bkash_trx_id: z.string().trim().min(4).max(40),
  sender_phone: z.string().trim().min(6).max(20),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

async function signHmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !serviceKey || !anonKey) return json({ ok: false, error: "Server not configured" }, 503);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ ok: false, error: "Unauthorized" }, 401);

  // Verify user via anon client
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error: claimErr } = await userClient.auth.getClaims(token);
  if (claimErr || !claims?.claims?.sub) return json({ ok: false, error: "Unauthorized" }, 401);
  const userId = claims.claims.sub as string;
  const userEmail = (claims.claims.email as string | undefined) ?? "";

  let raw: unknown;
  try { raw = await req.json(); } catch { return json({ ok: false, error: "Invalid JSON" }, 400); }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) return json({ ok: false, error: "Invalid input", details: parsed.error.flatten() }, 400);
  const body = parsed.data;

  const admin = createClient(supabaseUrl, serviceKey);

  // Sequential gate: if module > 1, require module-1 to be 'paid'.
  if (body.module_index > 1) {
    const { data: prev } = await admin
      .from("module_enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("module_index", body.module_index - 1)
      .eq("status", "paid")
      .maybeSingle();
    if (!prev) return json({ ok: false, error: `Module ${body.module_index - 1} আগে complete (paid) হতে হবে।` }, 403);
  }

  // Block duplicate pending/paid for same module
  const { data: existing } = await admin
    .from("module_enrollments")
    .select("id, status")
    .eq("user_id", userId)
    .eq("module_index", body.module_index)
    .in("status", ["pending", "paid"])
    .maybeSingle();
  if (existing) {
    return json({ ok: false, error: existing.status === "paid"
      ? "এই module আগে থেকেই unlock করা।"
      : "এই module-এর জন্য একটি pending submission আছে — admin approval-এর অপেক্ষায়।" }, 409);
  }

  const { data: inserted, error: insErr } = await admin
    .from("module_enrollments")
    .insert({
      user_id: userId,
      module_index: body.module_index,
      status: "pending",
      amount_bdt: 2000,
      bkash_trx_id: body.bkash_trx_id.trim().toUpperCase(),
      sender_phone: body.sender_phone.trim(),
      submission_note: body.note?.trim() || null,
    })
    .select("id")
    .single();
  if (insErr || !inserted) return json({ ok: false, error: insErr?.message || "Insert failed" }, 500);

  // Telegram notification with Approve/Reject buttons
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const telegramKey = Deno.env.get("TELEGRAM_API_KEY");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
  if (lovableKey && telegramKey && chatId) {
    try {
      const decisionBase = `${supabaseUrl}/functions/v1/course-payment-decision`;
      const makeUrl = async (action: "approve" | "reject") => {
        const sig = await signHmac(`${inserted.id}:${action}`, serviceKey);
        const params = new URLSearchParams({ id: inserted.id, action, sig });
        return `${decisionBase}?${params.toString()}`;
      };
      const approveUrl = await makeUrl("approve");
      const rejectUrl = await makeUrl("reject");

      // Enrichment: module title, user profile, sequential context
      const [{ data: mod }, { data: profile }, { data: paidRows }] = await Promise.all([
        admin.from("course_modules")
          .select("title")
          .eq("module_index", body.module_index)
          .maybeSingle(),
        admin.from("profiles")
          .select("full_name, phone")
          .eq("user_id", userId)
          .maybeSingle(),
        admin.from("module_enrollments")
          .select("module_index")
          .eq("user_id", userId)
          .eq("status", "paid"),
      ]);

      const paidIdx = (paidRows ?? []).map((r) => r.module_index).sort((a, b) => a - b);
      const paidList = paidIdx.length ? paidIdx.join(", ") : "—";
      const moduleTitle = mod?.title ?? `Module ${body.module_index}`;
      const trxId = body.bkash_trx_id.trim().toUpperCase();

      const sequentialLine =
        body.module_index === 1
          ? `✅ <b>Sequential check:</b> Module 1 — কোনো prerequisite নেই`
          : `✅ <b>Sequential check:</b> Module ${body.module_index - 1} আগেই <b>paid</b> — gate পাস`;

      const lines = [
        `💸 <b>New course payment submission</b>`,
        ``,
        `📚 <b>Module ${body.module_index} / 8</b> — ${esc(moduleTitle)}`,
        sequentialLine,
        `🗂️ <b>Already paid modules:</b> ${esc(paidList)}`,
        ``,
        `👤 <b>User</b>`,
        `  • Name: ${esc(profile?.full_name || "—")}`,
        `  • Email: ${esc(userEmail || "—")}`,
        `  • Profile phone: ${esc(profile?.phone || "—")}`,
        ``,
        `💳 <b>bKash payment details</b>`,
        `  • TrxID: <code>${esc(trxId)}</code>`,
        `  • Sender number: <code>${esc(body.sender_phone)}</code>`,
        `  • Amount: ৳2,000`,
        `  • Receive number: <code>01756004037</code> (Send Money)`,
      ];
      if (body.note) lines.push(``, `📝 <b>User note:</b> ${esc(body.note)}`);
      lines.push(
        ``,
        `⏳ <b>Action required:</b> bKash app/SMS-এ TrxID <code>${esc(trxId)}</code> verify করে নিচের button-এ tap করুন।`,
        `<i>submission id: ${inserted.id}</i>`,
      );

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
    } catch (e) {
      console.error("telegram notify failed", e);
    }
  }

  return json({ ok: true, id: inserted.id });
});