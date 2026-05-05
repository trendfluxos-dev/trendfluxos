import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let id: string | null = null;
    const url = new URL(req.url);
    id = url.searchParams.get("id");

    if (!id && req.method === "POST") {
      try {
        const body = await req.json();
        if (body && typeof body.id === "string") id = body.id;
      } catch {
        // ignore
      }
    }

    if (!id || !UUID_RE.test(id)) {
      return new Response(
        JSON.stringify({ error: "Invalid id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data, error } = await supabase
      .from("marriage_inquiries")
      .select("id, name, country_code, whatsapp, dress_colors, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("get-marriage-inquiry error:", error);
      return new Response(
        JSON.stringify({ error: "Lookup failed" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ inquiry: data ?? null }),
      {
        status: data ? 200 : 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: "Unexpected error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
