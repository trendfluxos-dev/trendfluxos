import { useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShareDialog, { type SharePayload } from "@/components/showcase/ShareDialog";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/hooks/useSeo";
import {
  getEntryBySlug,
  RESEARCH_ITEMS,
  IMPLEMENTATION_ITEMS,
  type ResearchEntry,
  type FrameworkSection,
} from "@/data/research";
import { ArrowLeft, Clock, Share2, Sparkles } from "lucide-react";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const SectionBlock = ({ s }: { s: FrameworkSection }) => (
  <section className="border-l-2 border-primary/40 pl-5">
    <h2 className="font-display text-xl text-primary uppercase tracking-[0.18em] text-sm">
      {s.heading}
    </h2>
    {s.body.split("\n\n").map((p, i) => (
      <p key={i} className="text-foreground/80 leading-relaxed mt-3">
        {p}
      </p>
    ))}
    {s.bullets && (
      <ul className="mt-4 space-y-2">
        {s.bullets.map((b, i) => (
          <li key={i} className="text-foreground/75 leading-relaxed pl-4 relative">
            <span className="absolute left-0 top-2.5 w-1.5 h-1.5 rounded-full bg-primary/70" />
            {b}
          </li>
        ))}
      </ul>
    )}
  </section>
);

const ResearchDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [shareOpen, setShareOpen] = useState(false);
  const entry = slug ? getEntryBySlug(slug) : undefined;

  const articleUrl = entry
    ? `https://trendfluxdigital-bd.lovable.app${entry.kind === "research" ? "/research" : "/implementations"}/${entry.slug}`
    : undefined;
  useSeo({
    title: entry ? `${entry.title} — Zahid Hasan Emon` : "Not found",
    description: entry?.excerpt ?? "",
    type: "article",
    imageAlt: entry?.title,
    canonical: articleUrl,
    jsonLd: entry
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: entry.title,
          description: entry.excerpt,
          datePublished: entry.publishedAt,
          dateModified: entry.publishedAt,
          mainEntityOfPage: articleUrl,
          url: articleUrl,
          author: {
            "@type": "Person",
            name: "Zahid Hasan Emon",
          },
          publisher: {
            "@type": "Organization",
            name: "TrendFlux",
            url: "https://trendfluxdigital-bd.lovable.app",
          },
        }
      : undefined,
  });

  const related = useMemo(() => {
    if (!entry) return [];
    const pool = entry.kind === "research" ? RESEARCH_ITEMS : IMPLEMENTATION_ITEMS;
    return pool.filter((e) => e.slug !== entry.slug).slice(0, 3);
  }, [entry]);

  if (!entry) return <Navigate to="/showcase?tab=research" replace />;

  const basePath = entry.kind === "research" ? "/research" : "/implementations";
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://trendfluxdigitalbd.lovable.app";

  const payload: SharePayload = {
    title: entry.title,
    summary: entry.excerpt,
    url: `${origin}${basePath}/${entry.slug}`,
    category: entry.category,
    tags: entry.tags,
  };

  return (
    <main className="min-h-dvh bg-background text-foreground overflow-x-hidden">
      <Navbar />

      <article className="relative pt-32 pb-20 px-6 lg:px-10">
        <div className="absolute inset-0 hero-glow opacity-60" aria-hidden />
        <div className="relative max-w-3xl mx-auto">
          <Link
            to={`/showcase?tab=${entry.kind === "research" ? "research" : "implementations"}`}
            className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to {entry.kind === "research" ? "Research" : "Implementations"}
          </Link>

          <header className="mt-6">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-foreground/55">
              <span className="text-primary">{entry.cover?.eyebrow ?? entry.category}</span>
              <span className="text-foreground/30">·</span>
              <span>{fmtDate(entry.publishedAt)}</span>
              <span className="text-foreground/30">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {entry.readingMinutes} min
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-bold leading-[1.08] mt-4">
              {entry.title}
            </h1>
            {entry.subtitle && (
              <p className="text-lg text-foreground/65 mt-3 leading-relaxed">{entry.subtitle}</p>
            )}

            <div className="flex flex-wrap gap-1.5 mt-5">
              {entry.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-border/40 text-foreground/55"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              <Button variant="hero" size="sm" onClick={() => setShareOpen(true)}>
                <Sparkles className="w-4 h-4" />
                AI Share
              </Button>
              <p className="text-[11px] text-foreground/55 self-center inline-flex items-center gap-1.5">
                <Share2 className="w-3 h-3" />
                Auto-formats for FB · LinkedIn · X · YouTube
              </p>
            </div>
          </header>

          <div className="mt-12 space-y-10">
            <p className="text-lg text-foreground/85 leading-relaxed font-display">
              {entry.excerpt}
            </p>

            <SectionBlock s={entry.question} />
            <SectionBlock s={entry.method} />
            <SectionBlock s={entry.findings} />
            <SectionBlock s={entry.implications} />

            {entry.related && entry.related.length > 0 && (
              <section>
                <h3 className="text-xs uppercase tracking-[0.22em] text-foreground/55">
                  Related
                </h3>
                <ul className="mt-3 space-y-1.5">
                  {entry.related.map((r) => (
                    <li key={r.href}>
                      {r.external ? (
                        <a
                          href={r.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {r.label} ↗
                        </a>
                      ) : (
                        <Link to={r.href} className="text-sm text-primary hover:underline">
                          {r.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="px-6 lg:px-10 pb-20">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xs uppercase tracking-[0.22em] text-foreground/55 mb-4">
              More {entry.kind === "research" ? "research" : "implementations"}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((e) => (
                <Link
                  key={e.slug}
                  to={`${basePath}/${e.slug}`}
                  className="block rounded-xl border border-border/50 bg-background/30 p-5 hover:border-foreground/30 transition-all"
                >
                  <p className="text-[10px] uppercase tracking-[0.18em] text-primary">
                    {e.category}
                  </p>
                  <p className="font-display text-base mt-2 leading-tight">{e.title}</p>
                  <p className="text-xs text-foreground/60 mt-2 line-clamp-2">{e.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} payload={payload} />

      <Footer />
    </main>
  );
};

export default ResearchDetail;