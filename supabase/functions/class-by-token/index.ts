import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

/**
 * Public share-link resolver for live classes.
 *
 * The underlying `get_class_by_share_token` SECURITY DEFINER function bypasses
 * RLS, so it is no longer exposed on the Data API. This function is the only
 * caller: it validates the token shape server-side and returns the single
 * matching class, using the service role.
 */
const TOKEN_RE = /^[A-Za-z0-9_-]{8,128}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token.trim() : "";

    if (!TOKEN_RE.test(token)) {
      return new Response(JSON.stringify({ error: "Invalid share token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase.rpc("get_class_by_share_token", { _token: token });
    if (error) {
      console.error("get_class_by_share_token failed:", error.message);
      return new Response(JSON.stringify({ error: "Unable to resolve share link" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data: row }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("class-by-token error:", err instanceof Error ? err.message : err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
