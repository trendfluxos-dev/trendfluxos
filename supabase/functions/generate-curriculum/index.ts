import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { userHasRole } from "../_shared/adminCheck.ts";

type Body = { class_id?: string; auto?: boolean };

const SYSTEM = `You are a senior course designer for a Bangladeshi premium edtech brand (TrendFlux EdTech / কর্মশিক্ষা TED Plus). Produce a tight, teachable curriculum for a single live class. Use clear, executive English with Bengali terms where natural. Keep total session under the provided duration.`;

function buildPrompt(cls: { title: string; description?: string | null; starts_at?: string | null }) {
  return `Class title: ${cls.title}\nDescription: ${cls.description ?? "(none)"}\nStarts at: ${cls.starts_at ?? "(unscheduled)"}\n\nReturn JSON with: summary (string, <=400 chars), learning_objectives (array of 3-5 strings), outline (array of 4-6 items, each {title, minutes, talking_points: string[]}), homework (array of 2-3 strings), resources (array of 2-4 strings).`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Require authentication. Two accepted callers:
  //   1. Admin user (JWT with admin role) — manual regeneration from admin UI.
  //   2. Internal DB trigger — sends the service-role bearer from vault.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const token = authHeader.replace("Bearer ", "");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const isServiceRoleCaller = token === serviceRoleKey;
  if (!isServiceRoleCaller) {
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claimsData, error: claimsErr } = await authClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const isAdmin = await userHasRole(authClient, claimsData.claims.sub as string, "admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }

  let body: Body;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const classId = body.class_id?.toString();
  if (!classId) {
    return new Response(JSON.stringify({ error: "class_id_required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: cls, error: fetchErr } = await supabase
    .from("live_classes")
    .select("id,title,description,starts_at,curriculum")
    .eq("id", classId)
    .maybeSingle();
  if (fetchErr || !cls) {
    return new Response(JSON.stringify({ error: "class_not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  // Auto-trigger: skip if already exists
  if (body.auto && cls.curriculum) {
    return new Response(JSON.stringify({ ok: true, skipped: "already_present" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) {
    return new Response(JSON.stringify({ error: "missing_LOVABLE_API_KEY" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildPrompt(cls as any) },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!aiRes.ok) {
    const txt = await aiRes.text();
    console.error(`generate-curriculum ai_failed [${aiRes.status}]: ${txt.slice(0, 500)}`);
    return new Response(JSON.stringify({ error: "ai_failed" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const aiJson = await aiRes.json();
  let curriculum: unknown = null;
  try {
    curriculum = JSON.parse(aiJson?.choices?.[0]?.message?.content ?? "{}");
  } catch {
    return new Response(JSON.stringify({ error: "ai_invalid_json" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const { error: upErr } = await supabase
    .from("live_classes")
    .update({ curriculum, curriculum_generated_at: new Date().toISOString() })
    .eq("id", classId);
  if (upErr) {
    console.error(`generate-curriculum save_failed: ${upErr.message}`);
    return new Response(JSON.stringify({ error: "save_failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Best-effort n8n forward
  const n8nUrl = Deno.env.get("N8N_WEBHOOK_URL");
  const n8nAuth = Deno.env.get("N8N_WEBHOOK_AUTH");
  if (n8nUrl) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 5000);
      await fetch(n8nUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(n8nAuth ? { Authorization: n8nAuth } : {}) },
        body: JSON.stringify({ event: "class.curriculum.generated", class_id: classId, curriculum }),
        signal: ctrl.signal,
      });
      clearTimeout(t);
    } catch { /* ignore */ }
  }

  return new Response(JSON.stringify({ ok: true, curriculum }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
});