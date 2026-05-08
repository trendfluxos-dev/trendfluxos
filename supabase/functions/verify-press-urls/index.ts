import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function check(url: string): Promise<{ url: string; status: number; ok: boolean; reachable: boolean }> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,bn;q=0.8",
      },
    });
    clearTimeout(t);
    // 403 from many BD news sites is bot-block, not broken — treat as reachable.
    const reachable = res.status < 500 && res.status !== 404 && res.status !== 410;
    return { url, status: res.status, ok: res.ok, reachable };
  } catch (_e) {
    return { url, status: 0, ok: false, reachable: false };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { urls } = await req.json();
    if (!Array.isArray(urls)) {
      return new Response(JSON.stringify({ error: "urls must be an array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Run in parallel chunks of 6 to be polite.
    const results: Awaited<ReturnType<typeof check>>[] = [];
    const chunkSize = 6;
    for (let i = 0; i < urls.length; i += chunkSize) {
      const chunk = urls.slice(i, i + chunkSize);
      const part = await Promise.all(chunk.map((u: string) => check(u)));
      results.push(...part);
    }
    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});