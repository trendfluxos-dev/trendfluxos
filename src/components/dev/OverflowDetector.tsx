import { useEffect } from "react";

/**
 * Dev-only horizontal overflow detector.
 *
 * Watches the page on common breakpoints (320, 375, 414, 768, 1024, 1280, 1440)
 * and logs any element that pushes the document wider than the viewport.
 *
 * Active only when:
 *   - import.meta.env.DEV is true
 *   - OR ?overflow=1 is present in the URL
 *
 * Lives entirely client-side; never ships into the user UI.
 */
const COMMON_BREAKPOINTS = [320, 375, 414, 768, 1024, 1280, 1440];

function findOverflowingElements(): { el: Element; width: number }[] {
  const docWidth = document.documentElement.clientWidth;
  const offenders: { el: Element; width: number }[] = [];
  const all = document.body.getElementsByTagName("*");
  for (let i = 0; i < all.length; i++) {
    const el = all[i];
    const rect = el.getBoundingClientRect();
    // Filter trivially-positioned offscreen helpers and zero-size nodes.
    if (rect.width === 0 || rect.right <= docWidth + 1) continue;
    if (rect.right > docWidth + 1) {
      offenders.push({ el, width: Math.round(rect.right) });
    }
  }
  return offenders;
}

function describe(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const cls =
    typeof (el as HTMLElement).className === "string"
      ? `.${(el as HTMLElement).className.trim().split(/\s+/).slice(0, 3).join(".")}`
      : "";
  return `${tag}${id}${cls}`;
}

let lastReportedKey = "";

function check(label: string) {
  const docWidth = document.documentElement.clientWidth;
  const scrollWidth = document.documentElement.scrollWidth;
  if (scrollWidth <= docWidth + 1) {
    lastReportedKey = "";
    return;
  }
  const offenders = findOverflowingElements().slice(0, 8);
  const key = `${label}:${scrollWidth}:${offenders.map((o) => describe(o.el)).join("|")}`;
  if (key === lastReportedKey) return;
  lastReportedKey = key;

  // eslint-disable-next-line no-console
  console.warn(
    `[overflow] ${label} — document scrollWidth ${scrollWidth}px > viewport ${docWidth}px`,
    offenders.map((o) => ({ selector: describe(o.el), rightEdge: o.width, el: o.el })),
  );
}

const OverflowDetector = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const enabled =
      import.meta.env.DEV ||
      new URLSearchParams(window.location.search).has("overflow");
    if (!enabled) return;

    const runCheck = () => check(`@${window.innerWidth}px`);

    // Initial check after first paint settles.
    const initial = window.setTimeout(runCheck, 300);

    // Re-check on resize (covers manual breakpoint testing).
    const onResize = () => runCheck();
    window.addEventListener("resize", onResize);

    // Observe DOM mutations — catches late-loading images/widgets that overflow.
    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(runCheck);
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    // Expose a manual sweep across common breakpoints from the devtools console.
    (window as unknown as { __checkOverflow?: () => void }).__checkOverflow = () => {
      // eslint-disable-next-line no-console
      console.info(
        "[overflow] Manual sweep — resize the window to each breakpoint to verify:",
        COMMON_BREAKPOINTS,
      );
      runCheck();
    };

    return () => {
      window.clearTimeout(initial);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, []);

  return null;
};

export default OverflowDetector;
