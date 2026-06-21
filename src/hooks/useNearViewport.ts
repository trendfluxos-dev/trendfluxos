import { RefObject, useEffect, useState } from "react";

/**
 * Safari (especially iOS) has historically shipped buggy IntersectionObserver
 * behaviour — entries can fire late, never fire for elements inside complex
 * stacking contexts, or report `isIntersecting` incorrectly after orientation
 * changes. Detect those engines and skip the observer entirely so media still
 * gets a safe `preload="metadata"` value.
 */
function isSafariOrIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (
    // iPadOS 13+ reports as Mac; disambiguate via touch points.
    /Macintosh/.test(ua) && typeof document !== "undefined" &&
    (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints! > 1
  );
  const isSafari = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(ua);
  return isIOS || isSafari;
}

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
  // On Safari/iOS, IntersectionObserver is unreliable for media gating.
  // Start as `true` so `preload="metadata"` is set immediately — matches
 // the pre-optimisation behaviour and guarantees smooth playback.
  const [near, setNear] = useState<boolean>(() => isSafariOrIOS());

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (near) return; // already enabled (Safari/iOS fast-path)
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

    // Safety net: if the observer never fires within 4s (rare Safari-on-Mac
    // edge cases, virtualised parents, display:contents ancestors, etc.),
    // flip to `true` so the user is never stuck without preloaded metadata.
    const fallback = window.setTimeout(() => setNear(true), 4000);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, [ref, rootMargin, near]);

  return near;
}
