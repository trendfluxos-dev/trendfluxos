import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const ALLOWED_BUCKETS = new Set(["voice-lectures", "lesson-pdfs", "class-materials"]);
const MAX_EXPIRES = 60 * 60; // 1 hour cap

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;
  let auditUserId: string | null = null;
  let auditBucket = "";
  let auditPath = "";

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const audit = async (outcome: "granted" | "denied", reason: string) => {
    try {
      await admin.from("access_audit_logs").insert({
        user_id: auditUserId,
        action: "signed_url",
        resource_type: `bucket:${auditBucket || "unknown"}`,
        resource_id: auditPath || null,
        outcome,
        reason,
        ip,
        user_agent: userAgent,
      });
    } catch {
      // Never fail the request because logging failed.
    }
  };

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      await audit("denied", "no_auth_header");
      return json({ error: "Unauthorized" }, 401);
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claims?.claims?.sub) {
      await audit("denied", "invalid_token");
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = claims.claims.sub as string;
    auditUserId = userId;

    const body = await req.json().catch(() => null);
    const bucket = typeof body?.bucket === "string" ? body.bucket : "";
    const path = typeof body?.path === "string" ? body.path : "";
    auditBucket = bucket;
    auditPath = path;
    const expiresIn = Math.min(
      Math.max(parseInt(String(body?.expiresIn ?? 300), 10) || 300, 30),
      MAX_EXPIRES,
    );

    if (!ALLOWED_BUCKETS.has(bucket)) {
      await audit("denied", "bucket_not_allowed");
      return json({ error: "bucket not allowed" }, 400);
    }
    if (!path || path.includes("..") || path.startsWith("/")) {
      await audit("denied", "invalid_path");
      return json({ error: "invalid path" }, 400);
    }

    // Authorization
    const { data: isAdmin } = await userClient.rpc("current_user_has_role", {
      _role: "admin",
    });

    if (!isAdmin) {
      if (bucket === "voice-lectures") {
        if (!path.startsWith(`${userId}/`)) {
          await audit("denied", "not_owner");
          return json({ error: "forbidden" }, 403);
        }
      } else if (bucket === "lesson-pdfs") {
        const { data: enrolled, error: enrErr } = await userClient
          .from("module_enrollments")
          .select("id")
          .eq("user_id", userId)
          .eq("status", "confirmed")
          .limit(1)
          .maybeSingle();
        if (enrErr || !enrolled) {
          await audit("denied", "no_enrollment");
          return json({ error: "enrollment required" }, 403);
        }
      } else if (bucket === "class-materials") {
        if (!path.startsWith(`${userId}/`)) {
          await audit("denied", "not_owner");
          return json({ error: "forbidden" }, 403);
        }
      }
    }

    const { data: signed, error: signErr } = await admin.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (signErr || !signed?.signedUrl) {
      await audit("denied", `sign_error:${signErr?.message ?? "unknown"}`);
      return json({ error: signErr?.message ?? "could not sign url" }, 500);
    }

    await audit("granted", isAdmin ? "admin" : "owner_or_enrolled");
    return json({ signedUrl: signed.signedUrl, expiresIn });
  } catch (e) {
    await audit("denied", `exception:${e instanceof Error ? e.message : "unknown"}`);
    return json({ error: e instanceof Error ? e.message : "unknown error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}