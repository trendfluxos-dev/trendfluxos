import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Approx. height of the floating navbar so anchor targets aren't hidden underneath.
const NAV_OFFSET = 96;

export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Wait one frame so the target route has mounted.
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
      // Two RAFs to allow lazy-loaded route content to mount.
      requestAnimationFrame(() => requestAnimationFrame(scroll));
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;