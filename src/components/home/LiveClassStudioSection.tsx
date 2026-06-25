import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Radio, Video, Users, Calendar, ArrowRight, MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  listLiveClasses,
  formatStartsAt,
  formatRelative,
  computeRuntimeStatus,
  type LiveClass,
} from "@/lib/liveClasses";
import { EDTECH } from "@/config/edtech";

/**
 * Homepage showcase for the TrendFlux Live Class Studio.
 * Pulls upcoming/live classes from the existing live_classes table
 * (public columns only — meeting URL stays gated) and links into the
 * full studio + watch flow under /edtech/live.
 */
export function LiveClassStudioSection() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listLiveClasses({ upcomingOnly: true })
      .then((rows) => {
        if (cancelled) return;
        setClasses(rows.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      aria-labelledby="live-studio-title"
      className="relative px-6 lg:px-10 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          {/* Pitch column */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Radio className="h-3.5 w-3.5" />
              Live Class Studio
            </div>
            <h2
              id="live-studio-title"
              className="mt-5 font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight"
            >
              Broadcast a real classroom —{" "}
              <span className="text-shimmer">whiteboard, slides, voice</span> —
              from one screen.
            </h2>
            <p className="mt-5 text-foreground/70 text-base sm:text-lg leading-relaxed max-w-xl">
              Schedule a class, share a join-link, and run live whiteboard +
              screen + slide sessions through the TrendFlux EdTech studio.
              Students join without an account; founders broadcast with full
              presenter controls.
            </p>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2 max-w-xl">
              {[
                { icon: MonitorPlay, label: "Whiteboard + slides + screen" },
                { icon: Users, label: "No-account share-link join" },
                { icon: Video, label: "Recorded materials library" },
                { icon: Calendar, label: "RSVP + reminder system" },
              ].map((f) => (
                <li key={f.label} className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <f.icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  {f.label}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to={EDTECH.routes.live}>
                  Open Live Studio
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to={EDTECH.routes.adminLive}>Schedule a Class</Link>
              </Button>
            </div>
          </div>

          {/* Upcoming classes column */}
          <div className="rounded-2xl border border-border bg-card/40 backdrop-blur p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/70">
                Upcoming Live Sessions
              </h3>
              <Link
                to={EDTECH.routes.live}
                className="text-xs font-semibold text-primary hover:underline"
              >
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-20 rounded-lg bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : classes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-foreground/60">
                No live sessions scheduled yet. Check back soon.
              </div>
            ) : (
              <ul className="space-y-3">
                {classes.map((c) => {
                  const runtime = computeRuntimeStatus(c);
                  const isLive = runtime === "live";
                  return (
                    <li key={c.id}>
                      <Link
                        to={EDTECH.routes.liveWatch(c.id)}
                        className="group block rounded-lg border border-border bg-background/60 p-4 transition-all hover:border-primary/40 hover:bg-background"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {isLive ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-500">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                  Live now
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                                  {formatRelative(c.starts_at)}
                                </span>
                              )}
                              <span className="text-[10px] text-foreground/50">
                                · {c.duration_min}m
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {c.title}
                            </p>
                            <p className="text-xs text-foreground/60 mt-0.5 truncate">
                              {c.host_name} · {formatStartsAt(c.starts_at)}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LiveClassStudioSection;