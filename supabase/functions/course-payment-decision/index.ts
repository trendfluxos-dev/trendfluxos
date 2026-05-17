import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

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

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function html(title: string, body: string, color = "#16a34a"): Response {
  const doc = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title><style>body{font-family:system-ui,sans-serif;background:#0b0b0c;color:#f5f5f5;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px}main{max-width:480px;text-align:center;background:#141416;border:1px solid #232326;border-radius:18px;padding:32px}h1{color:${color};margin:0 0 12px;font-size:22px}p{color:#cfcfd2;line-height:1.55}</style></head><body><main><h1>${title}</h1>${body}</main></body></html>`;
  return new Response(doc, { status: 200, headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } });
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function telegramSend(
  text: string,
  supabase: ReturnType<typeof createClient>,
  context: Record<string, unknown>,
) {
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
  if (!botToken || !chatId) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    const data = await res.json().catch(() => ({} as Record<string, unknown>));
    if (!res.ok || !(data as { ok?: boolean }).ok) {
      console.error("telegram confirm failed", res.status, data);
      await supabase.from("telegram_error_logs").insert({
        function_name: "course-payment-decision",
        api_method: "sendMessage",
        http_status: res.status,
        error_code: String((data as { error_code?: unknown }).error_code ?? ""),
        error_description: String((data as { description?: unknown }).description ?? ""),
        telegram_response: data,
        request_context: context,
      });
    }
  } catch (e) {
    console.error("telegram confirm failed", e);
    await supabase.from("telegram_error_logs").insert({
      function_name: "course-payment-decision",
      api_method: "sendMessage",
      error_description: e instanceof Error ? e.message : String(e),
      request_context: { ...context, kind: "exception" },
    });
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  const action = url.searchParams.get("action") ?? "";
  const sig = url.searchParams.get("sig") ?? "";

  if (!id || !["approve", "reject"].includes(action) || !sig) {
    return html("Invalid link", "<p>This decision link is malformed.</p>", "#ef4444");
  }

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!serviceKey || !supabaseUrl) return html("Server not configured", "<p>Missing secrets.</p>", "#ef4444");

  const expected = await signHmac(`${id}:${action}`, serviceKey);
  if (!safeEqual(sig, expected)) return html("Invalid signature", "<p>Cannot verify link.</p>", "#ef4444");

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: existing } = await supabase
    .from("module_enrollments")
    .select("id, status, module_index, user_id, bkash_trx_id, sender_phone")
    .eq("id", id)
    .maybeSingle();

  if (!existing) return html("Not found", "<p>Submission not found.</p>", "#ef4444");
  if (existing.status !== "pending") {
    return html(`Already ${existing.status}`, `<p>Module ${existing.module_index} was already <b>${existing.status}</b>.</p>`,
      existing.status === "paid" ? "#16a34a" : "#ef4444");
  }

  const newStatus = action === "approve" ? "paid" : "failed";
  const update: Record<string, unknown> = {
    status: newStatus,
    decided_at: new Date().toISOString(),
    decided_via: "telegram",
  };
  if (newStatus === "paid") update.paid_at = new Date().toISOString();

  // Atomic claim: only the first request that matches `status='pending'` wins.
  // Subsequent duplicate clicks see 0 rows and short-circuit — no duplicate
  // events, no duplicate Telegram messages.
  const { data: claimed, error } = await supabase
    .from("module_enrollments")
    .update(update)
    .eq("id", id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (error) return html("Update failed", `<p>${error.message}</p>`, "#ef4444");
  if (!claimed) {
    // Lost the race — another admin (or duplicate click) already decided this.
    const { data: fresh } = await supabase
      .from("module_enrollments")
      .select("status, module_index")
      .eq("id", id)
      .maybeSingle();
    return html(
      `Already ${fresh?.status ?? "decided"}`,
      `<p>Module ${fresh?.module_index ?? existing.module_index} was already <b>${fresh?.status ?? "decided"}</b>. No duplicate notification sent.</p>`,
      fresh?.status === "paid" ? "#16a34a" : "#ef4444",
    );
  }

  // Fetch module title + user profile for the timeline + confirmation message
  const [{ data: mod }, { data: profile }, { data: nextMod }] = await Promise.all([
    supabase.from("course_modules").select("title").eq("module_index", existing.module_index).maybeSingle(),
    supabase.from("profiles").select("full_name, email").eq("user_id", existing.user_id).maybeSingle(),
    existing.module_index < 8
      ? supabase.from("course_modules").select("title").eq("module_index", existing.module_index + 1).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const moduleTitle = mod?.title ?? `Module ${existing.module_index}`;
  const userLabel = profile?.full_name || profile?.email || existing.user_id;

  // Timeline events — partial unique indexes on enrollment_events guarantee
  // each enrollment can only have ONE approved/rejected row and each
  // (user, module) can only have ONE unlocked row. Conflict → silently skip.
  const events: Array<Record<string, unknown>> = [{
    enrollment_id: existing.id,
    user_id: existing.user_id,
    module_index: existing.module_index,
    event_type: action === "approve" ? "approved" : "rejected",
    actor: "admin",
    message: action === "approve"
      ? `Admin approved TrxID ${existing.bkash_trx_id} — module unlocked`
      : `Admin rejected TrxID ${existing.bkash_trx_id}`,
  }];
  if (action === "approve" && existing.module_index < 8) {
    events.push({
      enrollment_id: null,
      user_id: existing.user_id,
      module_index: existing.module_index + 1,
      event_type: "unlocked",
      actor: "system",
      message: `Module ${existing.module_index + 1} is now eligible for payment`,
    });
  }
  for (const ev of events) {
    const { error: evErr } = await supabase.from("enrollment_events").insert(ev);
    if (evErr && !/duplicate key|unique/i.test(evErr.message)) {
      console.error("enrollment_event insert failed", evErr);
    }
  }

  // Telegram confirmation message back to admin
  if (action === "approve") {
    const nextLine = existing.module_index < 8 && nextMod?.title
      ? `🔓 <b>Next unlocked:</b> Module ${existing.module_index + 1} — ${esc(nextMod.title)}`
      : `🏁 <b>Course complete!</b> All 8 modules paid for this user.`;
    await telegramSend([
      `✅ <b>Payment APPROVED</b>`,
      ``,
      `📚 Module ${existing.module_index} — ${esc(moduleTitle)}`,
      `👤 ${esc(String(userLabel))}`,
      `💳 TrxID <code>${esc(existing.bkash_trx_id ?? "")}</code> from <code>${esc(existing.sender_phone ?? "")}</code>`,
      `💰 ৳2,000 confirmed`,
      ``,
      nextLine,
      `<i>Student dashboard auto-updated · timeline logged</i>`,
    ].join("\n"), supabase, { enrollment_id: existing.id, user_id: existing.user_id, module_index: existing.module_index, action: "approve" });
  } else {
    await telegramSend([
      `❌ <b>Payment REJECTED</b>`,
      ``,
      `📚 Module ${existing.module_index} — ${esc(moduleTitle)}`,
      `👤 ${esc(String(userLabel))}`,
      `💳 TrxID <code>${esc(existing.bkash_trx_id ?? "")}</code> from <code>${esc(existing.sender_phone ?? "")}</code>`,
      ``,
      `🔒 Module ${existing.module_index + 1 > 8 ? 8 : existing.module_index + 1} remains locked. User can retry submission.`,
    ].join("\n"), supabase, { enrollment_id: existing.id, user_id: existing.user_id, module_index: existing.module_index, action: "reject" });
  }

  const verb = newStatus === "paid" ? "Approved ✅" : "Rejected ❌";
  const color = newStatus === "paid" ? "#16a34a" : "#ef4444";
  const nextNote = newStatus === "paid" && existing.module_index < 8
    ? `<p style="color:#8a8a90;font-size:13px;margin-top:18px">Module ${existing.module_index + 1} এখন user-এর জন্য unlock — timeline log update হয়েছে।</p>`
    : "";
  return html(
    `Payment ${verb}`,
    `<p>Module <b>${esc(String(existing.module_index))}</b> · TrxID <code>${esc(existing.bkash_trx_id ?? "")}</code> — marked <b>${esc(newStatus)}</b>.</p>${nextNote}`,
    color,
  );
});