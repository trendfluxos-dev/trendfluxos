import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShowcaseMasonry from "@/components/showcase/ShowcaseMasonry";
import ShareDialog, { type SharePayload } from "@/components/showcase/ShareDialog";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/hooks/useSeo";
import { SHOWCASE_ITEMS, SHOWCASE_CATEGORIES, type ShowcaseCategory } from "@/data/showcase";
import { ArrowRight, Sparkles, Share2 } from "lucide-react";

const SHARE_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/showcase`
    : "https://trendfluxdigitalbd.lovable.app/showcase";
const SHARE_TEXT =
  "Zahid Hasan Emon — Showcase: brands, systems and initiatives built end-to-end.";

const Showcase = () => {
  const [filter, setFilter] = useState<ShowcaseCategory | "All">("All");
  const [shareOpen, setShareOpen] = useState(false);

  useSeo({
    title: "Showcase — Zahid Hasan Emon | TrendFlux",
    description:
      "A curated showcase of brands, websites, enterprise systems, social platforms and personal initiatives built by Zahid Hasan Emon.",
    type: "profile",
    imageAlt: "Zahid Hasan Emon — Showcase of work",
  });

  const filtered = useMemo(
    () => (filter === "All" ? SHOWCASE_ITEMS : SHOWCASE_ITEMS.filter((i) => i.category === filter)),
    [filter],
  );

  const totalByCategory = useMemo(() => {
    const m: Record<string, number> = { All: SHOWCASE_ITEMS.length };
    for (const c of SHOWCASE_CATEGORIES) {
      m[c] = SHOWCASE_ITEMS.filter((i) => i.category === c).length;
    }
    return m;
  }, []);

  const pageSharePayload: SharePayload = {
    title: "Zahid Hasan Emon — Showcase",
    summary:
      "A curated showcase of brands, websites, enterprise systems, social platforms and personal initiatives built end-to-end by Zahid Hasan Emon.",
    url: SHARE_URL,
    category: "Portfolio",
    tags: ["TrendFlux", "GrowthOperator", "AIAutomation", "Bangladesh"],
  };

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-36 pb-14 px-6 lg:px-10">
        <div className="absolute inset-0 hero-glow" aria-hidden />
        <div className="absolute inset-0 grid-dots opacity-30" aria-hidden />
        <div className="relative max-w-7xl mx-auto">
          <p className="text-primary uppercase tracking-[0.3em] text-xs mb-4 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Showcase · Zahid Hasan Emon
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] max-w-4xl">
            Everything built, shipped & <span className="text-gradient">grown</span> — in one place.
          </h1>
          <p className="text-foreground/65 mt-5 max-w-2xl leading-relaxed">
            A living archive of client brands, websites, enterprise systems, social
            platforms and personal initiatives. Each card links to the live work — easy
            to explore, easy to share.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="hero" size="lg" onClick={() => setShareOpen(true)}>
              <Sparkles />
              AI Share Showcase
            </Button>
            <p className="text-xs text-foreground/55 self-center inline-flex items-center gap-1.5">
              <Share2 className="w-3 h-3" />
              Auto-formats for Facebook · LinkedIn · YouTube · X
            </p>
          </div>
        </div>
      </section>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} payload={pageSharePayload} />

      {/* FILTER BAR */}
      <section className="px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 border-b border-border/40 pb-5">
            {(["All", ...SHOWCASE_CATEGORIES] as const).map((c) => {
              const active = filter === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilter(c)}
                  className={[
                    "text-xs px-3.5 py-1.5 rounded-full border transition-all",
                    active
                      ? "border-primary/60 bg-primary/10 text-foreground"
                      : "border-border/50 bg-background/30 text-foreground/60 hover:text-foreground hover:border-foreground/30",
                  ].join(" ")}
                >
                  {c}
                  <span className="ml-1.5 text-foreground/40">{totalByCategory[c] ?? 0}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* MASONRY GRID */}
      <section className="px-6 lg:px-10 pt-10 pb-20">
        <div className="max-w-7xl mx-auto">
          <ShowcaseMasonry items={filtered} />

          {filtered.length === 0 && (
            <div className="text-center py-20 text-foreground/50 text-sm">
              No items in this category yet.
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-10 pb-24">
        <div className="max-w-5xl mx-auto relative rounded-[2rem] glass-strong overflow-hidden p-10 md:p-14">
          <div className="absolute inset-0 bg-gradient-hero" aria-hidden />
          <div className="relative grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <p className="text-primary uppercase tracking-[0.3em] text-xs mb-3">
                Want a system like this?
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                Book a session with the <span className="text-gradient">Project Lead</span>
              </h2>
              <p className="text-foreground/65 mt-4 max-w-xl">
                Map your own growth system blueprint — 30 minutes, direct with Zahid Hasan Emon.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button variant="hero" size="lg" asChild>
                <a href="https://wa.me/message/5GSNUYK6CSDCN1" target="_blank" rel="noreferrer">
                  Book on WhatsApp
                  <ArrowRight />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/project-lead">Project Lead Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Showcase;