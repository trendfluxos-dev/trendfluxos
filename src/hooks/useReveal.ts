import { useEffect, useRef } from "react";

/**
 * Adds `.is-visible` to elements with `.reveal` once they enter the viewport.
 * Pair with the `.reveal` utility in index.css for smooth scroll reveals.
 */
export function useReveal<T extends HTMLElement = HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      node.classList.add("is-visible");
      return;
    }
    const targets = node.classList.contains("reveal")
      ? [node, ...Array.from(node.querySelectorAll<HTMLElement>(".reveal"))]
      : Array.from(node.querySelectorAll<HTMLElement>(".reveal"));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px", ...options },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [options]);

  return ref;
}
