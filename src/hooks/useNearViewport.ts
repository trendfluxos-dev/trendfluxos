import { RefObject, useEffect, useState } from "react";

/**
 * Returns `true` once the referenced element enters (or comes within
 * `rootMargin` of) the viewport, and stays `true` afterwards. Used to gate
 * media `preload` so audio/video only begin fetching metadata when the user
 * is actually about to see them — keeps initial page load fast without
 * adding any delay to playback when the user reaches the section.
 *
 * SSR-safe: when `IntersectionObserver` is missing (older browsers, SSR),
 * it falls back to `true` so behaviour degrades to "preload as normal".
 */
export function useNearViewport(
  ref: RefObject<Element | null>,
  rootMargin = "400px",
): boolean {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setNear(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin, threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);

  return near;
}
