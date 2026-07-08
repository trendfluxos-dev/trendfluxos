/**
 * Full-page skeleton shown while a route's code chunk is loading AND
 * while any registered route-data loaders (see `useRouteDataLoading`)
 * are still pending. Kept visually identical to the previous inline
 * PageFallback so nothing shifts when routes swap.
 */
export const PageFallback = () => (
  <div
    role="status"
    aria-live="polite"
    aria-label="Loading page"
    className="min-h-dvh bg-background"
  >
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
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
        />
        <span>Loading…</span>
      </div>
    </div>
    <span className="sr-only">Loading page content…</span>
  </div>
);

export default PageFallback;