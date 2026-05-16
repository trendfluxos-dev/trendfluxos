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
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
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
  const doc = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#0b0b0c;color:#f5f5f5;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px}main{max-width:480px;text-align:center;background:#141416;border:1px solid #232326;border-radius:18px;padding:32px}h1{color:${color};margin:0 0 12px;font-size:22px}p{color:#cfcfd2;line-height:1.55}</style></head><body><main><h1>${title}</h1>${body}</main></body></html>`;
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
  if (!serviceKey || !supabaseUrl) {
    return html("Server not configured", "<p>Missing server secrets.</p>", "#ef4444");
  }

  const expected = await signHmac(`${id}:${action}`, serviceKey);
  if (!safeEqual(sig, expected)) {
    return html("Invalid signature", "<p>This link cannot be verified.</p>", "#ef4444");
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // Idempotent: only update if still pending.
  const newStatus = action === "approve" ? "approved" : "rejected";
  const { data: existing } = await supabase
    .from("access_requests").select("id, status, name, email, source").eq("id", id).maybeSingle();

  if (!existing) return html("Not found", "<p>Request not found.</p>", "#ef4444");
  if (existing.status !== "pending") {
    return html(
      `Already ${existing.status}`,
      `<p>Request for <b>${existing.email}</b> was already <b>${existing.status}</b>.</p>`,
      existing.status === "approved" ? "#16a34a" : "#ef4444",
    );
  }

  const { error } = await supabase
    .from("access_requests")
    .update({
      status: newStatus,
      decided_at: new Date().toISOString(),
      decided_via: "telegram",
    })
    .eq("id", id)
    .eq("status", "pending");

  if (error) return html("Update failed", `<p>${error.message}</p>`, "#ef4444");

  const color = newStatus === "approved" ? "#16a34a" : "#ef4444";
  const verb = newStatus === "approved" ? "Approved ✅" : "Rejected ❌";
  return html(
    `Access ${verb}`,
    `<p>Request for <b>${existing.email}</b> (source: <i>${existing.source}</i>) has been <b>${newStatus}</b>.</p><p style="color:#8a8a90;font-size:13px;margin-top:18px">You can now contact the visitor manually.</p>`,
    color,
  );
});