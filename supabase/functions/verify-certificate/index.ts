import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ID_PATTERN = /^KS-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

type VerifyStatus = "valid" | "expired" | "revoked" | "invalid";

interface VerifyResponse {
  status: VerifyStatus;
  verification_id?: string;
  student_name?: string;
  course_title?: string;
  course_slug?: string;
  issued_at?: string;
  expires_at?: string | null;
  message?: string;
}

const json = (body: VerifyResponse, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let payload: { verification_id?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ status: "invalid", message: "Malformed request body." }, 400);
  }

  const raw = typeof payload.verification_id === "string" ? payload.verification_id : "";
  const normalized = raw.trim().toUpperCase().replace(/\s+/g, "");

  if (!normalized) {
    return json({ status: "invalid", message: "Verification ID is required." }, 400);
  }

  if (!ID_PATTERN.test(normalized)) {
    return json({
      status: "invalid",
      message: "ID format should be KS-XXXX-XXXX.",
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from("certificates")
    .select(
      "verification_id, student_name, course_title, course_slug, issued_at, expires_at, revoked",
    )
    .eq("verification_id", normalized)
    .maybeSingle();

  if (error) {
    console.error("verify-certificate db error", error);
    return json({ status: "invalid", message: "Lookup failed." }, 500);
  }

  if (!data) {
    return json({
      status: "invalid",
      message: "No certificate found with that ID.",
    });
  }

  if (data.revoked) {
    return json({
      status: "revoked",
      verification_id: data.verification_id,
      message: "This certificate has been revoked by the issuing institution.",
    });
  }

  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    return json({
      status: "expired",
      verification_id: data.verification_id,
      student_name: data.student_name,
      course_title: data.course_title,
      course_slug: data.course_slug,
      issued_at: data.issued_at,
      expires_at: data.expires_at,
      message: "This certificate has expired.",
    });
  }

  return json({
    status: "valid",
    verification_id: data.verification_id,
    student_name: data.student_name,
    course_title: data.course_title,
    course_slug: data.course_slug,
    issued_at: data.issued_at,
    expires_at: data.expires_at,
  });
});