import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Pushes a Creator Studio content item to the n8n webhook (if configured),
// then marks it as queued/published. Requires the caller's JWT — we verify
// ownership/admin via RLS by using the user-scoped client.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { id?: string; mode?: "queue" | "publish" };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const id = (body.id ?? "").toString();
  const mode = body.mode === "publish" ? "publish" : "queue";
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return new Response(JSON.stringify({ error: "invalid_id" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: item, error: readErr } = await supabase
    .from("creator_content")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (readErr || !item) {
    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const webhook = Deno.env.get("N8N_WEBHOOK_URL");
  const auth = Deno.env.get("N8N_WEBHOOK_AUTH");
  let n8nResponse: unknown = null;
  let n8nOk = false;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(auth ? { Authorization: auth } : {}),
        },
        body: JSON.stringify({ kind: "creator_content", mode, item }),
      });
      n8nOk = res.ok;
      const text = await res.text();
      try { n8nResponse = JSON.parse(text); } catch { n8nResponse = text.slice(0, 1000); }
    } catch (e) {
      n8nResponse = { error: String(e) };
    }
  }

  const nextStatus = mode === "publish" ? (n8nOk || !webhook ? "published" : "failed") : "queued";
  const patch: Record<string, unknown> = {
    status: nextStatus,
    n8n_pushed: Boolean(webhook) && n8nOk,
    n8n_response: n8nResponse,
  };
  if (nextStatus === "published") patch.published_at = new Date().toISOString();

  const { data: updated, error: updErr } = await supabase
    .from("creator_content")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (updErr) {
    return new Response(JSON.stringify({ error: "update_failed", detail: updErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ ok: true, webhook_configured: Boolean(webhook), n8n_ok: n8nOk, item: updated }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});