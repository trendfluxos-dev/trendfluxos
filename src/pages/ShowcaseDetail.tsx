import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Share2, Sparkles, AlertCircle, Cog, CalendarClock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import ShareDialog, { type SharePayload } from "@/components/showcase/ShareDialog";
import { QuoteDialog } from "@/components/QuoteDialog";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { BRAND } from "@/config/brand";
import { SHOWCASE_ITEMS } from "@/data/showcase";

const ShowcaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const item = useMemo(() => SHOWCASE_ITEMS.find((i) => i.id === id), [id]);
  const [shareOpen, setShareOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  useSeo({
    title: item ? `${item.title} — Case Study | ${BRAND.name}` : `Project — ${BRAND.name}`,
    description: item?.summary ?? "Project case study from the TrendFlux showcase.",
    canonical: item ? `/showcase/${item.id}` : "/showcase",
    type: "article",
    imageAlt: item?.title ?? "TrendFlux project",
  });

  useJsonLd(
    item
      ? [
          {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: item.title,
            description: item.summary,
            url: `${BRAND.url}/showcase/${item.id}`,
            dateCreated: item.year,
            creator: { "@type": "Person", name: "Zahid Hasan Emon" },
            keywords: (item.tags ?? []).join(", "),
          },
        ]
      : [],
  );

  if (!item) return <Navigate to="/showcase" replace />;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/showcase/${item.id}`
      : `${BRAND.url}/showcase/${item.id}`;

  const sharePayload: SharePayload = {
    title: item.title,
    summary: item.summary,
    url: shareUrl,
    category: item.category,
    tags: item.tags,
    videoUrl: item.videoUrl,
  };

  const paragraphs = item.narrative ?? [item.summary];
  const outcomes =
    item.outcomes ?? (item.caseStudy ? [item.caseStudy.result] : []);

  const related = SHOWCASE_ITEMS.filter(
    (i) => i.id !== item.id && (i.industry === item.industry || i.category === item.category),
  ).slice(0, 3);

  return (
    <main className="min-h-dvh bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-10 px-6 lg:px-10">
        <div className="absolute inset-0 hero-glow" aria-hidden />
        <div className="absolute inset-0 grid-dots opacity-25" aria-hidden />
        <div className="relative max-w-5xl mx-auto">
          <Link
            to="/showcase"
            className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Showcase
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.25em]">
            <span className="text-primary/90 font-medium">{item.category}</span>
            <span className="text-foreground/40">·</span>
            <span className="text-foreground/60">{item.year}</span>
            {item.industry && (
              <>
                <span className="text-foreground/40">·</span>
                <span className="text-foreground/60">{item.industry}</span>
              </>
            )}
          </div>

          <h1 className="mt-4 font-display text-3xl md:text-5xl font-bold leading-[1.1]">
            {item.title}
          </h1>
          <p className="mt-5 text-foreground/70 text-base md:text-lg leading-relaxed max-w-3xl">
            {item.summary}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button variant="hero" size="lg" onClick={() => setQuoteOpen(true)}>
              <CalendarClock />
              Book Strategy Call
            </Button>
            {item.href && (
              <Button variant="outline" size="lg" asChild>
                {item.external ? (
                  <a href={item.href} target="_blank" rel="noreferrer">
                    {item.liveLabel ?? "Visit live site"}
                    <ArrowUpRight />
                  </a>
                ) : (
                  <Link to={item.href}>
                    {item.liveLabel ?? "Open project"}
                    <ArrowUpRight />
                  </Link>
                )}
              </Button>
            )}
            <Button variant="outline" size="lg" onClick={() => setShareOpen(true)}>
              <Share2 />
              Share
            </Button>
          </div>
        </div>
      </section>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} payload={sharePayload} />
      <QuoteDialog
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        context={{
          source: "showcase_detail",
          project: { id: item.id, title: item.title, href: item.href },
        }}
      />

      {/* METRICS */}
      {item.metrics && item.metrics.length > 0 && (
        <section className="px-6 lg:px-10 pb-10">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {item.metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl border border-border/50 bg-card/40 p-5 backdrop-blur-sm"
              >
                <div className="font-display text-2xl md:text-3xl font-bold text-gradient">
                  {m.value}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-foreground/55">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BODY */}
      <section className="px-6 lg:px-10 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
          {/* Narrative */}
          <article className="space-y-10">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold mb-4">
                <Sparkles className="inline w-5 h-5 text-primary mr-2 align-[-2px]" />
                Narrative
              </h2>
              <div className="space-y-4 text-foreground/75 leading-relaxed">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            {item.caseStudy && (
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold mb-4">
                  Problem → System → Result
                </h2>
                <ol className="space-y-3">
                  {[
                    { icon: AlertCircle, label: "Problem", text: item.caseStudy.problem, tone: "text-rose-300/90" },
                    { icon: Cog, label: "System", text: item.caseStudy.system, tone: "text-cyan-300/90" },
                    { icon: Sparkles, label: "Result", text: item.caseStudy.result, tone: "text-amber-300/90" },
                  ].map(({ icon: Icon, label, text, tone }) => (
                    <li
                      key={label}
                      className="flex gap-3 rounded-xl border border-border/40 bg-background/40 px-4 py-3"
                    >
                      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${tone}`} aria-hidden />
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/55 font-medium">
                          {label}
                        </div>
                        <p className="text-[14px] leading-relaxed text-foreground/85 mt-1">
                          {text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {outcomes.length > 0 && (
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold mb-4">Outcomes</h2>
                <ul className="space-y-2.5">
                  {outcomes.map((o) => (
                    <li key={o} className="flex gap-3 text-foreground/80 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 mt-1 shrink-0 text-emerald-400/90" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {item.services && item.services.length > 0 && (
              <div className="rounded-2xl border border-border/50 bg-card/40 p-5">
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-primary/80 font-medium">
                  Services
                </h3>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {item.services.map((s) => (
                    <li
                      key={s}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-border/40 bg-background/40 text-foreground/70"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {item.tech && item.tech.length > 0 && (
              <div className="rounded-2xl border border-border/50 bg-card/40 p-5">
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-primary/80 font-medium">
                  Stack
                </h3>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {item.tech.map((t) => (
                    <li
                      key={t}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-border/40 bg-background/40 text-foreground/70"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {item.tags && item.tags.length > 0 && (
              <div className="rounded-2xl border border-border/50 bg-card/40 p-5">
                <h3 className="text-[10px] uppercase tracking-[0.25em] text-primary/80 font-medium">
                  Tags
                </h3>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <li
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-border/40 bg-background/30 text-foreground/60"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="px-6 lg:px-10 pb-24">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-xl md:text-2xl font-bold mb-6">Related projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/showcase/${r.id}`}
                  className="group rounded-2xl border border-border/50 bg-card/40 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <p className="text-[10px] uppercase tracking-[0.22em] text-primary/80 font-medium">
                    {r.category}
                  </p>
                  <h3 className="mt-2 font-display text-base font-semibold leading-tight flex items-start gap-1.5">
                    <span className="flex-1">{r.title}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 mt-0.5 text-foreground/40 group-hover:text-primary" />
                  </h3>
                  <p className="mt-2 text-[12.5px] text-foreground/60 leading-relaxed line-clamp-3">
                    {r.summary}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
};

export default ShowcaseDetail;