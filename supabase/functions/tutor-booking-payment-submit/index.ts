// Edge function: tutor-booking-payment-submit
// Student submits a bKash payment for a tutor booking. Creates a
// booking_payments row, flips tutor_bookings.status to 'payment_submitted',
// and notifies admin via Telegram with signed Approve/Reject links.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BodySchema = z.object({
  booking_id: z.string().uuid(),
  method: z.enum(["bkash", "nagad", "rocket"]).default("bkash"),
  trx_id: z.string().trim().min(4).max(40),
  sender_number: z.string().trim().min(6).max(20),
  amount: z.number().positive().max(1_000_000).optional(),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
async function signHmac(payload: string, secret: string) {
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !serviceKey || !anonKey) return json({ ok: false, error: "server_misconfigured" }, 503);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ ok: false, error: "unauthorized" }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error: claimErr } = await userClient.auth.getClaims(token);
  if (claimErr || !claims?.claims?.sub) return json({ ok: false, error: "unauthorized" }, 401);
  const userId = claims.claims.sub as string;

  let raw: unknown;
  try { raw = await req.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }
  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) return json({ ok: false, error: "validation_failed", issues: parsed.error.flatten().fieldErrors }, 400);
  const body = parsed.data;

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // Load booking, verify ownership.
  const { data: booking, error: bookErr } = await admin
    .from("tutor_bookings")
    .select("id, tutor_id, student_id, subject, price, currency, status, starts_at, ends_at")
    .eq("id", body.booking_id)
    .maybeSingle();
  if (bookErr) return json({ ok: false, error: "lookup_failed" }, 500);
  if (!booking) return json({ ok: false, error: "not_found" }, 404);
  if (booking.student_id !== userId) return json({ ok: false, error: "forbidden" }, 403);
  if (!["accepted", "awaiting_payment", "payment_rejected"].includes(booking.status)) {
    return json({ ok: false, error: "invalid_state", state: booking.status }, 409);
  }

  const amount = body.amount ?? Number(booking.price ?? 0);
  const trxId = body.trx_id.trim().toUpperCase();
  const method = body.method;
  const methodLabel = method === "nagad" ? "Nagad" : method === "rocket" ? "Rocket" : "bKash";

  // Insert payment row
  const { data: payment, error: payErr } = await admin
    .from("booking_payments")
    .insert({
      booking_id: body.booking_id,
      student_id: userId,
      method,
      trx_id: trxId,
      sender_number: body.sender_number.trim(),
      amount,
      currency: booking.currency || "BDT",
      status: "submitted",
      review_notes: body.note?.trim() || null,
    })
    .select("id")
    .single();
  if (payErr || !payment) {
    console.error("booking payment insert failed", payErr);
    const dup = payErr?.code === "23505";
    return json({ ok: false, error: dup ? "duplicate_trx" : "insert_failed" }, dup ? 409 : 500);
  }

  // Advance booking status.
  await admin
    .from("tutor_bookings")
    .update({ status: "payment_submitted", updated_at: new Date().toISOString() })
    .eq("id", body.booking_id);

  // Telegram notification with Approve/Reject buttons
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
  if (botToken && chatId) {
    try {
      const decisionBase = `${supabaseUrl}/functions/v1/tutor-booking-payment-decision`;
      const makeUrl = async (action: "approve" | "reject") => {
        const sig = await signHmac(`${payment.id}:${action}`, serviceKey);
        return `${decisionBase}?${new URLSearchParams({ id: payment.id, action, sig }).toString()}`;
      };
      const [approveUrl, rejectUrl] = await Promise.all([makeUrl("approve"), makeUrl("reject")]);

      const [{ data: studentProfile }, { data: tutorProfile }] = await Promise.all([
        admin.from("profiles").select("full_name, phone, email").eq("user_id", userId).maybeSingle(),
        admin.from("profiles").select("full_name").eq("user_id", booking.tutor_id).maybeSingle(),
      ]);

      const text = [
        `💰 <b>New tutor booking payment</b>`,
        ``,
        `📚 <b>${esc(booking.subject || "Tutor session")}</b>`,
        `🗓️ ${esc(new Date(booking.starts_at).toLocaleString())}`,
        `👨‍🏫 Tutor: ${esc(tutorProfile?.full_name || booking.tutor_id)}`,
        ``,
        `👤 <b>Student</b>`,
        `  • Name: ${esc(studentProfile?.full_name || "—")}`,
        `  • Email: ${esc(studentProfile?.email || "—")}`,
        ``,
        `💳 <b>${methodLabel}</b>`,
        `  • TrxID: <code>${esc(trxId)}</code>`,
        `  • Sender: <code>${esc(body.sender_number)}</code>`,
        `  • Amount: ৳${amount.toLocaleString()}`,
        ``,
        `<i>booking: ${booking.id}</i>`,
        `<i>payment: ${payment.id}</i>`,
      ].join("\n");

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [[
              { text: "✅ Approve", url: approveUrl },
              { text: "❌ Reject", url: rejectUrl },
            ]],
          },
        }),
      });
    } catch (err) {
      console.error("tutor booking telegram notify failed", err);
    }
  }

  return json({ ok: true, id: payment.id });
});