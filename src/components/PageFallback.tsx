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
    className="min-h-dvh bg-background"
  >
    {/* The only text node actually announced by AT. Everything visual
        below is decorative and hidden from the accessibility tree. */}
    <p className="sr-only">{message}</p>

    <div aria-hidden="true" role="presentation">
    <div className="border-b border-border/50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <div className="h-6 w-40 animate-pulse rounded-md bg-muted" />
        <div className="hidden gap-4 sm:flex">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-8 w-24 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
    <div className="mx-auto max-w-6xl px-5 py-16">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          <div className="h-12 w-11/12 animate-pulse rounded-lg bg-muted" />
          <div className="h-12 w-9/12 animate-pulse rounded-lg bg-muted" />
          <div className="h-12 w-6/12 animate-pulse rounded-lg bg-muted" />
          <div className="space-y-2 pt-3">
            <div className="h-3 w-full animate-pulse rounded bg-muted/70" />
            <div className="h-3 w-11/12 animate-pulse rounded bg-muted/70" />
            <div className="h-3 w-8/12 animate-pulse rounded bg-muted/70" />
          </div>
          <div className="flex gap-3 pt-4">
            <div className="h-11 w-44 animate-pulse rounded-full bg-muted" />
            <div className="h-11 w-56 animate-pulse rounded-full bg-muted/70" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-border/50 bg-muted/60"
            />
          ))}
        </div>
      </div>
      <div className="mt-10 flex items-center justify-center gap-3 text-xs text-muted-foreground">
        <div
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
        />
        <span aria-hidden="true">Loading…</span>
      </div>
    </div>
    </div>
  </div>
  );
};

export default PageFallback;