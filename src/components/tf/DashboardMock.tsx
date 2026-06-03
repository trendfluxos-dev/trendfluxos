import { ArrowUpRight, Activity, Zap, Users, TrendingUp } from "lucide-react";

/**
 * Static-but-living dashboard mockup. Bars animate in on mount; sparkline
 * pulses; KPIs read like an ops dashboard, not a marketing landing card.
 */
const DashboardMock = () => {
  const bars = [38, 52, 44, 68, 60, 82, 74, 91, 86, 96, 88, 100];
  return (
    <div className="relative w-full">
      {/* outer glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/15 via-primary/5 to-transparent blur-3xl"
      />
      {/* orbit ring */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10 tf-orbit-slow opacity-30"
      >
        <div className="absolute inset-0 rounded-full border border-dashed border-foreground/10" />
      </div>

      <div className="relative rounded-2xl border border-border bg-card/95 p-3.5 shadow-xl backdrop-blur-xl sm:p-4">
        {/* window chrome */}
        <div className="mb-3.5 flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
          </div>
          <div className="hidden items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground sm:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            trendflux.os · live
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
          {[
            { label: "ROAS", value: "4.82x", delta: "+18%", icon: TrendingUp },
            { label: "CPL", value: "$3.12", delta: "−42%", icon: Activity },
            { label: "Pipeline", value: "$284K", delta: "+31%", icon: Users },
            { label: "Automations", value: "27", delta: "live", icon: Zap },
          ].map((k, i) => (
            <div
              key={k.label}
              className="tf-rise rounded-xl border border-border bg-muted/50 p-3 transition-colors duration-300 hover:border-primary/30 hover:bg-muted"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>{k.label}</span>
                <k.icon className="h-3 w-3 text-primary" />
              </div>
              <div className="mt-1.5 font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {k.value}
              </div>
              <div className="mt-0.5 text-[10px] font-medium text-emerald-600">
                {k.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="mt-2.5 rounded-xl border border-border bg-muted/50 p-3.5 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Pipeline velocity
              </div>
              <div className="mt-0.5 font-display text-sm font-medium text-foreground">
                Last 12 weeks
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              <ArrowUpRight className="h-3 w-3" /> +162%
            </span>
          </div>
          <div className="flex h-24 items-end gap-1.5 sm:h-28">
            {bars.map((h, i) => (
              <div
                key={i}
                className="tf-bar flex-1 rounded-t-[3px] bg-gradient-to-t from-primary/30 via-primary/70 to-primary/90 shadow-[0_0_18px_-4px_rgba(220,38,38,0.4)]"
                style={{ height: `${h}%`, animationDelay: `${i * 55}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Workflow row */}
        <div className="mt-2.5 grid grid-cols-4 gap-1.5 text-center text-[10px] text-muted-foreground sm:text-[11px]">
          {["Lead", "Enrich", "Score", "Route"].map((s, i) => (
            <div
              key={s}
              className="tf-rise rounded-md border border-border bg-muted/50 px-2 py-1.5 transition-colors hover:border-primary/30"
              style={{ animationDelay: `${600 + i * 70}ms` }}
            >
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                Step {i + 1}
              </div>
              <div className="font-medium text-foreground">{s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardMock;
