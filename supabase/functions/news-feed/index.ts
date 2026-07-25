import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

/**
 * Public read-only news relay for Nagarik Barta 24 (Bangla news partner).
 *
 * The browser cannot fetch the publisher directly (no CORS headers), so this
 * function pulls the site's RSS feed server-side, normalises it to JSON and
 * caches the result in memory for 10 minutes to stay well inside the
 * publisher's rate limits.
 */

const FEEDS = [
  "https://nagarikbarta24.com/feed/",
  "https://nagarikbarta24.com/?feed=rss2",
];
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_ITEMS = 24;

type NewsItem = {
  title: string;
  link: string;
  publishedAt: string | null;
  excerpt: string;
  image: string | null;
  categories: string[];
};

let cache: { at: number; items: NewsItem[] } | null = null;

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extra },
  });

const decode = (input: string): string =>
  input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#8217;/g, "’")
    .replace(/\s+/g, " ")
    .trim();

const pick = (block: string, tag: string): string => {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? decode(m[1]) : "";
};

const firstImage = (block: string): string | null => {
  const enclosure = block.match(/<enclosure[^>]+url="([^"]+)"/i);
  if (enclosure) return enclosure[1];
  const media = block.match(/<media:(?:content|thumbnail)[^>]+url="([^"]+)"/i);
  if (media) return media[1];
  const inline = block.match(/<img[^>]+src=["']([^"']+)["']/i);
  return inline ? inline[1] : null;
};

const parseFeed = (xml: string): NewsItem[] => {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  return blocks.slice(0, MAX_ITEMS).flatMap((block) => {
    const title = pick(block, "title");
    const link = pick(block, "link");
    if (!title || !link) return [];
    const pub = pick(block, "pubDate");
    const parsed = pub ? new Date(pub) : null;
    const description = pick(block, "description") || pick(block, "content:encoded");
    const categories = (block.match(/<category[^>]*>([\s\S]*?)<\/category>/gi) ?? [])
      .map((c) => decode(c.replace(/<\/?category[^>]*>/gi, "")))
      .filter(Boolean)
      .slice(0, 4);
    return [{
      title,
      link,
      publishedAt: parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : null,
      excerpt: description.slice(0, 320),
      image: firstImage(block),
      categories,
    }];
  });
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const fresh = cache && Date.now() - cache.at < CACHE_TTL_MS;
  if (fresh) {
    return json(
      { source: "nagarikbarta24.com", cached: true, fetchedAt: new Date(cache!.at).toISOString(), items: cache!.items },
      200,
      { "Cache-Control": "public, max-age=300" },
    );
  }

  for (const url of FEEDS) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "TrendFluxNewsRelay/1.0 (+https://trendfluxdigital.com)", Accept: "application/rss+xml, application/xml, text/xml" },
      });
      if (!res.ok) continue;
      const items = parseFeed(await res.text());
      if (!items.length) continue;
      cache = { at: Date.now(), items };
      return json(
        { source: "nagarikbarta24.com", cached: false, fetchedAt: new Date().toISOString(), items },
        200,
        { "Cache-Control": "public, max-age=300" },
      );
    } catch (err) {
      console.warn("news-feed: fetch failed", url, (err as Error).message);
    }
  }

  if (cache) {
    return json({
      source: "nagarikbarta24.com",
      cached: true,
      stale: true,
      fetchedAt: new Date(cache.at).toISOString(),
      items: cache.items,
    });
  }

  return json({ error: "feed_unavailable", items: [] }, 503);
});
