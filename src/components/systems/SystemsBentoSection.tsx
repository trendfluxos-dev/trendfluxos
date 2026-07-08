import { Link } from "react-router-dom";
import { ArrowUpRight, Lock, Check } from "lucide-react";
import { TfSection } from "@/components/tf/Section";
import { SYSTEMS_PORTFOLIO, type SystemCase } from "@/data/systemsPortfolio";
import { getSystemLink } from "@/data/systemsLinkMap";
import { bentoTileId, narrativeCardId } from "@/data/systemsFilter";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  intro?: React.ReactNode;
  tone?: "light" | "muted";
  /**
   * Optional set of slugs that should be visually highlighted (and non-members
   * dimmed) — driven by an external FilterBar. `null`/omitted means "no
   * filter is active" and every tile renders at full strength.
   */
  highlightSlugs?: ReadonlySet<string> | null;
  /**
   * When true, both the bento grid and the narrative grid render pixel-stable
   * skeleton placeholders that match the real cards' dimensions — preventing
   * layout shift while systems data is being fetched.
   */
  loading?: boolean;
};

/**
 * Bento portfolio of the eight production systems shipped by
 * ZAHID HASAN EMON. Reused on the homepage, Founder page, and Portfolio
 * page — semantic tokens only, single H2 via <TfSection />.
 */
export const SystemsBentoSection = ({
  id = "systems-portfolio",
  eyebrow = "Systems He Built · Portfolio",
  title = "Eight production systems, one operating stack.",
  intro = "Six sub-brands plus two internal ops layers — each shipped, in production, and instrumented. Tap any tile to enter that system.",
  tone = "light",
  highlightSlugs = null,
  loading = false,
}: Props) => (
  <TfSection
    id={id}
    eyebrow={eyebrow}
    title={title}
    intro={intro}
    tone={tone}
    align="left"
  >
    <div className="mx-auto w-full max-w-7xl">
      {/*
        highlightSlugs is threaded down so tiles/cards can render dimmed when
        an external filter is active. `null` = no filter, all tiles bright.
      */}
      <ul
        className={cn(
          "grid gap-4 sm:gap-5",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-12",
          "auto-rows-[minmax(180px,auto)] lg:auto-rows-[minmax(200px,1fr)]",
        )}
        aria-label="Systems portfolio"
        aria-busy={loading || undefined}
      >
        {loading
          ? SYSTEMS_PORTFOLIO.map((s) => (
              <BentoTileSkeleton key={`${s.slug}-tile-skeleton`} size={s.size} />
            ))
          : SYSTEMS_PORTFOLIO.map((s) => (
              <BentoTile
                key={s.slug}
                system={s}
                state={resolveHighlight(s.slug, highlightSlugs)}
              />
            ))}
      </ul>

      {/* Narrative cards: 1–2 line case summary + What we built bullets.
          Grid: 1-col mobile → 2-col md → 3-col xl. `items-stretch` + h-full
          on each card keeps rows equal-height so nothing shifts as fonts load. */}
      <div className="mt-10 sm:mt-12">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Case notes · What we built
        </h3>
        <ul
          className={cn(
            "mt-5 grid items-stretch gap-4 sm:gap-5",
            "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
          )}
          aria-busy={loading || undefined}
        >
          {loading
            ? SYSTEMS_PORTFOLIO.map((s) => (
                <NarrativeCardSkeleton key={`${s.slug}-narrative-skeleton`} />
              ))
            : SYSTEMS_PORTFOLIO.map((s) => (
                <NarrativeCard
                  key={`${s.slug}-narrative`}
                  system={s}
                  state={resolveHighlight(s.slug, highlightSlugs)}
                />
              ))}
        </ul>
      </div>
    </div>
  </TfSection>
);

type HighlightState = "match" | "dim" | "neutral";

const resolveHighlight = (
  slug: string,
  highlightSlugs: ReadonlySet<string> | null,
): HighlightState => {
  if (!highlightSlugs) return "neutral";
  return highlightSlugs.has(slug) ? "match" : "dim";
};

