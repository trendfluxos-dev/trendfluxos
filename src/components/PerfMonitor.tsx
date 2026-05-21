import { useEffect, useState } from "react";

/**
 * Dev-only FPS/jank monitor.
 * - Measures FPS via rAF deltas
 * - Counts jank frames (>50ms = dropped to <20fps)
 * - Logs scroll + hover sessions and prints a short summary
 * - Tiny on-screen overlay (bottom-left), togglable with Alt+P
 *
 * Never imported in production — App.tsx gates it behind import.meta.env.DEV.
 */
const JANK_MS = 50;       // frame longer than this counts as jank
const REPORT_MS = 5000;   // periodic console summary

const PerfMonitor = () => {
  const [visible, setVisible] = useState(true);
  const [stats, setStats] = useState({ fps: 60, jank: 0, worst: 0, mode: "idle" as "idle" | "scroll" | "hover" });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let frames = 0;
    let jank = 0;
    let worst = 0;
    let windowStart = last;
    let mode: "idle" | "scroll" | "hover" = "idle";
    let scrollUntil = 0;
    let hoverUntil = 0;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      frames++;
      if (dt > JANK_MS) jank++;
      if (dt > worst) worst = dt;

      if (now > scrollUntil && now > hoverUntil) mode = "idle";
      else if (now <= scrollUntil) mode = "scroll";
      else mode = "hover";

      if (now - windowStart >= 1000) {
        const fps = Math.round((frames * 1000) / (now - windowStart));
        setStats({ fps, jank, worst: Math.round(worst), mode });
        frames = 0;
        windowStart = now;
        worst = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    let reportJank = 0;
    let reportWorst = 0;
    const reportInterval = setInterval(() => {
      // Snapshot since last report
      const summary = {
        fps_now: stats.fps,
        jank_frames_since_last_report: jank - reportJank,
        worst_frame_ms: Math.max(worst, reportWorst),
        mode,
        href: window.location.pathname,
      };
      reportJank = jank;
      reportWorst = 0;
      // eslint-disable-next-line no-console
      console.info("[PerfMonitor]", summary);
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
      clearInterval(reportInterval);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  const tone =
    stats.fps >= 55 ? "text-emerald-400"
    : stats.fps >= 40 ? "text-amber-400"
    : "text-red-400";

  return (
    <div
      aria-hidden
      className="fixed bottom-3 left-3 z-[9999] pointer-events-none select-none rounded-md border border-white/15 bg-black/70 px-2.5 py-1.5 font-mono text-[10px] leading-tight text-white/85 backdrop-blur-sm shadow-lg"
      title="Alt+P to hide"
    >
      <div className="flex items-center gap-2">
        <span className={tone}>{stats.fps} fps</span>
        <span className="text-white/40">·</span>
        <span>jank {stats.jank}</span>
        <span className="text-white/40">·</span>
        <span>worst {stats.worst}ms</span>
        <span className="text-white/40">·</span>
        <span className="uppercase tracking-wider text-white/55">{stats.mode}</span>
      </div>
    </div>
  );
};

export default PerfMonitor;
