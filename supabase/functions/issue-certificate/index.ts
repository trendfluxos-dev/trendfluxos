import { createClient } from "npm:@supabase/supabase-js@2";
import { userHasRole } from "../_shared/adminCheck.ts";

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

const slugifyName = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "student";

const hashId = (input: string) => {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(h).toString(16).toUpperCase().padStart(8, "0");
  return `KS-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Require a signed-in user. Admins always pass; everyone else must hold a
  // confirmed enrollment. Without this gate, the public verifier would accept
  // forged certificates issued by anonymous callers.
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return json({ error: "Unauthorized" }, 401);
  }
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  const user = userData?.user;
  if (userErr || !user) {
    return json({ error: "Unauthorized" }, 401);
  }
  const isAdmin = await userHasRole(userClient, user.id, "admin");
  if (!isAdmin) {
    // Hardened: only admins may mint certificates. The previous non-admin
    // branch let any enrolled user issue a certificate for any arbitrary
    // student_name / course_slug, which would forge publicly-verifiable
    // credentials. Ownership-bound self-issue can be re-introduced later
    // once student_name is derived from the profile and course_slug is
    // validated against the caller's own paid enrollment.
    return json({ error: "Admin role required to issue certificates" }, 403);
  }

  let body: {
    student_name?: unknown;
    course_slug?: unknown;
    course_title?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Malformed request body." }, 400);
  }

  const name =
    typeof body.student_name === "string" ? body.student_name.trim() : "";
  const courseSlug =
    typeof body.course_slug === "string" ? body.course_slug.trim() : "";
  const courseTitle =
    typeof body.course_title === "string" ? body.course_title.trim() : "";

  if (!name || name.length > 120) {
    return json({ error: "Valid student_name (1-120 chars) is required." }, 400);
  }
  if (!courseSlug || courseSlug.length > 80) {
    return json({ error: "Valid course_slug is required." }, 400);
  }
  if (!courseTitle || courseTitle.length > 200) {
    return json({ error: "Valid course_title is required." }, 400);
  }

  const verificationId = hashId(`${slugifyName(name)}::${courseSlug}`);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error } = await supabase.from("certificates").upsert(
    {
      verification_id: verificationId,
      student_name: name,
      course_slug: courseSlug,
      course_title: courseTitle,
    },
    { onConflict: "verification_id" },
  );

  if (error) {
    console.error("issue-certificate db error", error);
    return json({ error: "Could not issue certificate." }, 500);
  }

  return json({ verification_id: verificationId });
});