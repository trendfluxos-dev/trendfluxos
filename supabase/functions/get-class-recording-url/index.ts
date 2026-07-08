// Signed-URL issuer for class-recordings bucket. Two entry modes:
//   { token } → public link (anyone)
//   { recording_id } + Authorization → entitled student / owner
// Logs every access to access_audit_logs.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: { token?: string; recording_id?: string; expires_in?: number };
  try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const expires = Math.min(Math.max(body.expires_in ?? 3600, 60), 60 * 60 * 12);

  // --- Public token path (no auth) ---
  if (body.token) {
    const { data: row } = await admin
      .from("class_recordings")
      .select("id, storage_path, visibility, public_token, mime_type, title, duration_sec")
      .eq("public_token", body.token)
      .eq("visibility", "public")
      .maybeSingle();
    if (!row) {
      await admin.from("access_audit_logs").insert({
        action: "get_recording_url", resource_type: "class_recording",
        resource_id: null, outcome: "denied", reason: "invalid_token",
      });
      return json({ error: "not_found" }, 404);
    }
    const { data: signed, error } = await admin.storage
      .from("class-recordings").createSignedUrl(row.storage_path, expires);
    if (error || !signed) return json({ error: "sign_failed" }, 500);
    await admin.from("access_audit_logs").insert({
      action: "get_recording_url", resource_type: "class_recording",
      resource_id: row.id, outcome: "granted", reason: "public_token",
    });
    return json({
      url: signed.signedUrl, mime_type: row.mime_type,
      title: row.title, duration_sec: row.duration_sec,
    });
  }

  // --- Authenticated path ---
  if (!body.recording_id) return json({ error: "missing_args" }, 400);
  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "auth_required" }, 401);
  const user = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: auth } },
  });
  const { data: { user: u } } = await user.auth.getUser();
  if (!u) return json({ error: "auth_required" }, 401);

  const { data: row } = await admin
    .from("class_recordings")
    .select("id, class_id, teacher_id, storage_path, visibility, mime_type, title, duration_sec")
    .eq("id", body.recording_id)
    .maybeSingle();
  if (!row) return json({ error: "not_found" }, 404);

  let allowed = false;
  let reason = "";
  if (row.teacher_id === u.id) { allowed = true; reason = "owner"; }
  if (!allowed) {
    const { isAdmin: adminHelper } = await import("../_shared/adminCheck.ts");
    const isAdmin = await adminHelper(user, u.id);
    if (isAdmin) { allowed = true; reason = "admin"; }
  }
  if (!allowed && row.visibility !== "private" && row.class_id) {
    const { data: rsvp } = await admin
      .from("live_class_rsvps")
      .select("id").eq("class_id", row.class_id).eq("user_id", u.id).maybeSingle();
    if (rsvp) { allowed = true; reason = "attendee"; }
  }

  if (!allowed) {
    await admin.from("access_audit_logs").insert({
      user_id: u.id, action: "get_recording_url", resource_type: "class_recording",
      resource_id: row.id, outcome: "denied", reason: "not_entitled",
    });
    return json({ error: "forbidden" }, 403);
  }

  const { data: signed, error } = await admin.storage
    .from("class-recordings").createSignedUrl(row.storage_path, expires);
  if (error || !signed) return json({ error: "sign_failed" }, 500);

  await admin.from("access_audit_logs").insert({
    user_id: u.id, action: "get_recording_url", resource_type: "class_recording",
    resource_id: row.id, outcome: "granted", reason,
  });
  return json({
    url: signed.signedUrl, mime_type: row.mime_type,
    title: row.title, duration_sec: row.duration_sec,
  });
});