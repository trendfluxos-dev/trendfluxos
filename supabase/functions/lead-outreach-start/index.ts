// Admin-triggered: push a lead into an n8n outreach sequence.
// Admin session required. Writes lifecycle history immediately and forwards
// the lead + sequence metadata to n8n.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

async function notifyRoleFailure(fn: string, detail: string, userId?: string) {
  try {
    await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/alert-postgres-error`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        message: `role_check_failed:${fn} — ${detail}`,
        pathname: `/functions/v1/${fn}`,
        user_id: userId ?? null,
        release: "edge",
      }),
    });
  } catch (_) { /* best-effort */ }
}

type Body = {
  lead_id: string;
  sequence_name?: string;       // e.g. "cold-email-v1"
  outreach_channel?: string;    // email|linkedin|whatsapp|sms|call|other
  starts_in_minutes?: number;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const startedAt = Date.now();
  let actorId: string | null = null;
  let leadId: string | null = null;

  const logRun = async (
    admin: ReturnType<typeof createClient> | null,
    status: "success" | "failure",
    extras: Record<string, unknown>,
  ) => {
    try {
      const client = admin ?? createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      await client.from("outreach_execution_logs").insert({
        function_name: "lead-outreach-start",
        status,
        triggered_by: "admin",
        actor_id: actorId,
        lead_id: leadId,
        processed_count: status === "success" ? 1 : 0,
        success_count: status === "success" ? 1 : 0,
        failure_count: status === "failure" ? 1 : 0,
        duration_ms: Date.now() - startedAt,
        ...extras,
      });
    } catch (_) { /* best-effort */ }
  };

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: userData } = await userClient.auth.getUser();
  if (!userData?.user) {
    await logRun(null, "failure", { http_status: 401, error: "unauthorized" });
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  actorId = userData.user.id;
  const { data: isAdmin, error: roleErr } = await userClient.rpc(
    "current_user_has_role",
    { _role: "admin" },
  );
  if (roleErr || !isAdmin) {
    if (roleErr) {
      await notifyRoleFailure("lead-outreach-start", roleErr.message, userData.user.id);
    }
    await logRun(null, "failure", { http_status: 403, error: roleErr?.message ?? "forbidden" });
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: Body;
  try { body = await req.json(); } catch {
    await logRun(null, "failure", { http_status: 400, error: "invalid_json" });
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!body.lead_id) {
    await logRun(null, "failure", { http_status: 400, error: "lead_id_required" });
    return new Response(JSON.stringify({ error: "lead_id_required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  leadId = body.lead_id;

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: lead, error } = await admin
    .from("growth_leads").select("*").eq("id", body.lead_id).maybeSingle();
  if (error || !lead) {
    await logRun(admin, "failure", { http_status: 404, error: "lead_not_found" });
    return new Response(JSON.stringify({ error: "lead_not_found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const now = new Date();
  const nextAt = new Date(now.getTime() + (body.starts_in_minutes ?? 0) * 60_000).toISOString();
  const sequenceName = body.sequence_name ?? "cold-email-v1";
  const channel = body.outreach_channel ?? "email";

  const history = Array.isArray(lead.lifecycle_history) ? lead.lifecycle_history : [];
  history.push({
    at: now.toISOString(),
    event: "sequence_started",
    lifecycle_status: "prospected",
    sequence_name: sequenceName,
    sequence_step: 0,
    channel,
    note: `Started by ${userData.user.email ?? userData.user.id}`,
  });

  await admin.from("growth_leads").update({
    lifecycle_status: "prospected",
    sequence_name: sequenceName,
    sequence_step: 0,
    outreach_channel: channel,
    next_followup_at: nextAt,
    lifecycle_history: history,
  }).eq("id", lead.id);

  const n8nUrl = Deno.env.get("N8N_WEBHOOK_URL");
  const n8nAuth = Deno.env.get("N8N_WEBHOOK_AUTH");
  let forwarded = false;
  let response: unknown = null;

  if (n8nUrl) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(n8nUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(n8nAuth ? { Authorization: n8nAuth } : {}),
        },
        body: JSON.stringify({
          event: "growth_os.lead.outreach_start",
          lead,
          sequence_name: sequenceName,
          channel,
          starts_at: nextAt,
        }),
        signal: ctrl.signal,
      });
      clearTimeout(t);
      forwarded = res.ok;
      const text = await res.text();
      try { response = JSON.parse(text); } catch { response = { status: res.status, body: text.slice(0, 500) }; }
    } catch (err) {
      response = { error: (err as Error).message };
    }
  }

  await logRun(admin, "success", {
    http_status: 200,
    metadata: {
      sequence_name: sequenceName,
      channel,
      next_followup_at: nextAt,
      n8n_forwarded: forwarded,
    },
  });

  return new Response(JSON.stringify({ ok: true, forwarded, response, next_followup_at: nextAt }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});