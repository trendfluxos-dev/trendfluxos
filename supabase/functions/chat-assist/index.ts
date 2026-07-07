// Public visitor chat assistant for TrendFlux. Streams responses from
// Lovable AI Gateway via SSE. In-memory per-IP rate limit to avoid abuse.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60_000;
const buckets = new Map<string, { count: number; reset: number }>();
function rateLimit(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.reset) {
    buckets.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return true;
  }
  if (b.count >= RATE_LIMIT) return false;
  b.count++;
  return true;
}

import { KNOWLEDGE_BASE } from "./knowledge.ts";

const SYSTEM_PROMPT = `You are the TrendFlux Ecosystem Assistant — a concise, warm concierge for visitors of trendflux.digital.

About TrendFlux (founder: Zahid Hasan Emon):
- A vertically integrated portfolio of 8 brands across EdTech, Creative, Commerce, Legal, and Infrastructure.
- Featured brands: Kormoshikkha (EdTech), BrandToki (creative studio), LuxeVeil (luxury commerce), TrendFlux Space (infra), plus Marriage/Justice/The Stand initiatives.
- Operator positioning: "Building the Next-Gen Operator Ecosystem." $8.4M+ managed, 99.98% uptime, founded 2019.

## Answering rules

- Ground EVERY answer in the KNOWLEDGE BASE below (services, case studies, FAQs). Do not invent metrics, clients, timelines, or capabilities that are not stated there.
- When a visitor asks about capabilities/results/process, cite the most relevant case study or service by name and link it as a markdown link, e.g. [WhatsApp Lead Conversion System](/showcase/whatsapp-lead-conversion).
- When a visitor asks about pricing, partnerships, enterprise, or "how do we start", direct them to book a call at [/project-lead](/project-lead).
- Proactively invite the visitor to book a free strategy call at [/project-lead](/project-lead) whenever they show buying intent (asking about pricing, timelines, working together, "next steps", "how do we start", specific use cases, or after 2+ substantive exchanges). Phrase it as an offer, not a hard sell — e.g. "Want to walk through this on a 20-min strategy call? You can grab a slot here: [/project-lead](/project-lead)."
- If the KNOWLEDGE BASE does not cover the question, say so briefly and offer to connect them via [/contact](/contact) or [/project-lead](/project-lead) — never fabricate specifics.
- Keep replies short (2–5 sentences or a tight bullet list). Plain-spoken, no hype. Use markdown for links and bullets.
- If the question is outside TrendFlux scope, answer briefly and steer back to how TrendFlux can help.

---

${KNOWLEDGE_BASE}`;

type Msg = { role: "user" | "assistant" | "system"; content: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!rateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: "rate_limited" }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "AI is not configured on the server." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let body: { messages?: Msg[] } = {};
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
  const cleaned: Msg[] = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));

  if (cleaned.length === 0) {
    return new Response(
      JSON.stringify({ error: "No messages provided." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      stream: true,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...cleaned],
    }),
  });

  if (upstream.status === 429) {
    return new Response(
      JSON.stringify({ error: "The assistant is temporarily rate limited. Please try again in a moment." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  if (upstream.status === 402) {
    return new Response(
      JSON.stringify({ error: "The assistant is temporarily unavailable (AI credits exhausted)." }),
      { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => "");
    return new Response(
      JSON.stringify({ error: "Assistant error", detail: errText.slice(0, 300) }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(upstream.body, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});