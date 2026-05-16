import { useEffect, useState } from "react";

/**
 * Tracks which section id (from the provided list) is currently most
 * visible in the viewport. Returns the active id, or "" before any
 * section has crossed the threshold.
 */
export const useActiveSection = (
  ids: string[],
  options: { rootMargin?: string; threshold?: number } = {},
) => {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined" || ids.length === 0) return;

    const { rootMargin = "-40% 0px -55% 0px", threshold = 0 } = options;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (b.intersectionRatio || 0) - (a.intersectionRatio || 0),
          );
        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin, threshold },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join("|")]);

  return active;
};