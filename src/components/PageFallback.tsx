/**
 * Full-page skeleton shown while a route's code chunk is loading AND
 * while any registered route-data loaders (see `useRouteDataLoading`)
 * are still pending. Kept visually identical to the previous inline
 * PageFallback so nothing shifts when routes swap.
 *
 * Screen-reader semantics:
 *   - `role="status"` + `aria-live="polite"` + `aria-atomic="true"`
 *     ensures the announcement is queued once, not letter-by-letter as
 *     skeleton blocks mount.
 *   - `aria-busy="true"` on the container tells AT that this region is
 *     currently updating, so decorative skeleton nodes aren't announced
 *     as content.
 *   - Decorative pulse blocks are `aria-hidden` and `role="presentation"`
 *     so JAWS/NVDA/VoiceOver skip them entirely.
 *   - A single visually-hidden `<p>` carries the human-readable label
 *     ("Loading page content, please wait…") which is what actually
 *     gets announced during navigation.
 */
type PageFallbackProps = {
  /** Optional context appended to the announcement, e.g. "dashboard". */
  label?: string;
};

/**
 * Skeleton block with:
 *   - frosted glass fill (semantic muted token + backdrop blur)
 *   - a hairline top-light border for depth
 *   - a slow sheen sweeping left→right via `animate-skeleton-shimmer`
 *
 * All classes use semantic tokens so the block inherits the premium
 * dark palette (and looks correct in light mode) without hardcoded hex.
 */
const Shimmer = ({ className = "" }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={`relative overflow-hidden rounded-md border border-border/40 bg-muted/40 backdrop-blur-sm ${className}`}
  >
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
    <div className="absolute inset-0 -translate-x-full animate-skeleton-shimmer bg-gradient-to-r from-transparent via-foreground/[0.08] to-transparent" />
  </div>
);

export const PageFallback = ({ label }: PageFallbackProps = {}) => {
  const message = label
    ? `Loading ${label}, please wait…`
    : "Loading page content, please wait…";
  return (
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    aria-busy="true"
    aria-label={message}
    data-testid="page-fallback"
    className="relative isolate min-h-dvh overflow-hidden bg-background text-foreground"
  >
    {/* The only text node actually announced by AT. Everything visual
        below is decorative and hidden from the accessibility tree. */}
    <p className="sr-only">{message}</p>

    {/* Ambient background: two drifting glow orbs + a hairline grid.
        Sits behind the glass surface to give the dark theme depth. */}
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-40 left-1/4 h-[520px] w-[520px] animate-glow-drift rounded-full bg-primary/[0.10] blur-[140px]" />
      <div
        className="absolute -bottom-40 right-1/4 h-[440px] w-[440px] animate-glow-drift rounded-full bg-accent/[0.08] blur-[120px]"
        style={{ animationDelay: "-7s" }}
      />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />
    </div>

    <div aria-hidden="true" role="presentation">
      {/* Glass nav bar */}
      <div className="border-b border-border/40 bg-background/40 backdrop-blur-xl supports-[backdrop-filter]:bg-background/30">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Shimmer className="h-6 w-40" />
          <div className="hidden gap-4 sm:flex">
            <Shimmer className="h-4 w-16" />
            <Shimmer className="h-4 w-16" />
            <Shimmer className="h-4 w-16" />
          </div>
          <Shimmer className="h-8 w-24 rounded-full" />
        </div>
      </div>

      {/* Frosted glass hero panel */}
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/40 p-6 shadow-[0_20px_60px_-20px_hsl(var(--foreground)/0.35)] backdrop-blur-2xl supports-[backdrop-filter]:bg-card/25 sm:p-10">
          {/* Top light edge for glass depth */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />

          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-5">
              <Shimmer className="h-4 w-40" />
              <Shimmer className="h-12 w-11/12 rounded-lg" />
              <Shimmer className="h-12 w-9/12 rounded-lg" />
              <Shimmer className="h-12 w-6/12 rounded-lg" />
              <div className="space-y-2 pt-3">
                <Shimmer className="h-3 w-full" />
                <Shimmer className="h-3 w-11/12" />
                <Shimmer className="h-3 w-8/12" />
              </div>
              <div className="flex gap-3 pt-4">
                <Shimmer className="h-11 w-44 rounded-full" />
                <Shimmer className="h-11 w-56 rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Shimmer key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <div
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-primary/70 border-t-transparent"
            />
            <span aria-hidden="true" className="font-mono tracking-[0.2em] uppercase">
              Loading
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default PageFallback;