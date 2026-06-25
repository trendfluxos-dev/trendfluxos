import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const ALLOWED_BUCKETS = new Set(["voice-lectures", "lesson-pdfs", "class-materials"]);
const MAX_EXPIRES = 60 * 60; // 1 hour cap

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
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
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = claims.claims.sub as string;

    const body = await req.json().catch(() => null);
    const bucket = typeof body?.bucket === "string" ? body.bucket : "";
    const path = typeof body?.path === "string" ? body.path : "";
    const expiresIn = Math.min(
      Math.max(parseInt(String(body?.expiresIn ?? 300), 10) || 300, 30),
      MAX_EXPIRES,
    );

    if (!ALLOWED_BUCKETS.has(bucket)) return json({ error: "bucket not allowed" }, 400);
    if (!path || path.includes("..") || path.startsWith("/")) {
      return json({ error: "invalid path" }, 400);
    }

    // Authorization
    const { data: isAdmin } = await userClient.rpc("current_user_has_role", {
      _role: "admin",
    });

    if (!isAdmin) {
      if (bucket === "voice-lectures") {
        // owner-scoped folder: `${userId}/...`
        if (!path.startsWith(`${userId}/`)) {
          return json({ error: "forbidden" }, 403);
        }
      } else if (bucket === "lesson-pdfs") {
        // gated by paid course enrollment
        const { data: enrolled, error: enrErr } = await userClient
          .from("module_enrollments")
          .select("id")
          .eq("user_id", userId)
          .eq("status", "confirmed")
          .limit(1)
          .maybeSingle();
        if (enrErr || !enrolled) {
          return json({ error: "enrollment required" }, 403);
        }
      } else if (bucket === "class-materials") {
        // teacher-owned only — path layout: <teacher_id>/<class_id>/<file>
        // Students reach this via the teacher minting + broadcasting a
        // signed URL inside live_state.payload.signed_url.
        if (!path.startsWith(`${userId}/`)) {
          return json({ error: "forbidden" }, 403);
        }
      }
    }

    // Mint signed URL with service role (bypasses storage RLS after our checks)
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: signed, error: signErr } = await admin.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (signErr || !signed?.signedUrl) {
      return json({ error: signErr?.message ?? "could not sign url" }, 500);
    }

    return json({ signedUrl: signed.signedUrl, expiresIn });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "unknown error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}