import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight, Download, Printer, Share2, ChevronRight, ExternalLink,
  Mail, Facebook, Linkedin, MessageCircle, Quote, FileCheck2, ShieldCheck,
  X, Maximize2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";
import { useJsonLd } from "@/hooks/useJsonLd";
import { usePressItems } from "@/hooks/usePressItems";
import { BRAND } from "@/config/brand";
import portrait from "@/assets/zahid-hasan-emon.webp";
import {
  FOUNDER, FOUNDER_CHAPTERS, FOUNDER_PROJECTS, FOUNDER_TECH, FOUNDER_STATS,
  FOUNDER_EXPERTISE, FOUNDER_STORY_SUMMARY, FOUNDER_STORY_THEMES,
  FOUNDER_PHILOSOPHY, FOUNDER_TESTIMONIALS, FOUNDER_COURSES, FOUNDER_QUIET,
  FOUNDER_ROUTES, FOUNDER_DOCUMENTS, type ChapterMeta,
} from "@/data/founder";
import "@/styles/founder-print.css";

// ---------- Small primitives (kept local — used only on this page) ----------

const ChapterShell = ({
  meta, children, tone = "light",
}: { meta: ChapterMeta; children: React.ReactNode; tone?: "light" | "muted" | "ink" }) => (
  <section
    id={meta.id}
    className={[
      "founder-chapter scroll-mt-24 border-t border-border",
      tone === "muted" ? "bg-muted" : tone === "ink" ? "bg-foreground text-background" : "bg-background",
    ].join(" ")}
  >
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
      <div className="mb-8 flex items-baseline justify-between gap-4 border-b border-border/60 pb-4">
        <p className={[
          "text-[10px] font-medium uppercase tracking-[0.3em]",
          tone === "ink" ? "text-background/60" : "text-primary",
        ].join(" ")}>{meta.eyebrow}</p>
        {meta.source && (
          <Link
            to={meta.source.href}
            className={[
              "no-print inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em]",
              tone === "ink" ? "text-background/70 hover:text-background" : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            Source: {meta.source.label} <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">{meta.title}</h2>
      <div className="mt-8 space-y-6 text-[15px] leading-relaxed">
        {children}
      </div>
    </div>
  </section>
);

const Card = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`founder-card rounded-xl border border-border bg-card p-5 ${className}`}>{children}</div>
);

// ---------- Sticky chapter nav (screen only) ----------

const ChapterNav = ({ chapters, onPrint }: { chapters: ChapterMeta[]; onPrint: () => void }) => {
  const [active, setActive] = useState<string>(chapters[0]?.id ?? "");
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    chapters.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [chapters]);

  return (
    <aside
      data-founder-print-hide
      className="no-print hidden xl:block fixed right-6 top-1/2 z-30 max-h-[70vh] w-56 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-background/80 p-3 backdrop-blur"
    >
      <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">Chapters</p>
      <nav aria-label="Founder booklet chapters" className="space-y-0.5">
        {chapters.map((c, i) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            className={[
              "block rounded-md px-2 py-1.5 text-[12px] transition",
              active === c.id
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            ].join(" ")}
          >
            <span className="tabular-nums text-[10px] opacity-60 mr-2">{String(i).padStart(2, "0")}</span>
            {c.title}
          </a>
        ))}
      </nav>
      <button
        type="button"
        onClick={onPrint}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-foreground hover:bg-primary/90"
      >
        <Download className="h-3.5 w-3.5" /> Save as PDF
      </button>
    </aside>
  );
};

// ---------- Page ----------

