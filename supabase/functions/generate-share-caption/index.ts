import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type Platform = "facebook" | "linkedin" | "youtube" | "twitter";

const PROMPTS: Record<Platform, string> = {
  facebook:
    "Write a Facebook post in Bangla mixed with light English (Banglish where natural). Tone: warm, story-driven, conversational. 3-5 short paragraphs separated by line breaks. Open with a hook line. Include 1-2 relevant emojis (not more). End with 4-6 hashtags on the last line. Keep under 1200 characters total.",
  linkedin:
    "Write a LinkedIn post in clean English. Tone: professional, founder-voice, insight-led. Structure: a 1-line hook, then 3-4 short paragraphs (1-2 sentences each), then a single closing question that invites comments. No emojis except one optional at the very top. End with 3-5 professional hashtags. Keep under 1300 characters.",
  youtube:
    "Write a YouTube video description. Structure: (1) a punchy 2-line summary at the top, (2) a short paragraph (2-3 sentences) describing what viewers will see, (3) a 'Chapters' placeholder line, (4) a 'Links' section with the URL, (5) 8-12 SEO-friendly tag-style hashtags on the last line. Mix Bangla and English naturally. Keep under 1500 characters.",
  twitter:
    "Write a single X (Twitter) post. Hard cap: 270 characters total including hashtags. Punchy hook, 1 line of context, 2-3 relevant hashtags at the end. English only. No emojis unless one strengthens the message.",
};

const FALLBACK: Record<Platform, (ctx: { title: string; summary: string; url: string; tags: string[] }) => string> = {
  facebook: ({ title, summary, url, tags }) =>
    `🚀 ${title}\n\n${summary}\n\n👉 ${url}\n\n${tags.slice(0, 5).map((t) => `#${t.replace(/\s+/g, "")}`).join(" ")}`,
  linkedin: ({ title, summary, url, tags }) =>
    `${title}\n\n${summary}\n\nRead more: ${url}\n\n${tags.slice(0, 5).map((t) => `#${t.replace(/\s+/g, "")}`).join(" ")}`,
  youtube: ({ title, summary, url, tags }) =>
    `${title}\n\n${summary}\n\nChapters:\n00:00 Intro\n\nLinks:\n${url}\n\n${tags.slice(0, 10).map((t) => `#${t.replace(/\s+/g, "")}`).join(" ")}`,
  twitter: ({ title, url, tags }) =>
    `${title} — ${url} ${tags.slice(0, 3).map((t) => `#${t.replace(/\s+/g, "")}`).join(" ")}`.slice(0, 270),
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const platform = String(body.platform ?? "").toLowerCase() as Platform;
    const title = String(body.title ?? "").slice(0, 200);
    const summary = String(body.summary ?? "").slice(0, 800);
    const url = String(body.url ?? "").slice(0, 500);
    const category = String(body.category ?? "").slice(0, 100);
    const tags: string[] = Array.isArray(body.tags)
      ? body.tags.slice(0, 8).map((t: unknown) => String(t).slice(0, 40))
      : [];

    if (!PROMPTS[platform] || !title) {
      return new Response(
        JSON.stringify({ error: "platform and title are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    const ctx = { title, summary, url, tags };
    const userMessage = [
      `Project: ${title}`,
      category ? `Category: ${category}` : null,
      summary ? `Summary: ${summary}` : null,
      tags.length ? `Tags: ${tags.join(", ")}` : null,
      url ? `URL: ${url}` : null,
      "",
      "Generate the post copy ONLY — no preamble, no quotes around it, no markdown headers. Just the post text ready to paste.",
    ]
      .filter(Boolean)
      .join("\n");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ caption: FALLBACK[platform](ctx), source: "fallback" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: PROMPTS[platform] },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!aiRes.ok) {
      return new Response(
        JSON.stringify({ caption: FALLBACK[platform](ctx), source: "fallback", status: aiRes.status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await aiRes.json();
    const caption: string =
      data?.choices?.[0]?.message?.content?.trim() || FALLBACK[platform](ctx);

    return new Response(
      JSON.stringify({ caption, source: "ai" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});