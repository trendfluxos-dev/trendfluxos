// Edge function: tutor-booking-payment-decision
// Called from HMAC-signed Approve/Reject links in the admin's Telegram alert.
// On approve: flips booking to 'confirmed' and payment to 'approved'.
// On reject : flips booking to 'payment_rejected' and payment to 'rejected'.
// Notifies both parties via Telegram (best-effort).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

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
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function html(title: string, body: string, color = "#16a34a") {
  const doc = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title><style>body{font-family:system-ui,sans-serif;background:#0b0b0c;color:#f5f5f5;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px}main{max-width:480px;text-align:center;background:#141416;border:1px solid #232326;border-radius:18px;padding:32px}h1{color:${color};margin:0 0 12px;font-size:22px}p{color:#cfcfd2;line-height:1.55}</style></head><body><main><h1>${title}</h1>${body}</main></body></html>`;
  return new Response(doc, { status: 200, headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } });
}
function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const action = url.searchParams.get("action");
  const sig = url.searchParams.get("sig");
  if (!id || !action || !sig || !["approve", "reject"].includes(action)) {
    return html("Invalid link", "<p>Missing or unknown parameters.</p>", "#dc2626");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return html("Server error", "<p>Not configured.</p>", "#dc2626");

  const expected = await signHmac(`${id}:${action}`, serviceKey);
  if (!safeEqual(sig, expected)) return html("Invalid signature", "<p>This link is not valid.</p>", "#dc2626");

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data: payment, error: pErr } = await admin
    .from("booking_payments")
    .select("id, booking_id, status, amount, trx_id")
    .eq("id", id)
    .maybeSingle();
  if (pErr || !payment) return html("Not found", "<p>Payment record not found.</p>", "#dc2626");

  if (payment.status !== "submitted") {
    return html("Already decided", `<p>Current status: <b>${esc(payment.status)}</b>.</p>`, "#f59e0b");
  }

  const newPayStatus = action === "approve" ? "approved" : "rejected";
  const newBookingStatus = action === "approve" ? "confirmed" : "payment_rejected";

  await admin.from("booking_payments").update({
    status: newPayStatus,
    reviewed_at: new Date().toISOString(),
  }).eq("id", payment.id);

  await admin.from("tutor_bookings").update({
    status: newBookingStatus,
    responded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", payment.booking_id);

  // Notify Telegram group (best-effort).
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
  if (botToken && chatId) {
    const emoji = action === "approve" ? "✅" : "❌";
    const text = `${emoji} <b>Tutor booking payment ${newPayStatus.toUpperCase()}</b>\nTrxID <code>${esc(payment.trx_id)}</code> · ৳${payment.amount}\n<i>booking: ${payment.booking_id}</i>`;
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      });
    } catch (err) {
      console.error("telegram decision notify failed", err);
    }
  }

  return html(
    action === "approve" ? "Booking confirmed" : "Payment rejected",
    action === "approve"
      ? "<p>The booking is now confirmed and both parties have been updated.</p>"
      : "<p>The payment was rejected. The student can resubmit.</p>",
    action === "approve" ? "#16a34a" : "#f59e0b",
  );
});