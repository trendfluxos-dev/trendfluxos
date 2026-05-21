import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Activity, RefreshCw } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";

type Sample = {
  id: string;
  metric: "LCP" | "INP" | "CLS" | "FCP" | "TTFB" | string;
  value: number;
  rating: string | null;
  path: string | null;
  release: string | null;
  created_at: string;
};

const METRICS = ["LCP", "INP", "CLS", "FCP", "TTFB"] as const;

// Google "good" thresholds.
const THRESHOLDS: Record<string, { good: number; poor: number; unit: string }> = {
  LCP: { good: 2500, poor: 4000, unit: "ms" },
  INP: { good: 200, poor: 500, unit: "ms" },
  CLS: { good: 0.1, poor: 0.25, unit: "" },
  FCP: { good: 1800, poor: 3000, unit: "ms" },
  TTFB: { good: 800, poor: 1800, unit: "ms" },
};

const fmt = (m: string, v: number) => {
  const t = THRESHOLDS[m];
  if (m === "CLS") return v.toFixed(3);
  return `${Math.round(v)}${t?.unit ?? ""}`;
};

const percentile = (arr: number[], p: number) => {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
};

const ratingColor = (m: string, v: number) => {
  const t = THRESHOLDS[m];
  if (!t) return "text-muted-foreground";
  if (v <= t.good) return "text-emerald-500";
  if (v <= t.poor) return "text-amber-500";
  return "text-destructive";
};

export default function WebVitalsAdmin() {
  useSeo({
    title: "Web Vitals — TrendFlux Internal",
    description: "Core Web Vitals trends from production traffic.",
    noindex: true,
  });

  const [rows, setRows] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  const load = async () => {
    setLoading(true);
    setErr(null);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("web_vitals")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) setErr(error.message);
    else setRows((data ?? []) as Sample[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const stats = useMemo(() => {
    const out: Record<string, { p75: number; count: number; series: { t: number; v: number }[] }> = {};
    for (const m of METRICS) {
      const samples = rows.filter((r) => r.metric === m);
      const vals = samples.map((s) => s.value);
      // Bucket by hour for the trend line.
      const buckets = new Map<number, number[]>();
      for (const s of samples) {
        const bucket = Math.floor(new Date(s.created_at).getTime() / (60 * 60 * 1000));
        if (!buckets.has(bucket)) buckets.set(bucket, []);
        buckets.get(bucket)!.push(s.value);
      }
      const series = [...buckets.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([bucket, vs]) => ({ t: bucket * 60 * 60 * 1000, v: percentile(vs, 75) }));
      out[m] = { p75: percentile(vals, 75), count: samples.length, series };
    }
    return out;
  }, [rows]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container max-w-6xl py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Admin
          </Link>
          <div className="flex items-center gap-2">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="rounded-md border bg-background px-2 py-1 text-sm"
            >
              <option value={1}>Last 24h</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
            </select>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Activity className="h-6 w-6 text-primary" /> Web Vitals
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-user LCP, INP, CLS, FCP, and TTFB from production traffic. p75 values per metric.
          </p>
        </div>

        {err && (
          <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {err}
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {METRICS.map((m) => {
            const s = stats[m];
            return (
              <div key={m} className="rounded-lg border bg-card p-4">
                <div className="text-xs uppercase text-muted-foreground">{m}</div>
                <div className={`mt-1 text-2xl font-semibold ${ratingColor(m, s.p75)}`}>
                  {s.count ? fmt(m, s.p75) : "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  p75 · {s.count} samples
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {METRICS.map((m) => {
            const s = stats[m];
            return (
              <div key={m} className="rounded-lg border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">{m} trend (p75 per hour)</h2>
                  <span className="text-xs text-muted-foreground">
                    good ≤ {fmt(m, THRESHOLDS[m].good)}
                  </span>
                </div>
                <div className="h-48">
                  {s.series.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No samples yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={s.series}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="t"
                          tickFormatter={(t) =>
                            new Date(t).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })
                          }
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            fontSize: 12,
                          }}
                          labelFormatter={(t) => new Date(Number(t)).toLocaleString()}
                          formatter={(v: number) => fmt(m, v)}
                        />
                        <Line
                          type="monotone"
                          dataKey="v"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
