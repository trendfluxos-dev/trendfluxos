import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, ShieldAlert, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconicQuote } from "@/components/IconicQuote";
import { usePressItems } from "@/hooks/usePressItems";
import { useSeo } from "@/hooks/useSeo";
import { THE_STAND } from "@/content/theStand";

export default function TheStand() {
  const { items } = usePressItems();

  useSeo({
    title: "জাহিদ হাসান ইমন — সত্যের পক্ষে এক অটল অবস্থান | TrendFlux",
    description:
      "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়ে টর্চার সেল ও চাঁদাবাজির বিরুদ্ধে জাহিদ হাসান ইমনের অটুট নৈতিকতার সংগ্রাম — 'মায়ের নিষেধ আছে' থেকে ১৯+ যাচাইকৃত জাতীয় গণমাধ্যম প্রতিবেদন পর্যন্ত পূর্ণ দলিল।",
    type: "article",
    image: "/og-the-stand.jpg",
    imageWidth: 1216,
    imageHeight: 640,
    imageType: "image/jpeg",
    imageAlt: "মায়ের নিষেধ আছে — জাহিদ হাসান ইমন, সত্যের পক্ষে এক অটল অবস্থান",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Zahid Hasan Emon",
        alternateName: "জাহিদ হাসান ইমন",
        description:
          "Whistleblower against torture-cell culture and extortion at Jahangirnagar University; brand architect and growth operator.",
        affiliation: { "@type": "EducationalOrganization", name: "Jahangirnagar University" },
        worksFor: { "@type": "Organization", name: "TrendFlux Ecosystem" },
        nationality: "Bangladeshi",
      },
      {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: "জাহিদ হাসান ইমন — সত্যের পক্ষে এক অটল অবস্থান",
        inLanguage: "bn",
        author: { "@type": "Organization", name: "TrendFlux Ecosystem" },
        datePublished: "2023-08-14",
        keywords: [
          "Zahid Hasan Emon",
          "Jahangirnagar University",
          "torture cell",
          "whistleblower",
          "জাহিদ হাসান ইমন",
          "জাবি",
        ],
      },
    ],
  });

  return (
    <main lang="bn" className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      {/* 1. Cinematic Opener */}
      <section className="relative px-6 pt-24 pb-20 md:pt-32 md:pb-28 lg:px-10 overflow-hidden">
        <div className="absolute inset-0 hero-glow" aria-hidden />
        <div className="absolute inset-0 grid-dots opacity-30" aria-hidden />
        <div className="relative mx-auto max-w-5xl">
          <Link
            to="/#story"
            lang="en"
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-foreground/50 hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to home
          </Link>

          <p className="mt-10 text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-gold">
            {THE_STAND.hero.eyebrow}
          </p>
          <h1 className="font-display mt-6 text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            {THE_STAND.hero.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base md:text-xl leading-relaxed text-foreground/75">
            {THE_STAND.hero.subtitle}
          </p>

          <div className="mt-14">
            <IconicQuote
              bn={THE_STAND.hero.keystone}
              context={THE_STAND.hero.keystoneContext}
            />
          </div>
        </div>
      </section>

      {/* 2. The Man */}
      <Section title="The Man — পরিচয়">
        <div className="grid gap-4 sm:grid-cols-2">
          {THE_STAND.profile.map((row) => (
            <div
              key={row.label}
              className="rounded-xl border border-border bg-foreground/[0.03] p-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold/80">
                {row.label}
              </p>
              <p className="mt-2 text-base font-medium text-foreground/90">{row.value}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 3. The System */}
      <Section title={THE_STAND.system.title} icon={<ShieldAlert className="h-5 w-5 text-gold" />}>
        <p className="text-base md:text-lg leading-relaxed text-foreground/75">
          {THE_STAND.system.body}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {THE_STAND.system.stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-gold/20 bg-gold/[0.04] p-5 text-center"
            >
              <p className="font-display text-3xl font-bold text-gold">{s.value}</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-foreground/60">{s.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. The Refusal */}
      <Section title={THE_STAND.refusal.title}>
        <IconicQuote bn={THE_STAND.refusal.quote} context={THE_STAND.refusal.source} />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {THE_STAND.refusal.pillars.map((p, i) => (
            <div
              key={p.title}
              className="rounded-2xl border border-border bg-foreground/[0.03] p-6"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-gold/80">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-display text-lg font-bold">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 5. Timeline */}
      <Section title={THE_STAND.timeline.title}>
        <p className="mb-8 text-sm text-foreground/60">{THE_STAND.timeline.subtitle}</p>
        <ol className="relative border-l border-gold/30 pl-6 md:pl-8">
          {THE_STAND.timeline.events.map((e, i) => (
            <li key={i} className="relative mb-10 last:mb-0">
              <span
                className="absolute -left-[33px] md:-left-[37px] mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 ring-2 ring-gold/60"
                aria-hidden
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">
                {e.time}
              </p>
              <h3 className="mt-2 font-display text-xl font-bold">{e.title}</h3>
              <p className="mt-2 text-sm md:text-base leading-relaxed text-foreground/75">
                {e.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Iconic quote divider */}
      <section className="px-6 lg:px-10 py-12">
        <div className="mx-auto max-w-3xl">
          <IconicQuote bn={THE_STAND.quotes[1].bn} context={THE_STAND.quotes[1].context} />
        </div>
      </section>

      {/* 6. July 2024 */}
      <Section title={THE_STAND.context2024.title}>
        <p className="text-base md:text-lg leading-relaxed text-foreground/75">
          {THE_STAND.context2024.body}
        </p>
      </Section>

      {/* 6.5 — Belal: humanity restored (warm-tone bridge between collapse and rebuilding) */}
      <section className="relative px-6 lg:px-10 py-16 md:py-24 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.06] via-amber-200/[0.03] to-transparent"
        />
        <div
          aria-hidden
          className="absolute -top-20 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-300/90">
            {THE_STAND.belal.eyebrow}
          </p>
          <h2 className="font-display mt-3 text-3xl md:text-5xl font-bold leading-tight">
            {THE_STAND.belal.title}
          </h2>
          <p className="mt-3 max-w-2xl text-base md:text-lg text-foreground/65">
            {THE_STAND.belal.subtitle}
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-[auto_1fr] md:items-start">
            <figure className="mx-auto md:mx-0">
              <div className="relative h-40 w-40 md:h-48 md:w-48 rounded-full overflow-hidden ring-1 ring-amber-300/30 shadow-[0_20px_60px_-20px_hsl(38_92%_50%_/_0.25)] bg-gradient-to-br from-amber-100/[0.08] to-amber-500/[0.04]">
                <div className="absolute inset-0 grid place-items-center">
                  <span className="font-display text-5xl font-bold text-amber-200/80">ব</span>
                </div>
              </div>
              <figcaption className="mt-4 text-center md:text-left">
                <p className="font-display text-lg font-semibold text-foreground/95">
                  {THE_STAND.belal.name}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-amber-300/80">
                  {THE_STAND.belal.role}
                </p>
              </figcaption>
            </figure>

            <div>
              <blockquote
                lang="bn"
                className="relative rounded-2xl border border-amber-300/25 bg-amber-500/[0.04] p-6 md:p-8"
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent"
                />
                <p className="font-display text-xl md:text-3xl font-bold leading-snug text-foreground">
                  &ldquo;{THE_STAND.belal.quote}&rdquo;
                </p>
              </blockquote>
              <p className="mt-6 text-base leading-relaxed text-foreground/75">
                {THE_STAND.belal.body}
              </p>
            </div>
          </div>

          <div className="mt-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-300/90">
              What changed everything
            </p>
            <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {THE_STAND.belal.arc.map((step, i) => (
                <li
                  key={step.phase}
                  className="relative rounded-xl border border-amber-300/15 bg-foreground/[0.02] p-4"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-2 font-display text-base font-bold text-foreground/95">
                    {step.phase}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-foreground/60">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-10 rounded-2xl border-l-2 border-amber-300/50 bg-amber-500/[0.03] px-6 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-300/90">
              Why this matters
            </p>
            <p className="mt-2 text-base leading-relaxed text-foreground/80">
              {THE_STAND.belal.whyMatters}
            </p>
          </div>
        </div>
      </section>

      {/* 7. Press grid */}
      <Section title="Public Record — যাচাইকৃত জাতীয় কভারেজ">
        <p lang="en" className="mb-6 text-sm text-foreground/60">
          {items.length} verified national reports. Each link individually reviewed.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <a
              key={it.id || it.href}
              href={it.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-xl border border-border bg-foreground/[0.03] p-4 hover:border-gold/40 hover:bg-gold/5 transition-all"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gold">
                {it.outlet}
              </span>
              <p className="mt-2 text-sm leading-snug text-foreground/80 group-hover:text-foreground">
                {it.headline}
              </p>
              <span
                lang="en"
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-foreground/40 group-hover:text-gold"
              >
                Read article
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </a>
          ))}
        </div>
      </Section>

      {/* 8. Why he matters */}
      <Section title={THE_STAND.whyNow.title} icon={<Heart className="h-5 w-5 text-gold" />}>
        <ul className="space-y-3">
          {THE_STAND.whyNow.points.map((p) => (
            <li
              key={p}
              className="flex gap-3 rounded-xl border border-border bg-foreground/[0.03] p-4"
            >
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
              <span className="text-base leading-relaxed text-foreground/80">{p}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* 9. Take a stand */}
      <section className="px-6 lg:px-10 pb-24 pt-8">
        <div className="mx-auto max-w-3xl rounded-2xl glass border border-gold/30 p-8 md:p-12 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold">
            {THE_STAND.takeStand.title}
          </h2>
          <p className="mt-4 text-foreground/70">{THE_STAND.takeStand.body}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold" size="lg">
              <Link to="/the-stand/share">
                Share Quote Cards তৈরি করুন
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/#story">Public Record দেখুন</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/project-lead">যোগাযোগ করুন</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="px-6 lg:px-10 py-14 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          {icon}
          <h2 className="font-display text-2xl md:text-4xl font-bold leading-tight">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}
