import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowUpRight, Clock, Loader2, Newspaper, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { BRAND } from "@/config/brand";
import { supabase } from "@/integrations/supabase/client";

interface NewsItem {
  title: string;
  link: string;
  publishedAt: string | null;
  excerpt: string;
  image: string | null;
  categories: string[];
}

interface NewsResponse {
  source: string;
  cached?: boolean;
  stale?: boolean;
  fetchedAt?: string;
  items: NewsItem[];
}

const formatDate = (iso: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const News = () => {
  useSeo({
    title: "Newsroom — Nagarik Barta 24 feed | TrendFlux",
    description:
      "Live Bangla headlines from Nagarik Barta 24, the news platform operated with TrendFlux Digital — updated every few minutes.",
    canonical: `${BRAND.url}/news`,
  });

  const { data, isLoading, isError, refetch, isFetching } = useQuery<NewsResponse>({
    queryKey: ["news-feed"],
    queryFn: async () => {
      const { data: payload, error } = await supabase.functions.invoke<NewsResponse>("news-feed");
      if (error) throw new Error(error.message);
      return payload ?? { source: "nagarikbarta24.com", items: [] };
    },
    staleTime: 5 * 60 * 1000,
  });

  const items = data?.items ?? [];
  const fetchedAt = data?.fetchedAt;
  const stale = data?.stale;

  useJsonLd(
    items.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "TrendFlux Newsroom",
            url: `${BRAND.url}/news`,
            about: "Bangla news headlines from Nagarik Barta 24",
            hasPart: items.slice(0, 10).map((item) => ({
              "@type": "NewsArticle",
              headline: item.title,
              url: item.link,
              datePublished: item.publishedAt ?? undefined,
            })),
          },
        ]
      : [],
  );

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <main id="main-content">
        <section className="border-b border-border py-14 md:py-20">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Newspaper className="h-3.5 w-3.5" aria-hidden /> Newsroom
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Nagarik Barta 24 — live headlines
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Bangla reporting from Nagarik Barta 24, the publishing platform built and operated with
              TrendFlux Digital. Headlines refresh automatically; full stories open on the publisher.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-muted disabled:opacity-60"
              >
                {isFetching ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                )}
                Refresh
              </button>
              {data?.fetchedAt && (
                <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  Updated {new Date(data.fetchedAt).toLocaleTimeString("en-GB")}
                  {data.stale ? " · showing cached copy" : ""}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            {/* Loading state — refresh disabled, timestamp shown when a cached copy exists. */}
            {isLoading && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/50 px-4 py-3">
                  <p className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" aria-hidden />
                    Fetching latest headlines…
                  </p>
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-[11px] font-semibold text-muted-foreground opacity-60"
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Refresh
                  </button>
                </div>
                {data?.fetchedAt && (
                  <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    Last updated {new Date(data.fetchedAt).toLocaleTimeString("en-GB")}
                    {data.stale ? " · showing cached copy" : ""}
                  </p>
                )}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-64 animate-pulse rounded-2xl border border-border bg-muted"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Error / empty state — always offer refresh + timestamp context. */}
            {!isLoading && (isError || items.length === 0) && (
              <div className="rounded-2xl border border-border bg-card p-6 text-center md:p-10">
                <AlertCircle className="mx-auto h-7 w-7 text-muted-foreground" aria-hidden />
                <h2 className="mt-4 font-display text-lg font-semibold">
                  {isError ? "Feed unavailable" : "No headlines right now"}
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  {isError
                    ? "We couldn't reach the publisher just now. Try refreshing, or read the latest directly on nagarikbarta24.com."
                    : "The feed loaded but returned no articles. Try refreshing to check for new stories."}
                </p>

                <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                  >
                    {isFetching ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <RefreshCw className="h-4 w-4" aria-hidden />
                    )}
                    {isFetching ? "Refreshing…" : "Refresh feed"}
                  </button>
                  <a
                    href="https://nagarikbarta24.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
                  >
                    Open Nagarik Barta 24 <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                </div>

                {data?.fetchedAt && (
                  <p className="mt-4 inline-flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    Last successful fetch: {new Date(data.fetchedAt).toLocaleTimeString("en-GB")}
                    {data.stale ? " · stale cached copy" : ""}
                  </p>
                )}
              </div>
            )}

            {items.length > 0 && (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <li
                    key={item.link}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        // Publisher thumbnails occasionally 404 — collapse the
                        // slot instead of leaving a blank block above the title.
                        onError={(e) => {
                          e.currentTarget.remove();
                        }}
                        className="h-44 w-full object-cover"
                      />
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      {item.categories.length > 0 && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                          {item.categories[0]}
                        </span>
                      )}
                      <h2 className="mt-2 font-display text-base font-semibold leading-snug text-foreground">
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          {item.title}
                        </a>
                      </h2>
                      {item.excerpt && (
                        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                          {item.excerpt}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(item.publishedAt)}
                        </span>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary"
                        >
                          Read <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                        </a>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default News;
