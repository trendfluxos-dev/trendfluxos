import { Skeleton } from "@/components/ui/skeleton";

export type SectionSkeletonVariant =
  | "band"
  | "cards"
  | "masonry"
  | "row"
  | "media"
  | "split";

/**
 * Lightweight section-shaped skeletons used as the IntersectionObserver
 * placeholder for each below-the-fold homepage section. Reserves the same
 * vertical rhythm as the real section to eliminate CLS, while signalling
 * "loading" to the user so the page never feels frozen.
 */
export function SectionSkeleton({ variant = "cards" }: { variant?: SectionSkeletonVariant }) {
  return (
    <section
      aria-hidden="true"
      className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10 lg:py-24"
    >
      {/* Eyebrow + title block — shared by every variant for visual rhythm */}
      <div className="mb-10 flex flex-col items-start gap-3">
        <Skeleton className="h-3 w-28 rounded-full" />
        <Skeleton className="h-7 w-2/3 max-w-xl rounded-md sm:h-9" />
        <Skeleton className="h-4 w-1/2 max-w-md rounded-md" />
      </div>

      {variant === "band" && <Skeleton className="h-24 w-full rounded-2xl" />}

      {variant === "cards" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {variant === "masonry" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-52 w-full rounded-2xl" />
          <Skeleton className="h-60 w-full rounded-2xl" />
        </div>
      )}

      {variant === "row" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {variant === "media" && (
        <Skeleton className="aspect-video w-full rounded-2xl" />
      )}

      {variant === "split" && (
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[320px_1fr]">
          <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-11/12 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </div>
        </div>
      )}
    </section>
  );
}

export default SectionSkeleton;