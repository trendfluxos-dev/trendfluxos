import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Megaphone,
  GraduationCap,
  Building2,
  Layers,
  BookOpenCheck,
  Images,
  Flag,
  Presentation,
  Wrench,
  Cpu,
  Mail,
} from "lucide-react";

/**
 * Ecosystem Navigator — sticky jump-nav that maps the whole public
 * ecosystem into eleven large tap targets. Uses semantic tokens only
 * so it inherits the site's theme without redefining colour.
 */
type Item = {
  label: string;
  to: string;
  eyebrow: string;
  desc: string;
  Icon: typeof Megaphone;
  /** Optional homepage section id (matches `[data-nav-section="…"]`)
   *  used to light this card up while that section is in view. */
  sectionId?: string;
};

const ITEMS: Item[] = [
  { label: "Marketing",   to: "/services",         eyebrow: "01", desc: "Growth, brand & performance services.",       Icon: Megaphone },
  { label: "EdTech",      to: "/edtech",           eyebrow: "02", desc: "Kormoshikkha — courses, live, certificates.", Icon: GraduationCap, sectionId: "edtech" },
  { label: "Enterprise",  to: "/enterprise",       eyebrow: "03", desc: "Growth OS deployments for scaling teams.",    Icon: Building2 },
  { label: "Brands",      to: "/brands",           eyebrow: "04", desc: "Sub-brands under the TrendFlux umbrella.",    Icon: Layers },
  { label: "Case Studies",to: "/showcase",         eyebrow: "05", desc: "Deployed outcomes with audit trail.",         Icon: BookOpenCheck, sectionId: "case-studies" },
  { label: "Portfolio",   to: "/portfolio",        eyebrow: "06", desc: "Operator work across eight brands.",          Icon: Images },
  { label: "The Stand",   to: "/the-stand",        eyebrow: "07", desc: "জাতীয় দলিল — civic accountability record.",    Icon: Flag,       sectionId: "the-stand" },
  { label: "Masterclass", to: "/masterclass",      eyebrow: "08", desc: "Founder-led operator masterclasses.",         Icon: Presentation },
  { label: "Toolkit",     to: "/toolkit",          eyebrow: "09", desc: "Playbooks, templates & operator tools.",      Icon: Wrench },
  { label: "Growth OS",   to: "/course/trendflux", eyebrow: "10", desc: "The TrendFlux Growth OS course.",             Icon: Cpu,        sectionId: "growth-os" },
  { label: "Contact",     to: "/contact",          eyebrow: "11", desc: "Book a strategy call or send a brief.",       Icon: Mail,       sectionId: "contact" },
];

