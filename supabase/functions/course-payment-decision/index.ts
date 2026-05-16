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
    .select("id, status, module_index, user_id, bkash_trx_id")
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

  const { error } = await supabase
    .from("module_enrollments")
    .update(update)
    .eq("id", id)
    .eq("status", "pending");
  if (error) return html("Update failed", `<p>${error.message}</p>`, "#ef4444");

  const verb = newStatus === "paid" ? "Approved ✅" : "Rejected ❌";
  const color = newStatus === "paid" ? "#16a34a" : "#ef4444";
  return html(
    `Payment ${verb}`,
    `<p>Module <b>${existing.module_index}</b> · TrxID <code>${existing.bkash_trx_id}</code> — marked <b>${newStatus}</b>.</p>`,
    color,
  );
});