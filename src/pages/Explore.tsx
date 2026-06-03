import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { navigablePages, preloadRoute, type PageType } from "@/lib/routes";
import { openCommandPalette } from "@/lib/commandPalette";

const DESCRIPTIONS: Record<string, string> = {
  "/": "Start here — overview of TrendFlux.",
  "/the-stand": "The Stand — Zahid Hasan Emon's integrity story.",
  "/the-stand/share": "Generate shareable quote cards for The Stand.",
  "/project-lead": "Submit a project lead and start a conversation.",
  "/marriage": "Wedding inquiries and concierge.",
  "/quiet-positions": "An emotional archive — quiet positions.",
  "/brand-open": "Brand Open — mass-public branding.",
  "/trendflux-talent": "Careers and the talent platform.",
  "/luxe-veil": "Invite-only premium ecosystem.",
  "/brandtoki": "Studio BrandToki — production, photo, video, podcast.",
  "/portfolio": "Executive portfolio of Zahid Hasan Emon.",
  "/enterprise": "Enterprise Control — portal, automation, compliance.",
  "/toolkit": "Growth Operator Toolkit Hub.",
  "/masterclass": "Advanced AI Masterclass — apply to join.",
  "/auth": "Sign in to your account.",
  "/dashboard": "Your personal dashboard and enrollments.",
};

const SECTION_BLURB: Record<PageType, string> = {
  Main: "The essentials — start, story, and inquiries.",
  Brand: "Brands, studios, and ecosystems.",
  Account: "Sign in and manage your access.",
  Admin: "Internal tooling. Requires permission.",
};

const ORDER: PageType[] = ["Main", "Brand", "Account", "Admin"];

const Explore = () => {
  const grouped = ORDER.map((type) => ({
    type,
    items: navigablePages.filter((p) => p.type === type),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Helmet>
        <title>Browse — TrendFlux Digital</title>
        <meta
          name="description"
          content="Browse every section of TrendFlux Digital — brands, courses, studio, enterprise, and more."
        />
        <link rel="canonical" href="/explore" />
      </Helmet>

      <Navbar />

      <main className="pt-28 pb-20 px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Site map
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            Browse everything in one place.
          </h1>
          <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-foreground/65">
            A simple, complete map of TrendFlux Digital. Click any section to jump in, or
            use search to find a page by name.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openCommandPalette()}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3.5 py-2 text-[13px] text-foreground/75 hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              Search pages
              <kbd className="ml-1 rounded border border-border/60 bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="mt-14 space-y-14">
            {grouped.map((group) => (
              <section key={group.type}>
                <div className="flex items-baseline justify-between border-b border-border/50 pb-3">
                  <h2 className="font-display text-xl tracking-tight">{group.type}</h2>
                  <p className="text-[12px] text-muted-foreground">
                    {SECTION_BLURB[group.type]}
                  </p>
                </div>

                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {group.items.map((page) => (
                    <li key={page.path}>
                      <Link
                        to={page.path}
                        onMouseEnter={() => preloadRoute(page.path)}
                        onFocus={() => preloadRoute(page.path)}
                        className="group block rounded-xl border border-border/50 bg-background/30 px-4 py-4 transition-colors hover:border-foreground/30 hover:bg-muted/30"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[14.5px] font-medium text-foreground">
                            {page.label}
                          </span>
                          <span className="text-[11px] text-muted-foreground group-hover:text-foreground/70 transition-colors">
                            {page.path}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[12.5px] leading-relaxed text-foreground/55">
                          {DESCRIPTIONS[page.path] ?? "Open this section."}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Explore;
