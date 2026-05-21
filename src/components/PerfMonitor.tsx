import { useEffect, useRef, useState } from "react";

/**
 * Dev-only FPS / jank / CLS monitor.
 *
 * - Measures FPS via rAF deltas
 * - Counts jank frames (>JANK_MS)
 * - Observes layout-shift entries (PerformanceObserver "layout-shift")
 * - Correlates CLS spikes with worst-frame spikes within a short window
 *   and logs the DOM nodes that shifted so you can pin down the culprit
 * - Tiny on-screen overlay (bottom-left), togglable with Alt+P
 *
 * Never imported in production — App.tsx gates it behind import.meta.env.DEV.
 */
const JANK_MS = 50;                // frame longer than this counts as jank
const REPORT_MS = 5000;            // periodic console summary
const CORRELATE_WINDOW_MS = 250;   // shift within this distance from worst frame = correlated
const SHIFT_LOG_THRESHOLD = 0.02;  // ignore micro shifts below this score

type Mode = "idle" | "scroll" | "hover";

interface ShiftRecord {
  t: number;          // performance.now() at end of shift
  value: number;      // layout-shift value
  nodes: string[];    // brief selector path of shifted sources
  mode: Mode;
}

interface FrameSpike {
  t: number;          // performance.now() at end of frame
  dt: number;         // frame duration (ms)
  mode: Mode;
}

const describeNode = (n: Node | null): string => {
  if (!n || !(n instanceof Element)) return "(unknown)";
  const el = n as Element;
  const id = el.id ? `#${el.id}` : "";
  const cls =
    typeof el.className === "string" && el.className
      ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".")
      : "";
  return `${el.tagName.toLowerCase()}${id}${cls}`;
};

const PerfMonitor = () => {
  const [visible, setVisible] = useState(true);
  const [stats, setStats] = useState({
    fps: 60,
    jank: 0,
    worst: 0,
    mode: "idle" as Mode,
    cls: 0,
    correlated: 0,
  });

  // Refs so the rAF loop / observer don't capture stale state
  const modeRef = useRef<Mode>("idle");
  const shiftsRef = useRef<ShiftRecord[]>([]);
  const spikesRef = useRef<FrameSpike[]>([]);
  const clsTotalRef = useRef(0);
  const correlatedRef = useRef(0);

  useEffect(() => {
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
      if (dt > JANK_MS) {
        jankTotal++;
        spikesRef.current.push({ t: now, dt, mode: modeRef.current });
        // Keep only recent spikes
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

    // ---- Layout-shift observer ----------------------------------------
    let shiftObserver: PerformanceObserver | null = null;
    try {
      shiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceEntry[]) {
          // @ts-expect-error - layout-shift entry fields not in TS lib
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
          // Trim
          const cutoff = t - 2000;
          shiftsRef.current = shiftsRef.current.filter((s) => s.t >= cutoff);

          if (value >= SHIFT_LOG_THRESHOLD) {
            // Correlate with any recent jank frame
            const spike = spikesRef.current.find(
              (s) => Math.abs(s.t - t) <= CORRELATE_WINDOW_MS,
            );
            if (spike) {
              correlatedRef.current++;
              // eslint-disable-next-line no-console
              console.warn(
                "[PerfMonitor] CLS ↔ jank correlated",
                {
                  shift_value: +value.toFixed(4),
                  frame_ms: Math.round(spike.dt),
                  mode: spike.mode,
                  nodes,
                  href: window.location.pathname,
                },
              );
            } else {
              // eslint-disable-next-line no-console
              console.info(
                "[PerfMonitor] layout shift",
                { value: +value.toFixed(4), mode: modeRef.current, nodes },
              );
            }
          }
        }
      });
      shiftObserver.observe({ type: "layout-shift", buffered: true });
    } catch {
      // Browser doesn't support layout-shift entries — silently skip
    }

    // ---- Periodic summary ----------------------------------------------
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
  }, []);

  if (!visible) return null;

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
      aria-hidden
      className="fixed bottom-3 left-3 z-[9999] pointer-events-none select-none rounded-md border border-white/15 bg-black/70 px-2.5 py-1.5 font-mono text-[10px] leading-tight text-white/85 backdrop-blur-sm shadow-lg"
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
      </div>
    </div>
  );
};

export default PerfMonitor;
