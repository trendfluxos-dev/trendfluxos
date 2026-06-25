import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

/**
 * Teacher-only AI helper for the live studio side panel.
 * Presets: explain / examples / quiz / summary / answer.
 * Output is rendered locally to the teacher — never broadcast.
 */

const PRESETS: Record<string, string> = {
  explain:
    "You are a senior Bangla/English tutor. Explain the concept below clearly and concisely (max 200 words). Use plain language and short paragraphs.",
  examples:
    "Give 3 concrete, varied real-world examples (numbered) for the concept below. Keep each under 3 sentences.",
  quiz:
    "Create 3 quick multiple-choice quiz questions about the topic below. Each with 4 options A-D and the correct answer marked with **(correct)**.",
  summary:
    "Write a tight 5-bullet summary of the topic below for a live class slide. Each bullet ≤ 12 words.",
  answer:
    "Answer the student question below as if speaking out loud in a live class. Keep it under 150 words.",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const preset = typeof body.preset === "string" ? body.preset : "explain";
    const input = typeof body.input === "string" ? body.input.trim() : "";

    if (!input) {
      return new Response(JSON.stringify({ error: "input is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = PRESETS[preset] ?? PRESETS.explain;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": apiKey,
        "Content-Type": "application/json",
        "X-Lovable-AIG-SDK": "edge-fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: input },
        ],
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      return new Response(
        JSON.stringify({ error: `gateway_${r.status}`, detail: txt.slice(0, 500) }),
        { status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "internal", detail: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});