const Founder = () => {
  useSeo({
    title: "Founder Profile — Zahid Hasan Emon | TrendFlux",
    description:
      "Corporate founder profile of Zahid Hasan Emon — biography, philosophy, portfolio, leadership, media coverage and public-interest work. Read online or download as a premium A4 PDF booklet.",
    canonical: "/founder",
    type: "profile",
  });
  useJsonLd(
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      mainEntity: {
        "@type": "Person",
        name: FOUNDER.name,
        jobTitle: FOUNDER.role,
        image: `${BRAND.url}${portrait}`,
        url: FOUNDER.bookletUrl,
        worksFor: { "@type": "Organization", name: BRAND.name, url: BRAND.url },
        sameAs: [
          FOUNDER.contact.facebook,
          FOUNDER.contact.linkedin,
          FOUNDER.contact.whatsapp,
        ].filter(Boolean) as string[],
      },
    },
    "ld-founder-profile",
  );

  const { items: press } = usePressItems();
  const pressForBooklet = useMemo(() => press.slice(0, 12), [press]);

  const [lightbox, setLightbox] = useState<
    { src: string; alt: string; title: string; verifyUrl?: string } | null
  >(null);

  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox]);

  const handlePrint = () => {
    // Native print → the user picks "Save as PDF" as the destination.
    // Our print stylesheet handles A4 layout, page breaks, and color.
    window.print();
  };

  const handleShare = async () => {
    const url = FOUNDER.bookletUrl;
    const text = `${FOUNDER.name} — Founder Profile`;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({ url, title: text, text });
        return;
      } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch { /* ignore */ }
  };

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(FOUNDER.bookletUrl)}`;

  return (
    <main id="main-content" data-founder-print-root className="min-h-dvh bg-background text-foreground antialiased">
      <div data-founder-print-hide><Navbar /></div>

      <ChapterNav chapters={FOUNDER_CHAPTERS} onPrint={handlePrint} />

      {/* Mobile action bar */}
      <div
        data-founder-print-hide
        className="no-print sticky top-[calc(var(--nav-offset,4rem))] z-20 mx-auto flex max-w-4xl items-center justify-between gap-3 border-b border-border bg-background/85 px-5 py-3 backdrop-blur xl:hidden"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">Founder Booklet</p>
        <div className="flex gap-2">
          <button onClick={handleShare} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-[11px] font-semibold hover:bg-muted" aria-label="Share">
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
          <button onClick={handlePrint} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90" aria-label="Save as PDF">
            <Download className="h-3.5 w-3.5" /> PDF
          </button>
        </div>
      </div>

      {/* 00 — Cover */}
      <section id="cover" className="founder-chapter bg-background">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-primary/10 blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-3xl border border-border shadow-lg">
              <img
                src={portrait}
                alt={`${FOUNDER.name} — portrait`}
                className="h-[520px] w-full object-cover"
                loading="eager"
              />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-primary">Corporate Founder Profile · 2026</p>
            <h1 className="mt-6 font-display text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">{FOUNDER.name}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{FOUNDER.role}</p>
            <p className="mt-1 text-[15px] font-medium text-foreground">{FOUNDER.org}</p>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">{BRAND.description}</p>
            <div className="no-print mt-10 flex flex-wrap gap-3">
              <button onClick={handlePrint} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90">
                <Download className="h-4 w-4" /> Download PDF
              </button>
              <button onClick={handlePrint} className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-muted">
                <Printer className="h-4 w-4" /> Print Booklet
              </button>
              <button onClick={handleShare} className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-muted">
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
            <p className="mt-10 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              {FOUNDER.bookletUrl.replace(/^https?:\/\//, "")}
            </p>
          </div>
        </div>
      </section>

      {/* 01 — Table of contents */}
      <ChapterShell meta={FOUNDER_CHAPTERS[1]} tone="muted">
        <ol className="grid gap-2 sm:grid-cols-2">
          {FOUNDER_CHAPTERS.slice(2).map((c, i) => (
            <li key={c.id}>
              <a href={`#${c.id}`} className="flex items-baseline justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm hover:border-primary/40 hover:bg-primary/[0.03]">
                <span className="flex items-baseline gap-3">
                  <span className="tabular-nums text-[11px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-medium">{c.title}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            </li>
          ))}
        </ol>
      </ChapterShell>

      {/* 02 — About */}
      <ChapterShell meta={FOUNDER_CHAPTERS[2]}>
        <p>
          TrendFlux started as a refusal — a refusal to keep watching founders drown in disconnected
          tools, vanity dashboards, and retainers that couldn't justify their own existence.
        </p>
        <p>
          The thesis was simple: growth is infrastructure. Treat it like engineers treat systems —
          composable, auditable, instrumented — and it compounds. Treat it like marketing, and you
          rent attention until the budget runs out.
        </p>
        <p>
          Today TrendFlux operates as an AI-native Growth OS — integrated modules deployed across
          founders and brands who want leverage, not lock-in.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            { t: "Ethical Growth", d: "No dark patterns. No vanity. No manipulation." },
            { t: "Systems-First", d: "Build infrastructure that compounds, not tasks that exhaust." },
            { t: "Composable", d: "Every module slots into the next — or stands on its own." },
            { t: "Transparency", d: "Audit-ready dashboards. No black boxes. No mystery retainers." },
          ].map((p) => (
            <Card key={p.t}>
              <p className="font-display text-sm font-semibold">{p.t}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">{p.d}</p>
            </Card>
          ))}
        </div>
      </ChapterShell>

      {/* 03 — Founder story */}
      <ChapterShell meta={FOUNDER_CHAPTERS[3]} tone="muted">
        <ul className="space-y-3">
          {FOUNDER_STORY_SUMMARY.summary.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">Key Takeaways</p>
          <ul className="mt-3 space-y-2 text-[14px]">
            {FOUNDER_STORY_SUMMARY.takeaways.map((s, i) => <li key={i}>— {s}</li>)}
          </ul>
        </div>
        <div className="mt-6 flex flex-wrap gap-1.5">
          {FOUNDER_STORY_THEMES.map((t) => (
            <span key={t} className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px]">{t}</span>
          ))}
        </div>
      </ChapterShell>

      {/* 04 — Philosophy */}
      <ChapterShell meta={FOUNDER_CHAPTERS[4]}>
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-primary">{FOUNDER_PHILOSOPHY.eyebrow}</p>
        <blockquote lang="bn" className="mt-4 font-display text-2xl font-semibold leading-snug sm:text-3xl">
          &ldquo;{FOUNDER_PHILOSOPHY.keystone}&rdquo;
        </blockquote>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">— {FOUNDER_PHILOSOPHY.keystoneContext}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {FOUNDER_PHILOSOPHY.pillars.map((p) => (
            <Card key={p.title}>
              <p className="font-display text-sm font-semibold">{p.title}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">{p.body}</p>
            </Card>
          ))}
        </div>
        <div className="mt-6 space-y-3">
          {FOUNDER_PHILOSOPHY.quotes.map((q, i) => (
            <figure key={i} className="rounded-lg border-l-2 border-primary bg-muted/60 px-4 py-3">
              <Quote className="mb-1 h-3.5 w-3.5 text-primary" />
              <blockquote lang="bn" className="text-[15px]">{q.bn}</blockquote>
              {q.context && <figcaption className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{q.context}</figcaption>}
            </figure>
          ))}
        </div>
      </ChapterShell>

      {/* 05 — Quiet positions */}
      <ChapterShell meta={FOUNDER_CHAPTERS[5]} tone="muted">
        <div className="grid gap-3 sm:grid-cols-2">
          {FOUNDER_QUIET.map((f) => (
            <Card key={f.id}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary">{f.theme}</p>
              <p lang="bn" className="mt-2 text-[15px] leading-relaxed">{f.bn}</p>
              <p className="mt-1 text-[13px] italic text-muted-foreground">{f.en}</p>
            </Card>
          ))}
        </div>
      </ChapterShell>

      {/* 06 — Expertise */}
      <ChapterShell meta={FOUNDER_CHAPTERS[6]}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FOUNDER_EXPERTISE.map((e) => (
            <Card key={e.title}>
              <e.Icon className="h-5 w-5 text-primary" aria-hidden />
              <p className="mt-3 font-display text-sm font-semibold">{e.title}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">{e.desc}</p>
            </Card>
          ))}
        </div>
      </ChapterShell>

      {/* 07 — Portfolio */}
      <ChapterShell meta={FOUNDER_CHAPTERS[7]} tone="muted">
        <div className="grid gap-3 sm:grid-cols-2">
          {FOUNDER_PROJECTS.map((p) => {
            const isExternal = p.href?.startsWith("http");
            const Body = (
              <Card className="h-full transition hover:border-primary/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-primary">{p.category}{p.year ? ` · ${p.year}` : ""}</p>
                    <p className="mt-1 font-display text-[15px] font-semibold">{p.title}</p>
                  </div>
                  {p.href && <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground line-clamp-3">{p.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.stage && <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px]">{p.stage}</span>}
                  {p.tech?.slice(0, 4).map((t) => (
                    <span key={t} className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px]">{t}</span>
                  ))}
                </div>
              </Card>
            );
            if (!p.href) return <div key={p.title}>{Body}</div>;
            return isExternal ? (
              <a key={p.title} href={p.href} target="_blank" rel="noreferrer">{Body}</a>
            ) : (
              <Link key={p.title} to={p.href}>{Body}</Link>
            );
          })}
        </div>
      </ChapterShell>

      {/* 08 — Leadership */}
      <ChapterShell meta={FOUNDER_CHAPTERS[8]}>
        <p>
          Zahid leads engagements as an operator, not a consultant — sitting inside the pipeline,
          owning the numbers, and shipping the systems his team will run after handoff.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { t: "Operator Model", d: "Fractional CGO seat with skin in the game — outcomes, not deliverables." },
            { t: "Working Style", d: "Weekly cadence, transparent dashboards, and one shared Notion of truth." },
            { t: "Decision Framework", d: "Bias toward reversible systems; ship, measure, iterate in 14-day loops." },
            { t: "Handoff Discipline", d: "Every workflow documented and owned by an internal seat before we exit." },
          ].map((x) => (
            <Card key={x.t}>
              <p className="font-display text-sm font-semibold">{x.t}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">{x.d}</p>
            </Card>
          ))}
        </div>
      </ChapterShell>

      {/* 09 — Open initiatives */}
      <ChapterShell meta={FOUNDER_CHAPTERS[9]} tone="muted">
        <p>
          Brand Open publishes the working parts of the TrendFlux operating stack — playbooks,
          templates, and the community that pressure-tests them — so operators outside our roster
          can learn from what we ship.
        </p>
        <Link
          to="/brand-open"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          Explore Brand Open <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </ChapterShell>

      {/* 10 — Talent */}
      <ChapterShell meta={FOUNDER_CHAPTERS[10]}>
        <p>
          TrendFlux Talent hires for operator instinct — people who write their own playbooks and
          then teach the system to run without them. Growth is a craft, not a role.
        </p>
        <Link to="/trendflux-talent" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          Careers & Talent <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </ChapterShell>

      {/* 11 — Courses */}
      <ChapterShell meta={FOUNDER_CHAPTERS[11]} tone="muted">
        <div className="grid gap-3 sm:grid-cols-2">
          {FOUNDER_COURSES.map((c) => (
            <Card key={c.slug}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary">{c.level} · {c.format}</p>
              <p className="mt-1 font-display text-[15px] font-semibold">{c.title}</p>
              <p className="mt-1 text-[13px] text-muted-foreground line-clamp-2">{c.summary}</p>
            </Card>
          ))}
        </div>
        <div className="no-print mt-4 flex gap-3 text-sm">
          <Link to="/course/trendflux" className="text-primary hover:underline">Trendflux Course →</Link>
          <Link to="/masterclass" className="text-primary hover:underline">Masterclass →</Link>
          <Link to="/edtech" className="text-primary hover:underline">EdTech →</Link>
        </div>
      </ChapterShell>

      {/* 12 — Media */}
      <ChapterShell meta={FOUNDER_CHAPTERS[12]}>
        {pressForBooklet.length === 0 ? (
          <p className="text-muted-foreground">Loading press mentions…</p>
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-5">
            {pressForBooklet.map((p) => (
              <li key={p.id ?? p.href} className="relative">
                <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full border border-primary bg-background" />
                <p className="text-[11px] uppercase tracking-[0.2em] text-primary">{p.outlet}</p>
                <a href={p.href} target="_blank" rel="noreferrer" className="mt-1 block font-display text-[15px] font-semibold hover:underline">
                  {p.headline}
                </a>
                {p.context && <p className="mt-1 text-[13px] text-muted-foreground">{p.context}</p>}
              </li>
            ))}
          </ol>
        )}
      </ChapterShell>

      {/* 13 — Public interest */}
      <ChapterShell meta={FOUNDER_CHAPTERS[13]} tone="muted">
        <p>
          The Pabna Accountability Project is a documentation-first response to the campus
          impunity Emon experienced firsthand — turning private testimony into public record so
          institutional actors cannot rewrite the timeline.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {["Transparency", "Accountability", "Community Impact"].map((k) => (
            <Card key={k}><p className="font-display text-sm font-semibold">{k}</p></Card>
          ))}
        </div>
        <Link to="/justice-appeal" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          Read the appeal <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </ChapterShell>

      {/* 14 — Documents & Proofs */}
      <ChapterShell meta={FOUNDER_CHAPTERS[14]}>
        <p className="text-muted-foreground">
          Verifiable public records referenced across this profile. Each entry links to the
          original source so any reader — investor, partner, journalist, or institution — can
          confirm authenticity independently.
        </p>
        <ol className="mt-6 space-y-4">
          {FOUNDER_DOCUMENTS.map((d) => {
            const dateLabel = new Date(d.date).toLocaleDateString("en-GB", {
              day: "2-digit", month: "short", year: "numeric",
            });
            const host = (() => {
              if (!d.verifyUrl) return null;
              try { return new URL(d.verifyUrl).hostname.replace(/^www\./, ""); }
              catch { return d.verifyUrl; }
            })();
            return (
              <li key={d.id}>
                <Card>
                  <article aria-labelledby={`doc-${d.id}-title`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-primary">
                        {d.category} · {dateLabel}
                      </p>
                      <h3
                        id={`doc-${d.id}-title`}
                        className="mt-1 font-display text-[15px] font-semibold leading-snug"
                      >
                        {d.title}
                      </h3>
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        Issued by {d.issuer}
                      </p>
                      {d.note && (
                        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                          {d.note}
                        </p>
                      )}
                    </div>
                    <FileCheck2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  </div>
                  {d.previewImage && (
                    <figure className="mt-4 space-y-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setLightbox({
                          src: d.previewImage!,
                          alt: d.previewAlt ?? `${d.title} — document preview`,
                          title: d.title,
                          verifyUrl: d.verifyUrl,
                        })
                      }
                      className="group relative block w-full overflow-hidden rounded-lg border border-border bg-white text-left focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label={`Open fullscreen preview of ${d.title}`}
                    >
                      <img
                        src={d.previewImage}
                        alt={d.previewAlt ?? `${d.title} — document preview`}
                        loading="lazy"
                        decoding="async"
                        className="mx-auto block max-h-[520px] w-full object-contain"
                      />
                      <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                        <Maximize2 className="h-3 w-3" /> View fullscreen
                      </span>
                    </button>
                    <figcaption className="text-[11px] text-muted-foreground">
                      Reference image — {d.title}. Tap to view fullscreen.
                    </figcaption>
                    </figure>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {d.verifyUrl ? (
                      <>
                        <a
                          href={d.verifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Verify ${d.title} on the official source (opens in a new tab)`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-foreground hover:bg-primary/90"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" /> Verify
                          <ExternalLink className="h-3 w-3 opacity-80" />
                        </a>
                        <a
                          href={d.verifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open source ${host} in a new tab`}
                          className="break-all text-[11px] text-muted-foreground hover:text-primary hover:underline"
                        >
                          {host}
                        </a>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verification on request
                      </span>
                    )}
                  </div>
                  </article>
                </Card>
              </li>
            );
          })}
        </ol>
        <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Additional records are added here as they are formally issued or published.
        </p>
      </ChapterShell>

      {/* 15 — Stats */}
      <ChapterShell meta={FOUNDER_CHAPTERS[15]}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FOUNDER_STATS.map((s) => (
            <Card key={s.label} className="text-center">
              <p className="font-display text-4xl font-semibold tabular-nums text-primary">{s.value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{s.label}</p>
            </Card>
          ))}
        </div>
      </ChapterShell>

      {/* 16 — Tech stack */}
      <ChapterShell meta={FOUNDER_CHAPTERS[16]} tone="muted">
        <div className="flex flex-wrap gap-2">
          {FOUNDER_TECH.map((t) => (
            <span key={t} className="rounded-full border border-border bg-background px-3 py-1.5 text-[12px] font-medium">
              {t}
            </span>
          ))}
        </div>
        <p className="mt-4 text-[12px] text-muted-foreground">
          Detected from project metadata across the portfolio and case-study catalogue.
        </p>
      </ChapterShell>

      {/* 17 — Testimonials */}
      <ChapterShell meta={FOUNDER_CHAPTERS[17]}>
        <div className="grid gap-3 sm:grid-cols-2">
          {FOUNDER_TESTIMONIALS.map((t) => (
            <Card key={t.name + t.company}>
              <Quote className="h-4 w-4 text-primary" />
              <blockquote className="mt-2 text-[14px] leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
              <p className="mt-3 text-[12px] font-semibold">{t.name}</p>
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{t.role} · {t.company}</p>
            </Card>
          ))}
        </div>
      </ChapterShell>

      {/* 18 — Contact */}
      <ChapterShell meta={FOUNDER_CHAPTERS[18]} tone="muted">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Founder</p>
            <p className="mt-1 font-display text-lg font-semibold">{FOUNDER.name}</p>
            <ul className="mt-3 space-y-2 text-[13px]">
              {FOUNDER.contact.whatsapp && (
                <li><a className="inline-flex items-center gap-2 hover:text-primary" href={FOUNDER.contact.whatsapp} target="_blank" rel="noreferrer"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a></li>
              )}
              {FOUNDER.contact.linkedin && (
                <li><a className="inline-flex items-center gap-2 hover:text-primary" href={FOUNDER.contact.linkedin} target="_blank" rel="noreferrer"><Linkedin className="h-3.5 w-3.5" /> LinkedIn</a></li>
              )}
              {FOUNDER.contact.facebook && (
                <li><a className="inline-flex items-center gap-2 hover:text-primary" href={FOUNDER.contact.facebook} target="_blank" rel="noreferrer"><Facebook className="h-3.5 w-3.5" /> Facebook</a></li>
              )}
              {FOUNDER.contact.email && (
                <li><a className="inline-flex items-center gap-2 hover:text-primary" href={`mailto:${FOUNDER.contact.email}`}><Mail className="h-3.5 w-3.5" /> {FOUNDER.contact.email}</a></li>
              )}
            </ul>
          </Card>
          <Card>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary">Company</p>
            <p className="mt-1 font-display text-lg font-semibold">{FOUNDER.companyContact.displayName}</p>
            <ul className="mt-3 space-y-2 text-[13px]">
              <li><a className="inline-flex items-center gap-2 hover:text-primary" href={FOUNDER.url} target="_blank" rel="noreferrer">🌐 {FOUNDER.url.replace(/^https?:\/\//, "")}</a></li>
              {FOUNDER.companyContact.email && (
                <li><a className="inline-flex items-center gap-2 hover:text-primary" href={`mailto:${FOUNDER.companyContact.email}`}><Mail className="h-3.5 w-3.5" /> {FOUNDER.companyContact.email}</a></li>
              )}
              {FOUNDER.companyContact.linkedin && (
                <li><a className="inline-flex items-center gap-2 hover:text-primary" href={FOUNDER.companyContact.linkedin} target="_blank" rel="noreferrer"><Linkedin className="h-3.5 w-3.5" /> LinkedIn</a></li>
              )}
            </ul>
          </Card>
        </div>
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Founder Pages</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {FOUNDER_ROUTES.map((r) => (
              <Link key={r.path} to={r.path} className="rounded-full border border-border bg-background px-3 py-1 text-[12px] hover:border-primary/40 hover:text-primary">
                {r.title}
              </Link>
            ))}
          </div>
        </div>
      </ChapterShell>

      {/* 19 — Back cover / colophon */}
      <ChapterShell meta={FOUNDER_CHAPTERS[19]}>
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-display text-2xl font-semibold">{FOUNDER.name}</p>
            <p className="text-sm text-muted-foreground">{FOUNDER.role} · {FOUNDER.org}</p>
            <p className="mt-4 max-w-sm text-[13px] text-muted-foreground">
              This booklet is generated from the live founder pages on {FOUNDER.url.replace(/^https?:\/\//, "")}.
              It updates automatically whenever the source pages change.
            </p>
            <p className="mt-6 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">© {new Date().getFullYear()} {BRAND.legalName}</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <img src={qrSrc} alt={`QR code to ${FOUNDER.bookletUrl}`} className="h-40 w-40 rounded-md border border-border bg-white p-2" loading="lazy" />
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Scan to open online</p>
          </div>
        </div>
      </ChapterShell>

      <div data-founder-print-hide><Footer /></div>

      {lightbox && (
        <div
          data-founder-print-hide
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          className="no-print fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-white sm:px-6">
            <p className="min-w-0 truncate text-sm font-semibold">{lightbox.title}</p>
            <div className="flex items-center gap-2">
              {lightbox.verifyUrl && (
                <a
                  href={lightbox.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-foreground hover:bg-primary/90"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Verify
                  <ExternalLink className="h-3 w-3 opacity-80" />
                </a>
              )}
              <button
                type="button"
                onClick={() => setLightbox(null)}
                aria-label="Close preview"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div
            className="flex flex-1 items-center justify-center overflow-auto px-4 pb-6 sm:px-8"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              className="max-h-full max-w-full rounded-md bg-white object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default Founder;