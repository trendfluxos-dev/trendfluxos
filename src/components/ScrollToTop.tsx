import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Approx. height of the floating navbar so anchor targets aren't hidden underneath.
const NAV_OFFSET = 96;

/**
 * Per-page scroll restoration.
 * - PUSH/REPLACE navigation → scroll to top (or to hash anchor if present).
 * - POP (browser back/forward) → restore the position the user was at on that page.
 * - Saves the current scroll position before navigating away.
 */
export const ScrollToTop = () => {
  const { pathname, hash, key } = useLocation();
  const navType = useNavigationType();
  const positions = useRef<Map<string, number>>(new Map());
  const lastKey = useRef<string>(key);

  // Disable the browser's built-in scroll restoration so ours is authoritative.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      const prev = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      return () => { window.history.scrollRestoration = prev; };
    }
  }, []);

  useEffect(() => {
    // Save scroll position for the page we're leaving.
    return () => {
      positions.current.set(lastKey.current, window.scrollY);
    };
  }, [key]);

  useEffect(() => {
    const prevKey = lastKey.current;
    lastKey.current = key;
    // Persist outgoing position synchronously too (covers fast successive navs).
    if (prevKey !== key) positions.current.set(prevKey, window.scrollY);

    if (hash) {
      const id = hash.replace(/^#/, "");
      const scroll = () => {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
          window.scrollTo({ top, left: 0, behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
        }
      };
      requestAnimationFrame(() => requestAnimationFrame(scroll));
      return;
    }

    if (navType === "POP") {
      const saved = positions.current.get(key) ?? 0;
      // Two RAFs so lazy route content has a chance to mount and restore height.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          window.scrollTo({ top: saved, left: 0, behavior: "instant" as ScrollBehavior });
        }),
      );
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash, key, navType]);

  return null;
};

export default ScrollToTop;