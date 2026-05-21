import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Trash2, Download, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  readStoredEvents,
  clearStoredEvents,
  ANALYTICS_EVENT,
  type StoredEvent,
} from "@/lib/analytics";
import { useSeo } from "@/hooks/useSeo";
import { DeploymentChecklist } from "@/components/DeploymentChecklist";

type ModuleRow = {
  module: string;
  category: string;
  clicks: number;
  submits: number;
  rate: number;
};

export default function ConversionDashboard() {
  useSeo({
    title: "Conversion Dashboard — TrendFlux Internal",
    description: "Internal analytics summary for service module CTAs and submissions.",
  });

  const [events, setEvents] = useState<StoredEvent[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [intervalSec, setIntervalSec] = useState(5);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  const refresh = () => {
    setEvents(readStoredEvents());
    setLastRefresh(Date.now());
  };

  useEffect(() => {
    refresh();
  }, []);

  // Live updates: same-tab via custom event, cross-tab via storage event.
  useEffect(() => {
    if (!autoRefresh) return;
    const onAnalytics = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "tf_analytics_events") refresh();
    };
    window.addEventListener(ANALYTICS_EVENT, onAnalytics);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(ANALYTICS_EVENT, onAnalytics);
      window.removeEventListener("storage", onStorage);
    };
  }, [autoRefresh]);

  // Polling fallback so the dashboard catches events from background tabs / SSR.
  useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(refresh, Math.max(1, intervalSec) * 1000);
    return () => window.clearInterval(id);
  }, [autoRefresh, intervalSec]);

  const { rows, totals, recent } = useMemo(() => {
    const map = new Map<string, ModuleRow>();
    for (const e of events) {
      const isClick = e.event === "service_module_cta";
      const isSubmit = e.event === "service_module_submit";
      if (!isClick && !isSubmit) continue;
      const module = String(e.params.module ?? "Unknown");
      const category = String(e.params.category ?? "—");
      const key = module;
      const row = map.get(key) ?? { module, category, clicks: 0, submits: 0, rate: 0 };
      if (isClick) row.clicks += 1;
      if (isSubmit) row.submits += 1;
      map.set(key, row);
    }
    const rows = [...map.values()]
      .map((r) => ({ ...r, rate: r.clicks ? (r.submits / r.clicks) * 100 : 0 }))
      .sort((a, b) => b.clicks - a.clicks);

    const totals = rows.reduce(
      (acc, r) => {
        acc.clicks += r.clicks;
        acc.submits += r.submits;
        return acc;
      },
      { clicks: 0, submits: 0 },
    );

    const recent = [...events].reverse().slice(0, 25);
    return { rows, totals, recent };
  }, [events]);

  const totalRate = totals.clicks ? (totals.submits / totals.clicks) * 100 : 0;

  const exportCsv = () => {
    const header = "module,category,clicks,submits,conversion_rate\n";
    const body = rows
      .map((r) => `"${r.module}","${r.category}",${r.clicks},${r.submits},${r.rate.toFixed(2)}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trendflux-conversions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-background px-6 py-12 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-foreground/60 hover:text-gold">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to site
            </Link>
            <h1 className="font-display mt-3 text-3xl font-bold md:text-4xl">
              Service Module Conversion Summary
            </h1>
            <p className="mt-2 text-sm text-foreground/60">
              Local-session analytics. CTA clicks and quote submissions per module from this device.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs">
              <Radio
                className={`h-3.5 w-3.5 ${autoRefresh ? "text-gold animate-pulse" : "text-foreground/40"}`}
              />
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="accent-gold"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                Live
              </label>
              <select
                value={intervalSec}
                onChange={(e) => setIntervalSec(Number(e.target.value))}
                disabled={!autoRefresh}
                className="bg-transparent text-foreground/70 outline-none disabled:opacity-40"
                aria-label="Refresh interval"
              >
                <option value={2}>2s</option>
                <option value={5}>5s</option>
                <option value={10}>10s</option>
                <option value={30}>30s</option>
              </select>
            </div>
            <Button size="sm" variant="outline" onClick={refresh}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button size="sm" variant="outline" onClick={exportCsv} disabled={!rows.length}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                clearStoredEvents();
                refresh();
              }}
            >
              <Trash2 className="h-4 w-4" /> Clear
            </Button>
          </div>
        </div>

        <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-foreground/40">
          Last updated {new Date(lastRefresh).toLocaleTimeString()}
        </p>

        <DeploymentChecklist />

        {/* Totals */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard label="Total CTA clicks" value={totals.clicks} />
          <SummaryCard label="Total submissions" value={totals.submits} />
          <SummaryCard label="Avg. conversion rate" value={`${totalRate.toFixed(1)}%`} />
        </div>

        {/* Per-module table */}
        <section className="mt-10 rounded-2xl glass overflow-hidden">
          <div className="border-b border-border/50 px-5 py-4">
            <h2 className="font-display text-lg font-semibold">Per-module breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/40 text-xs uppercase tracking-wider text-foreground/50">
                <tr>
                  <th className="px-5 py-3 text-left">Module</th>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-right">Clicks</th>
                  <th className="px-5 py-3 text-right">Submits</th>
                  <th className="px-5 py-3 text-right">Rate</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-foreground/50">
                      No events yet. Activate a module on the homepage to populate.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.module} className="border-t border-border/30">
                      <td className="px-5 py-3 font-medium">{r.module}</td>
                      <td className="px-5 py-3 text-foreground/60">{r.category}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{r.clicks}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-gold">{r.submits}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{r.rate.toFixed(1)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent events */}
        <section className="mt-10 rounded-2xl glass overflow-hidden">
          <div className="border-b border-border/50 px-5 py-4">
            <h2 className="font-display text-lg font-semibold">Recent events</h2>
          </div>
          <ul className="divide-y divide-border/30 text-xs">
            {recent.length === 0 ? (
              <li className="px-5 py-8 text-center text-foreground/50">No events captured.</li>
            ) : (
              recent.map((e, i) => (
                <li key={i} className="flex flex-wrap items-baseline gap-3 px-5 py-3">
                  <span className="font-mono text-foreground/40">
                    {new Date(e.ts).toLocaleTimeString()}
                  </span>
                  <span className="font-semibold text-gold">{e.event}</span>
                  <span className="text-foreground/60 break-all">
                    {Object.entries(e.params)
                      .filter(([, v]) => v !== null && v !== undefined && v !== "")
                      .map(([k, v]) => `${k}=${v}`)
                      .join(" · ")}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl glass p-6">
      <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">{label}</p>
      <p className="font-display mt-3 text-3xl font-bold text-gradient">{value}</p>
    </div>
  );
}
