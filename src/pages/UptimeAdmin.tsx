import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, CheckCircle2, XCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";

type Check = {
  id: string;
  url: string;
  ok: boolean;
  status_code: number | null;
  latency_ms: number | null;
  error: string | null;
  checked_at: string;
};

export default function UptimeAdmin() {
  useSeo({
    title: "Uptime Monitor — TrendFlux Internal",
    description: "Production uptime history for trendflux.digital.",
    noindex: true,
  });

  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pinging, setPinging] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("uptime_checks")
      .select("*")
      .order("checked_at", { ascending: false })
      .limit(100);
    if (error) setError(error.message);
    else setChecks((data ?? []) as Check[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Live updates
  useEffect(() => {
    const channel = supabase
      .channel("uptime_checks_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "uptime_checks" },
        (payload) => {
          setChecks((prev) => [payload.new as Check, ...prev].slice(0, 100));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const runNow = async () => {
    setPinging(true);
    try {
      await supabase.functions.invoke("uptime-monitor", { body: {} });
      await load();
    } finally {
      setPinging(false);
    }
  };

  const stats = useMemo(() => {
    if (checks.length === 0) {
      return { uptime: 0, avgLatency: 0, last: null as Check | null };
    }
    const okCount = checks.filter((c) => c.ok).length;
    const avgLatency = Math.round(
      checks.reduce((a, c) => a + (c.latency_ms ?? 0), 0) / checks.length,
    );
    return {
      uptime: (okCount / checks.length) * 100,
      avgLatency,
      last: checks[0],
    };
  }, [checks]);

  return (
    <main className="min-h-screen bg-background px-6 py-12 md:px-12 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-foreground/60 hover:text-gold"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Admin
            </Link>
            <h1 className="font-display mt-3 text-3xl font-bold md:text-4xl">
              Uptime Monitor
            </h1>
            <p className="mt-2 text-sm text-foreground/60">
              Probes <span className="text-gold">trendflux.digital</span> every 5 minutes.
              Alerts sent to Telegram on state changes.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={runNow} disabled={pinging}>
            <RefreshCw className={`h-4 w-4 ${pinging ? "animate-spin" : ""}`} />
            {pinging ? "Probing…" : "Run now"}
          </Button>
        </div>

        {/* Current status */}
        {stats.last && (
          <div
            className={`mb-8 flex items-center gap-4 rounded-2xl border p-6 ${
              stats.last.ok
                ? "border-gold/40 bg-gold/[0.05]"
                : "border-destructive/40 bg-destructive/[0.05]"
            }`}
          >
            {stats.last.ok ? (
              <CheckCircle2 className="h-10 w-10 text-gold" />
            ) : (
              <XCircle className="h-10 w-10 text-destructive" />
            )}
            <div className="flex-1">
              <p
                className={`font-display text-2xl font-bold ${
                  stats.last.ok ? "text-gold" : "text-destructive"
                }`}
              >
                {stats.last.ok ? "All systems operational" : "Site is DOWN"}
              </p>
              <p className="text-xs text-foreground/60">
                Last checked {new Date(stats.last.checked_at).toLocaleString()} ·{" "}
                HTTP {stats.last.status_code ?? "—"} · {stats.last.latency_ms}ms
                {stats.last.error && ` · ${stats.last.error}`}
              </p>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Uptime (last 100)" value={`${stats.uptime.toFixed(1)}%`} />
          <StatCard label="Avg. latency" value={`${stats.avgLatency}ms`} />
          <StatCard label="Checks recorded" value={checks.length} />
        </div>

        {/* History */}
        <section className="mt-10 rounded-2xl glass overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border/50 px-5 py-4">
            <Activity className="h-4 w-4 text-gold" />
            <h2 className="font-display text-lg font-semibold">Recent probes</h2>
          </div>
          {error && (
            <p className="px-5 py-6 text-sm text-destructive">
              {error.includes("permission") || error.includes("policy")
                ? "Admin access required."
                : error}
            </p>
          )}
          {loading ? (
            <p className="px-5 py-10 text-center text-sm text-foreground/50">Loading…</p>
          ) : checks.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-foreground/50">
              No checks yet. Click "Run now" to seed.
            </p>
          ) : (
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background/90 text-xs uppercase tracking-wider text-foreground/50 backdrop-blur">
                  <tr>
                    <th className="px-5 py-3 text-left">Time</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-right">HTTP</th>
                    <th className="px-5 py-3 text-right">Latency</th>
                    <th className="px-5 py-3 text-left">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {checks.map((c) => (
                    <tr key={c.id} className="border-t border-border/30">
                      <td className="px-5 py-2.5 tabular-nums text-foreground/70">
                        {new Date(c.checked_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                            c.ok
                              ? "bg-gold/15 text-gold"
                              : "bg-destructive/15 text-destructive"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              c.ok ? "bg-gold" : "bg-destructive"
                            }`}
                          />
                          {c.ok ? "Up" : "Down"}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-right tabular-nums">
                        {c.status_code ?? "—"}
                      </td>
                      <td className="px-5 py-2.5 text-right tabular-nums">
                        {c.latency_ms}ms
                      </td>
                      <td className="px-5 py-2.5 text-foreground/60">
                        {c.error ?? ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl glass p-6">
      <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">{label}</p>
      <p className="font-display mt-3 text-3xl font-bold text-gradient">{value}</p>
    </div>
  );
}