export default function EcosystemNavigator() {
  const { hash } = useLocation();
  // Which mapped homepage section is currently in view — used to light up
  // the corresponding card. `null` when nothing tracked is visible.
  const [activeId, setActiveId] = useState<string | null>(null);
  // Deep-link "grace window" — after a hash change we lock the active id
  // to the destination for ~900ms so the smooth-scroll can't flip the
  // highlight to intermediate sections in transit.
  const hashLockUntilRef = useRef(0);

  // ── Active-state tracking ────────────────────────────────────────────────
  // Hash → sectionId map (hash may be either the wrapper's id or the
  // sectionId itself). Extend as new anchors are added.
  const HASH_TO_SECTION: Record<string, string> = {
    "systems-he-built": "growth-os",
    "growth-os": "growth-os",
    "the-stand": "the-stand",
    "case-studies": "case-studies",
    "edtech": "edtech",
    "contact": "contact",
  };

  // 1) Hash-driven active state — instant, no scroll wait. Runs on mount,
  //    on every react-router `hash` change, and on browser `hashchange`.
  //    Also arms the grace window so the scrollspy below defers to us.
  useEffect(() => {
    const applyFromHash = () => {
      const raw = (hash || window.location.hash || "").replace(/^#/, "");
      if (raw && HASH_TO_SECTION[raw]) {
        hashLockUntilRef.current = Date.now() + 900;
        setActiveId(HASH_TO_SECTION[raw]);
      }
    };
    applyFromHash();
    window.addEventListener("hashchange", applyFromHash);
    return () => window.removeEventListener("hashchange", applyFromHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash]);

  // 2) Scroll-driven active state. Uses a geometry-based scrollspy so the
  //    highlight doesn't flap between adjacent sections during a scroll:
  //    the active section is the one whose top is closest to the current
  //    header offset (largest non-positive `rect.top - navOffset`). If we
  //    are scrolled above every tracked section, activeId clears to null.
  //    An IntersectionObserver + MutationObserver are used only as cheap
  //    "recompute triggers" (initial + lazy-mount + entering/leaving vp).
  useEffect(() => {
    let raf = 0;
    const seen = new WeakSet<Element>();

    const readNavOffset = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--nav-offset").trim();
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : 96;
    };

    const recompute = () => {
      // Honour the hash grace window — leave activeId alone.
      if (Date.now() < hashLockUntilRef.current) return;

      const targets = Array.from(
        document.querySelectorAll<HTMLElement>("[data-nav-section]")
      );
      if (targets.length === 0) return;

      const anchor = readNavOffset() + 8; // just below the sticky headers
      let best: { id: string | null; delta: number } = { id: null, delta: -Infinity };
      let anyAbove = false;

      for (const el of targets) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
          // Fully out of viewport — treat as "already passed" if above,
          // otherwise "not yet".
          if (rect.bottom <= anchor) anyAbove = true;
          continue;
        }
        const delta = rect.top - anchor; // negative once section is under the header
        if (delta <= 0 && delta > best.delta) {
          best = { id: el.dataset.navSection ?? null, delta };
          anyAbove = true;
        }
      }

      setActiveId((prev) => {
        const next = best.id ?? (anyAbove ? prev : null);
        return next === prev ? prev : next;
      });
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        recompute();
      });
    };

    // IO fires whenever *any* tracked section crosses in/out of the viewport;
    // used purely to trigger a recompute (plus first-observation warm-up).
    const io = new IntersectionObserver(schedule, { threshold: [0, 1] });
    const attach = () => {
      document.querySelectorAll<HTMLElement>("[data-nav-section]").forEach((el) => {
        if (!seen.has(el)) {
          seen.add(el);
          io.observe(el);
        }
      });
      schedule();
    };
    attach();

    const mo = new MutationObserver(attach);
    mo.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Roving keyboard navigation across the card grid/stack.
  // Arrow keys move focus between cards; Home/End jump to the ends.
  const listRef = useRef<HTMLUListElement>(null);
  const onListKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const links = Array.from(
      listRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-nav-card]") ?? []
    );
    const current = document.activeElement as HTMLElement | null;
    const index = links.findIndex((el) => el === current);
    if (index === -1) return;

    let next = -1;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = (index + 1) % links.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = (index - 1 + links.length) % links.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = links.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    links[next]?.focus();
    links[next]?.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: reduce ? "auto" : "smooth",
    });
  };

  return (
    <section
      aria-labelledby="ecosystem-navigator-title"
      className="relative isolate bg-background py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Sticky header — pins while cards scroll past on desktop */}
        <div
          data-sticky-header
          className="lg:sticky lg:top-20 lg:z-10 lg:-mx-4 lg:px-4 lg:py-6 lg:backdrop-blur-md lg:bg-background/75 lg:border-b lg:border-border/60"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
                Ecosystem Navigator
              </p>
              <h2
                id="ecosystem-navigator-title"
                className="font-display text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[44px] md:leading-[1.05]"
              >
                Jump into any surface of the TrendFlux ecosystem.
              </h2>
              <p className="mt-4 text-[15px] leading-[1.7] text-muted-foreground sm:text-[16.5px]">
                Eleven doorways — marketing, learning, enterprise, brands, civic. Every card lands you on a live public route.
              </p>
            </div>
            <div className="hidden lg:block">
              <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                {ITEMS.length.toString().padStart(2, "0")} routes
              </span>
            </div>
          </div>
        </div>

        {/* Mobile: swipeable horizontal snap-stack. sm+: grid. */}
        <nav
          aria-label="Ecosystem sections"
          className="relative mt-10 lg:mt-14"
        >
          {/* Edge fade hint (mobile only) */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent sm:hidden" />

          <ul
            ref={listRef}
            role="list"
            onKeyDown={onListKeyDown}
            aria-describedby="ecosystem-navigator-help"
            className="
              -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4
              [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
              sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0
              lg:grid-cols-3 lg:gap-6
            "
          >
            {ITEMS.map(({ label, to, eyebrow, desc, Icon, sectionId }, i) => {
              const descId = `eco-card-desc-${i}`;
              const isActive = !!sectionId && sectionId === activeId;
              return (
              <li
                key={to}
                className="group shrink-0 basis-[82%] snap-start sm:basis-auto sm:shrink"
              >
                <Link
                  to={to}
                  data-nav-card
                  data-active={isActive || undefined}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={`${label}, card ${i + 1} of ${ITEMS.length}`}
                  aria-describedby={descId}
                  className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-6 outline-none transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_50px_-20px_hsl(var(--primary)/0.35)] focus-visible:-translate-y-1 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:shadow-[0_20px_50px_-20px_hsl(var(--primary)/0.5)] data-[active]:border-primary data-[active]:bg-primary/[0.04] data-[active]:shadow-[0_18px_45px_-22px_hsl(var(--primary)/0.45)] sm:p-7"
                >
                  {/* Active-state left accent bar */}
                  <span aria-hidden="true" className="pointer-events-none absolute inset-y-4 left-0 w-[3px] rounded-full bg-primary opacity-0 transition-opacity duration-300 data-[on=true]:opacity-100" data-on={isActive} />
                  <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 data-[on=true]:opacity-100" data-on={isActive} />
                  <span aria-hidden="true" className="pointer-events-none absolute right-5 top-5 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/70 transition-colors duration-300 group-hover:text-primary group-focus-within:text-primary data-[on=true]:text-primary" data-on={isActive}>
                    {isActive && (
                      <span className="relative inline-flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping motion-reduce:animate-none" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.7)]" />
                      </span>
                    )}
                    {eyebrow}
                  </span>

                  <div className={"relative flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-background transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary/[0.06] group-focus-within:border-primary/40 group-focus-within:bg-primary/[0.06]" + (isActive ? " border-primary/50 bg-primary/[0.08]" : "")}>
                    <Icon className={"h-5 w-5 transition-colors duration-300 group-hover:text-primary " + (isActive ? "text-primary" : "text-foreground/70")} aria-hidden="true" />
                  </div>

                  <h3 className="relative mt-6 font-display text-xl font-semibold tracking-[-0.01em] text-foreground sm:text-2xl">
                    {label}
                  </h3>
                  <p id={descId} className="relative mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
                    {desc}
                  </p>

                  <span className="relative mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
                    {isActive ? "In view" : "Enter"}
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
              );
            })}
          </ul>

          {/* Combined help text — visible on mobile, screen-reader-only on desktop */}
          <p
            id="ecosystem-navigator-help"
            className="mt-3 px-1 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground sm:sr-only"
          >
            <span className="sm:hidden">Swipe → to explore all {ITEMS.length} surfaces. </span>
            <span>Use arrow keys, Home or End to move between cards.</span>
          </p>
        </nav>
      </div>
    </section>
  );
}