// Periodically scan growth_leads for due follow-ups and push them to n8n.
// Designed to be called by pg_cron or a scheduler. Auth: admin user OR
// x-n8n-secret header so internal schedulers can call it without a session.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

async function notifyRoleFailure(detail: string, userId?: string) {
  try {
    await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/alert-postgres-error`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        message: `role_check_failed:lead-followup-sweeper — ${detail}`,
        pathname: "/functions/v1/lead-followup-sweeper",
        user_id: userId ?? null,
        release: "edge",
      }),
    });
  } catch (_) { /* best-effort */ }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const secret = Deno.env.get("N8N_CALLBACK_SECRET");
  const got = req.headers.get("x-n8n-secret");
  const authorized = secret && got && got === secret;

  if (!authorized) {
    // Fall back to admin session check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const client = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await client.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin, error: roleErr } = await client.rpc(
      "current_user_has_role",
      { _role: "admin" },
    );
    if (roleErr || !isAdmin) {
      if (roleErr) await notifyRoleFailure(roleErr.message, userData.user.id);
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const nowIso = new Date().toISOString();
  const { data: dueLeads, error } = await supabase
    .from("growth_leads")
    .select("*")
    .lte("next_followup_at", nowIso)
    .not("lifecycle_status", "in", "(won,lost)")
    .order("next_followup_at", { ascending: true })
    .limit(50);

  if (error) {
    return new Response(JSON.stringify({ error: "query_failed", detail: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const n8nUrl = Deno.env.get("N8N_WEBHOOK_URL");
  const n8nAuth = Deno.env.get("N8N_WEBHOOK_AUTH");
  const results: Array<{ id: string; ok: boolean; status?: number; error?: string }> = [];

  for (const lead of dueLeads ?? []) {
    if (!n8nUrl) {
      results.push({ id: lead.id, ok: false, error: "no_n8n_webhook" });
      continue;
    }
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(n8nUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(n8nAuth ? { Authorization: n8nAuth } : {}),
        },
        body: JSON.stringify({ event: "growth_os.lead.followup_due", lead }),
        signal: ctrl.signal,
      });
      clearTimeout(t);
      results.push({ id: lead.id, ok: res.ok, status: res.status });
      // Clear next_followup_at so we don't re-fire; n8n callback will set the next one.
      await supabase
        .from("growth_leads")
        .update({ next_followup_at: null })
        .eq("id", lead.id);
    } catch (err) {
      results.push({ id: lead.id, ok: false, error: (err as Error).message });
    }
  }

  return new Response(JSON.stringify({ ok: true, processed: results.length, results }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});