import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Dev-only FPS / jank / CLS monitor.
 *
 * - Mounts only on a small allow-list of main marketing routes
 * - Measures FPS, jank frames, layout shifts, and their correlation
 * - Tiny on-screen overlay (bottom-left), togglable with Alt+P
 * - DEV "Export" button downloads the current session summary as JSON
 *   so low-end runs can be diffed offline.
 *
 * Never imported in production — App.tsx gates it behind import.meta.env.DEV.
 */
const JANK_MS = 50;
const REPORT_MS = 5000;
const CORRELATE_WINDOW_MS = 250;
const SHIFT_LOG_THRESHOLD = 0.02;

// Routes where the perf overlay is allowed to mount.
// Exact matches or "prefix*" patterns.
const ALLOWED_ROUTES = [
  "/",
  "/enterprise",
  "/portfolio",
  "/toolkit",
  "/masterclass",
  "/course/trendflux",
  "/case-studies/*",
];

const routeAllowed = (pathname: string) =>
  ALLOWED_ROUTES.some((p) =>
    p.endsWith("/*") ? pathname.startsWith(p.slice(0, -1)) : pathname === p,
  );

type Mode = "idle" | "scroll" | "hover";

interface ShiftRecord { t: number; value: number; nodes: string[]; mode: Mode }
interface FrameSpike { t: number; dt: number; mode: Mode }
interface ModeBucket { frames: number; jank: number; worst: number; durationMs: number }

/**
 * Build a precise, copy-pasteable description of a DOM node:
 *  - full CSS-ish selector path (up to 6 ancestors) with :nth-of-type
 *  - data-testid / data-component / data-* hints when present
 *  - React component owner name (read from the internal Fiber when available)
 *  - bounding rect (so you can correlate with where it shifted on screen)
 */
const fiberKey = (el: any): string | undefined =>
  Object.keys(el).find(
    (k) => k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$"),
  );

const reactOwnerName = (el: Element): string | null => {
  try {
    const key = fiberKey(el as any);
    if (!key) return null;
    let fiber: any = (el as any)[key];
    // Walk up fibers to find the nearest function/class component owner
    while (fiber) {
      const t = fiber.type;
      if (t && typeof t !== "string") {
        const name = t.displayName || t.name || t.render?.displayName || t.render?.name;
        if (name && name !== "Unknown") return name;
      }
      fiber = fiber.return;
    }
  } catch {
    /* noop */
  }
  return null;
};

const shortSelector = (el: Element): string => {
  const tag = el.tagName.toLowerCase();
  if (el.id) return `${tag}#${CSS.escape(el.id)}`;
  const cls =
    typeof el.className === "string" && el.className
      ? "." +
        el.className
          .trim()
          .split(/\s+/)
          .filter((c) => !/^(hover:|md:|lg:|xl:|sm:|focus:|dark:)/.test(c))
          .slice(0, 2)
          .map((c) => CSS.escape(c))
          .join(".")
      : "";
  const parent = el.parentElement;
  let nth = "";
  if (parent) {
    const siblings = Array.from(parent.children).filter((c) => c.tagName === el.tagName);
    if (siblings.length > 1) nth = `:nth-of-type(${siblings.indexOf(el) + 1})`;
  }
  return `${tag}${cls}${nth}`;
};

const domPath = (el: Element, maxDepth = 6): string => {
  const parts: string[] = [];
  let cur: Element | null = el;
  let depth = 0;
  while (cur && cur !== document.body && depth < maxDepth) {
    parts.unshift(shortSelector(cur));
    cur = cur.parentElement;
    depth++;
  }
  return parts.join(" > ");
};

const dataHints = (el: Element): string => {
  const keys = ["data-testid", "data-component", "data-id", "data-section", "aria-label", "role"];
  const hits: string[] = [];
  for (const k of keys) {
    const v = el.getAttribute(k);
    if (v) hits.push(`[${k}="${v.slice(0, 40)}"]`);
  }
  return hits.join("");
};

const describeNode = (n: Node | null): string => {
  if (!n) return "(unknown)";
  // PerformanceLayoutShift sources may include Text/Comment nodes — climb to element
  let el: Element | null =
    n instanceof Element ? n : n.parentElement;
  if (!el) return "(non-element)";

  const path = domPath(el);
  const hints = dataHints(el);
  const owner = reactOwnerName(el);
  let rect = "";
  try {
    const r = el.getBoundingClientRect();
    rect = ` @${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}×${Math.round(r.height)}`;
  } catch {
    /* noop */
  }
  return `${path}${hints}${owner ? ` <${owner}>` : ""}${rect}`;
};


const emptyBucket = (): ModeBucket => ({ frames: 0, jank: 0, worst: 0, durationMs: 0 });

