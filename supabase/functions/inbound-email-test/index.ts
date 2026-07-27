// Admin-only helper for the Hostinger Agentic Mail setup checklist.
//
// Actions:
//   { action: "status" }     -> reports secret configuration + recent inbound rows
//   { action: "send-test" }  -> posts a synthetic payload to the live inbound-email
//                               webhook exactly like Hostinger would, then verifies
//                               the row landed and removes it again.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function requireAdmin(
  req: Request,
): Promise<{ ok: true; userId: string } | { ok: false; status: number; error: string }> {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return { ok: false, status: 401, error: "Missing auth token" };

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return { ok: false, status: 401, error: "Invalid session" };

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: roles } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id);
  const isAdmin = roles?.some((r: { role: string }) => r.role === "admin") ?? false;
  if (!isAdmin) return { ok: false, status: 403, error: "Admin role required" };
  return { ok: true, userId: userData.user.id };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const gate = await requireAdmin(req);
  if (!gate.ok) return json({ ok: false, error: gate.error }, gate.status);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const secret = (Deno.env.get("INBOUND_EMAIL_WEBHOOK_SECRET") ?? "").trim();
  const webhookUrl = `${supabaseUrl}/functions/v1/inbound-email`;
  const admin = createClient(supabaseUrl, serviceKey);

  let action = "status";
  try {
    const body = await req.json();
    if (body && typeof body.action === "string") action = body.action;
  } catch {
    /* default action */
  }

  const recent = async () => {
    const { data } = await admin
      .from("inbound_emails")
      .select("id, from_email, subject, status, received_at")
      .order("received_at", { ascending: false })
      .limit(5);
    return data ?? [];
  };

  if (action === "status") {
    const { count } = await admin
      .from("inbound_emails")
      .select("id", { count: "exact", head: true });
    return json({
      ok: true,
      webhook_url: webhookUrl,
      secret_configured: secret.length > 0,
      total_received: count ?? 0,
      recent: await recent(),
    });
  }

  if (action !== "send-test") return json({ ok: false, error: "unknown_action" }, 400);

  if (!secret) {
    return json({ ok: false, error: "INBOUND_EMAIL_WEBHOOK_SECRET is not configured" }, 400);
  }

  const messageId = `checklist-${crypto.randomUUID()}`;
  const steps: { name: string; ok: boolean; detail: string }[] = [];

  // 1. Unauthorized request must be rejected.
  const unauth = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ from: "probe@example.com", subject: "probe" }),
  });
  steps.push({
    name: "Rejects unauthenticated requests",
    ok: unauth.status === 401,
    detail: `HTTP ${unauth.status}`,
  });

  // 2. Authenticated Hostinger-shaped delivery.
  const payload = {
    provider: "hostinger",
    message_id: messageId,
    from: "TrendFlux Checklist <checklist@trendflux.digital>",
    to: "hello@trendflux.digital",
    subject: "Hostinger webhook test",
    text: "This is a synthetic delivery from the setup checklist.",
    html: "<p>This is a synthetic delivery from the setup checklist.</p>",
    spam_score: 0,
    attachments: [
      { filename: "sample.pdf", contentType: "application/pdf", size: 1024 },
    ],
    date: new Date().toISOString(),
  };

  const sent = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json", "x-webhook-secret": secret },
    body: JSON.stringify(payload),
  });
  const sentBody = await sent.json().catch(() => null);
  steps.push({
    name: "Accepts signed delivery (x-webhook-secret)",
    ok: sent.status === 200,
    detail: `HTTP ${sent.status}`,
  });

  // 3. Row persisted with parsed fields.
  const { data: row } = await admin
    .from("inbound_emails")
    .select("id, from_email, from_name, subject, text_body, html_body, attachments, status")
    .eq("provider_message_id", messageId)
    .maybeSingle();
  steps.push({
    name: "Row inserted and parsed",
    ok: Boolean(row && row.from_email === "checklist@trendflux.digital" && row.html_body),
    detail: row ? `subject: ${row.subject}` : "no row found",
  });

  // 4. Duplicate protection.
  const dup = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json", "x-webhook-secret": secret },
    body: JSON.stringify(payload),
  });
  const dupBody = await dup.json().catch(() => null) as { duplicate?: boolean } | null;
  steps.push({
    name: "Duplicate delivery ignored",
    ok: dup.status === 200 && dupBody?.duplicate === true,
    detail: dupBody?.duplicate ? "duplicate flagged" : `HTTP ${dup.status}`,
  });

  // Cleanup — never leave synthetic mail in the inbox.
  if (row?.id) await admin.from("inbound_emails").delete().eq("id", row.id);

  const allOk = steps.every((s) => s.ok);
  console.log("Inbound email checklist test", { allOk, messageId });

  return json({
    ok: allOk,
    webhook_url: webhookUrl,
    steps,
    response: sentBody,
    recent: await recent(),
  });
});
