import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  /** Min height of placeholder so layout doesn't jump. */
  minHeight?: string;
  /** How far below the viewport to start mounting (IO rootMargin). */
  rootMargin?: string;
  /** Optional label for devtools. */
  label?: string;
  /** Optional skeleton shown both pre-mount AND as Suspense fallback. */
  skeleton?: ReactNode;
}

/**
 * Defers mounting + chunk download of a section until the user is
 * close to scrolling it into view. Combined with React.lazy children,
 * this means each below-the-fold section only downloads + renders
 * when it's about to be visible — keeping initial JS minimal and
 * preventing one slow section from blocking all others (each has its
 * own Suspense boundary).
 */
export function LazySection({
  children,
  minHeight = "40vh",
  rootMargin = "600px 0px",
  label,
  skeleton,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setMounted(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setMounted(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin, threshold: 0 },
    );
    io.observe(el);
    // Safety: ensure mount within 6s even if IO is flaky.
    const t = window.setTimeout(() => setMounted(true), 6000);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, [mounted, rootMargin]);

  const placeholder = skeleton ?? (
    <div aria-hidden style={{ minHeight }} />
  );

  return (
    <div ref={ref} data-lazy-section={label ?? undefined}>
      {mounted ? (
        <Suspense fallback={placeholder}>{children}</Suspense>
      ) : (
        placeholder
      )}
    </div>
  );
}

export default LazySection;