const PerfMonitor = () => {
  const { pathname } = useLocation();
  const allowed = routeAllowed(pathname);

  const [visible, setVisible] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [stats, setStats] = useState({
    fps: 60, jank: 0, worst: 0, mode: "idle" as Mode, cls: 0, correlated: 0,
  });

  const modeRef = useRef<Mode>("idle");
  const shiftsRef = useRef<ShiftRecord[]>([]);
  const spikesRef = useRef<FrameSpike[]>([]);
  const clsTotalRef = useRef(0);
  const correlatedRef = useRef(0);

  // Session aggregation (for export)
  const sessionStartRef = useRef<number>(performance.now());
  const buckets = useRef<Record<Mode, ModeBucket>>({
    idle: emptyBucket(), scroll: emptyBucket(), hover: emptyBucket(),
  });
  const allSpikesRef = useRef<FrameSpike[]>([]);
  const allShiftsRef = useRef<ShiftRecord[]>([]);
  const correlationsRef = useRef<
    Array<{ t: number; shift_value: number; frame_ms: number; mode: Mode; nodes: string[] }>
  >([]);
  const routeRef = useRef(pathname);

  useEffect(() => {
    if (!allowed) return;

    routeRef.current = pathname;
    sessionStartRef.current = performance.now();
    buckets.current = { idle: emptyBucket(), scroll: emptyBucket(), hover: emptyBucket() };
    allSpikesRef.current = [];
    allShiftsRef.current = [];
    correlationsRef.current = [];
    clsTotalRef.current = 0;
    correlatedRef.current = 0;

    let raf = 0;
    let last = performance.now();
    let frames = 0;
    let jankTotal = 0;
    let worstWindow = 0;
    let windowStart = last;
    let scrollUntil = 0;
    let hoverUntil = 0;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      frames++;

      const m = modeRef.current;
      const b = buckets.current[m];
      b.frames++;
      b.durationMs += dt;
      if (dt > b.worst) b.worst = dt;

      if (dt > JANK_MS) {
        jankTotal++;
        b.jank++;
        const spike: FrameSpike = { t: now, dt, mode: m };
        spikesRef.current.push(spike);
        allSpikesRef.current.push(spike);
        const cutoff = now - 2000;
        spikesRef.current = spikesRef.current.filter((s) => s.t >= cutoff);
      }
      if (dt > worstWindow) worstWindow = dt;

      if (now > scrollUntil && now > hoverUntil) modeRef.current = "idle";
      else if (now <= scrollUntil) modeRef.current = "scroll";
      else modeRef.current = "hover";

      if (now - windowStart >= 1000) {
        const fps = Math.round((frames * 1000) / (now - windowStart));
        setStats({
          fps,
          jank: jankTotal,
          worst: Math.round(worstWindow),
          mode: modeRef.current,
          cls: +clsTotalRef.current.toFixed(3),
          correlated: correlatedRef.current,
        });
        frames = 0;
        windowStart = now;
        worstWindow = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    let shiftObserver: PerformanceObserver | null = null;
    try {
      shiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceEntry[]) {
          // @ts-expect-error - layout-shift fields not in TS lib
          if (entry.hadRecentInput) continue;
          // @ts-expect-error
          const value: number = entry.value ?? 0;
          // @ts-expect-error
          const sources: Array<{ node: Node | null }> = entry.sources ?? [];
          const nodes = sources.slice(0, 3).map((s) => describeNode(s.node));
          const t = performance.now();

          clsTotalRef.current += value;
          const rec: ShiftRecord = { t, value, nodes, mode: modeRef.current };
          shiftsRef.current.push(rec);
          allShiftsRef.current.push(rec);
          const cutoff = t - 2000;
          shiftsRef.current = shiftsRef.current.filter((s) => s.t >= cutoff);

          if (value >= SHIFT_LOG_THRESHOLD) {
            const spike = spikesRef.current.find(
              (s) => Math.abs(s.t - t) <= CORRELATE_WINDOW_MS,
            );
            if (spike) {
              correlatedRef.current++;
              correlationsRef.current.push({
                t, shift_value: value, frame_ms: spike.dt, mode: spike.mode, nodes,
              });
              // eslint-disable-next-line no-console
              console.warn("[PerfMonitor] CLS ↔ jank correlated", {
                shift_value: +value.toFixed(4),
                frame_ms: Math.round(spike.dt),
                mode: spike.mode,
                nodes,
                href: window.location.pathname,
              });
            } else {
              // eslint-disable-next-line no-console
              console.info("[PerfMonitor] layout shift", {
                value: +value.toFixed(4), mode: modeRef.current, nodes,
              });
            }
          }
        }
      });
      shiftObserver.observe({ type: "layout-shift", buffered: true });
    } catch { /* unsupported */ }

    let lastReportJank = 0;
    let lastReportCls = 0;
    let lastReportCorrelated = 0;
    const reportInterval = window.setInterval(() => {
      // eslint-disable-next-line no-console
      console.info("[PerfMonitor] summary", {
        href: window.location.pathname,
        mode: modeRef.current,
        jank_since_last: jankTotal - lastReportJank,
        cls_since_last: +(clsTotalRef.current - lastReportCls).toFixed(4),
        cls_total: +clsTotalRef.current.toFixed(4),
        correlated_since_last: correlatedRef.current - lastReportCorrelated,
        correlated_total: correlatedRef.current,
      });
      lastReportJank = jankTotal;
      lastReportCls = clsTotalRef.current;
      lastReportCorrelated = correlatedRef.current;
    }, REPORT_MS);

    const onScroll = () => { scrollUntil = performance.now() + 250; };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hoverUntil = performance.now() + 150;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "p" || e.key === "P")) setVisible((v) => !v);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(reportInterval);
      shiftObserver?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [allowed, pathname, resetKey]);

  if (!allowed || !visible) return null;

  const exportSession = () => {
    const now = performance.now();
    const bucket = (m: Mode) => {
      const b = buckets.current[m];
      const avgFps = b.durationMs > 0 ? +((b.frames * 1000) / b.durationMs).toFixed(1) : 0;
      return { ...b, worst: Math.round(b.worst), durationMs: Math.round(b.durationMs), avgFps };
    };
    const payload = {
      generated_at: new Date().toISOString(),
      route: routeRef.current,
      user_agent: navigator.userAgent,
      viewport: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio },
      session_ms: Math.round(now - sessionStartRef.current),
      totals: {
        cls: +clsTotalRef.current.toFixed(4),
        jank_frames: allSpikesRef.current.length,
        correlated_shifts: correlatedRef.current,
        layout_shifts: allShiftsRef.current.length,
      },
      by_mode: { idle: bucket("idle"), scroll: bucket("scroll"), hover: bucket("hover") },
      worst_frames: [...allSpikesRef.current]
        .sort((a, b) => b.dt - a.dt)
        .slice(0, 20)
        .map((s) => ({ t: Math.round(s.t), frame_ms: Math.round(s.dt), mode: s.mode })),
      top_shifts: [...allShiftsRef.current]
        .sort((a, b) => b.value - a.value)
        .slice(0, 20)
        .map((s) => ({ t: Math.round(s.t), value: +s.value.toFixed(4), mode: s.mode, nodes: s.nodes })),
      correlations: correlationsRef.current.map((c) => ({
        t: Math.round(c.t),
        shift_value: +c.shift_value.toFixed(4),
        frame_ms: Math.round(c.frame_ms),
        mode: c.mode,
        nodes: c.nodes,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeRoute = routeRef.current.replace(/[^a-z0-9]+/gi, "_") || "root";
    a.href = url;
    a.download = `perf-session_${safeRoute}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const fpsTone =
    stats.fps >= 55 ? "text-emerald-400"
    : stats.fps >= 40 ? "text-amber-400"
    : "text-red-400";
  const clsTone =
    stats.cls < 0.1 ? "text-emerald-400"
    : stats.cls < 0.25 ? "text-amber-400"
    : "text-red-400";

  return (
    <div
      className="fixed bottom-3 left-3 z-[9999] select-none rounded-md border border-white/15 bg-black/70 px-2.5 py-1.5 font-mono text-[10px] leading-tight text-white/85 backdrop-blur-sm shadow-lg"
      title="Alt+P to hide"
    >
      <div className="flex items-center gap-2">
        <span className={fpsTone}>{stats.fps} fps</span>
        <span className="text-white/40">·</span>
        <span>jank {stats.jank}</span>
        <span className="text-white/40">·</span>
        <span>worst {stats.worst}ms</span>
        <span className="text-white/40">·</span>
        <span className={clsTone}>CLS {stats.cls.toFixed(3)}</span>
        <span className="text-white/40">·</span>
        <span title="CLS shifts correlated with jank frames">↔ {stats.correlated}</span>
        <span className="text-white/40">·</span>
        <span className="uppercase tracking-wider text-white/55">{stats.mode}</span>
        <button
          type="button"
          onClick={() => {
            shiftsRef.current = [];
            spikesRef.current = [];
            setStats({ fps: 60, jank: 0, worst: 0, mode: "idle", cls: 0, correlated: 0 });
            setResetKey((k) => k + 1);
            // eslint-disable-next-line no-console
            console.info("[PerfMonitor] session reset");
          }}
          className="ml-1 rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white/90 hover:bg-white/20"
          title="Clear FPS / jank / CLS and start fresh"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={exportSession}
          className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white/90 hover:bg-white/20"
          title="Download session summary as JSON"
        >
          Export
        </button>
      </div>
    </div>
  );
};

export default PerfMonitor;