const NarrativeCard = ({
  system,
  state = "neutral",
}: {
  system: SystemCase;
  state?: HighlightState;
}) => {
  const Icon = system.icon;
  const { href, linkLabel, internal: isInternal } = getSystemLink(system.slug);
  return (
    <li
      id={narrativeCardId(system.slug)}
      className={cn(
        // Stretch to fill the grid row so every card in a row is equal height.
        "group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl scroll-mt-28",
        "border border-border bg-card shadow-sm transition-colors hover:border-primary/40",
        // Uniform, consistent padding across breakpoints.
        "p-6",
        state === "match" &&
          "border-primary/60 shadow-[0_10px_30px_-18px_hsl(var(--primary)/0.55)] ring-1 ring-primary/40",
        state === "dim" && "opacity-45 saturate-75",
      )}
      data-highlight={state}
      aria-current={state === "match" ? "true" : undefined}
    >
      {/* top accent hairline */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-60"
      />

      {/* Header — icon + eyebrow + title. Fixed icon box prevents CLS. */}
      <header className="flex items-start gap-3">
        <span
          aria-hidden
          className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-primary/25 bg-primary/[0.06] text-primary"
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase leading-[1.4] tracking-[0.22em] text-muted-foreground">
            {system.eyebrow}
          </p>
          <h4 className="mt-1 font-display text-[15px] font-semibold leading-snug tracking-tight text-foreground">
            {system.title}
          </h4>
        </div>
      </header>

      {/* Summary — clamped to keep the header row and bullets aligned across
          cards. Reserves 3 lines of height so cards never jump as fonts load. */}
      <p
        className="mt-5 line-clamp-3 min-h-[calc(1.55em*3)] text-[13.5px] leading-[1.55] text-muted-foreground"
        title={system.summary}
      >
        {system.summary}
      </p>

      {/* Bullets pinned to the bottom so the "What we built" label sits at
          the same y across cards regardless of summary length. */}
      <div className="mt-5 flex flex-1 flex-col">
        <p className="text-[10px] font-medium uppercase leading-[1.4] tracking-[0.22em] text-foreground/70">
          What we built
        </p>
        <ul className="mt-3 space-y-2">
          {system.built.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-[13px] leading-[1.55] text-foreground/85"
            >
              <Check
                aria-hidden
                className="mt-[3px] h-3.5 w-3.5 shrink-0 text-primary"
              />
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ul>

        {/* "View case" CTA — routes to the correct sub-brand/detail page via
            the central systemsLinkMap. Internal systems render a non-clickable
            locked chip so the surface still communicates status. */}
        <div className="mt-5 pt-4 border-t border-border/70">
          {isInternal || !href ? (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              aria-label={`${system.title} — internal system`}
            >
              <Lock className="h-3.5 w-3.5" aria-hidden />
              {linkLabel}
            </span>
          ) : (
            <Link
              to={href}
              aria-label={`View case — ${system.title}`}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
            >
              View case
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </li>
  );
};

const SIZE_CLASSES: Record<SystemCase["size"], string> = {
  hero: "lg:col-span-8 lg:row-span-2",
  wide: "lg:col-span-4 lg:row-span-1",
  square: "lg:col-span-4 lg:row-span-1",
  half: "lg:col-span-6 lg:row-span-1",
};

const BentoTile = ({
  system,
  state = "neutral",
}: {
  system: SystemCase;
  state?: HighlightState;
}) => {
  const Icon = system.icon;
  const isHero = system.size === "hero";
  const { href, linkLabel, internal: isInternal } = getSystemLink(system.slug);

  const body = (
    <>
      {/* accent hairline */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60 transition-opacity group-hover:opacity-100"
      />
      {isHero && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_-10%,hsl(var(--primary)/0.12),transparent_55%)]"
        />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-grid place-items-center rounded-xl border border-primary/25 bg-primary/[0.06] text-primary transition-colors group-hover:border-primary/50",
            isHero ? "h-12 w-12" : "h-10 w-10",
          )}
        >
          <Icon className={isHero ? "h-6 w-6" : "h-5 w-5"} aria-hidden />
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {system.eyebrow}
        </span>
      </div>

      <div className="relative mt-5 flex flex-1 flex-col">
        <h3
          className={cn(
            "font-display font-semibold tracking-tight text-foreground",
            isHero ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl",
          )}
        >
          {system.title}
        </h3>
        <p
          className={cn(
            "mt-2 leading-relaxed text-muted-foreground",
            isHero ? "text-[15px] sm:text-base" : "text-sm",
          )}
        >
          {system.tagline}
        </p>

        {isHero && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {system.stack.map((chip) => (
              <li
                key={chip}
                className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] font-medium text-foreground/80"
              >
                {chip}
              </li>
            ))}
          </ul>
        )}

        <div
          className={cn(
            "mt-auto flex items-end justify-between gap-3 border-t border-border/70",
            isHero ? "pt-5" : "pt-4",
          )}
          style={{ marginTop: isHero ? "1.5rem" : "1rem" }}
        >
          <div>
            <p
              className={cn(
                "font-display font-semibold leading-none text-primary",
                isHero ? "text-3xl sm:text-4xl" : "text-2xl",
              )}
            >
              {system.outcome.metric}
            </p>
            <p className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {system.outcome.label}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors",
              isInternal
                ? "text-muted-foreground"
                : "text-primary group-hover:text-primary/80",
            )}
          >
            {isInternal ? (
              <>
                <Lock className="h-3.5 w-3.5" aria-hidden />
                {linkLabel}
              </>
            ) : (
              <>
                {linkLabel}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
              </>
            )}
          </span>
        </div>
      </div>
    </>
  );

  const surfaceClass = cn(
    "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all sm:p-6",
    !isInternal &&
      "hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    state === "match" &&
      "border-primary/60 shadow-[0_18px_45px_-24px_hsl(var(--primary)/0.6)] ring-1 ring-primary/50",
    state === "dim" && "opacity-45 saturate-75",
  );

  return (
    <li
      id={bentoTileId(system.slug)}
      className={cn("flex scroll-mt-28", SIZE_CLASSES[system.size])}
      data-highlight={state}
      aria-current={state === "match" ? "true" : undefined}
    >
      {isInternal || !href ? (
        <div
          className={cn(surfaceClass, "w-full")}
          aria-label={`${system.title} — internal system`}
        >
          {body}
        </div>
      ) : (
        <Link
          to={href}
          aria-label={`${system.title} — ${linkLabel}`}
          className={cn(surfaceClass, "w-full")}
        >
          {body}
        </Link>
      )}
    </li>
  );
};

export default SystemsBentoSection;