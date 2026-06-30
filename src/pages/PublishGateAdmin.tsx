import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, RefreshCw, ShieldCheck, ShieldAlert, Rocket, ExternalLink, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Failure =
  | { kind: "timing"; metric: string; value: number; budget: number }
  | { kind: "size"; resource: string; value: number; budget: number };

type PageReport = {
  url: string;
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  metrics: Record<string, number | undefined>;
  failures: Failure[];
  passed: boolean;
};

type Summary = {
  generatedAt: string;
  commit: string | null;
  ref: string | null;
  config: string;
  passed: boolean;
  medianPerformance: number | null;
  pageCount: number;
  pages: PageReport[];
};

const fmtMs = (v?: number) => (typeof v === "number" ? `${Math.round(v)} ms` : "—");
const pct = (v: number | null) => (typeof v === "number" ? `${Math.round(v * 100)}` : "—");
const scoreColor = (v: number | null) =>
  v == null ? "bg-muted text-muted-foreground" : v >= 0.9 ? "bg-emerald-500/15 text-emerald-300" : v >= 0.75 ? "bg-amber-500/15 text-amber-300" : "bg-destructive/20 text-destructive";

const PublishGateAdmin = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/lighthouse-summary.json?ts=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("not found");
      const data = (await res.json()) as Summary;
      setSummary(data);
      setMissing(false);
    } catch {
      setSummary(null);
      setMissing(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Summary;
        if (!parsed.pages) throw new Error("invalid summary");
        setSummary(parsed);
        setMissing(false);
        toast.success("Lighthouse summary loaded locally");
      } catch {
        toast.error("Invalid lighthouse-summary.json");
      }
    };
    reader.readAsText(file);
  };

  const ageHours = useMemo(() => {
    if (!summary?.generatedAt) return null;
    return (Date.now() - new Date(summary.generatedAt).getTime()) / 36e5;
  }, [summary]);

  const stale = ageHours != null && ageHours > 24;
  const canPublish = !!summary?.passed && !stale;

  const onPublish = () => {
    if (!canPublish) {
      toast.error("Publish blocked — budgets not green");
      return;
    }
    try {
      window.parent?.postMessage({ type: "lovable:open-publish" }, "*");
    } catch {
      /* ignore */
    }
    toast.success("Opening Lovable Publish dialog — confirm in the top-right.", { duration: 6000 });
  };

  return (
    <>
      <Helmet>
        <title>Publish Gate · TrendFlux Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <main className="container mx-auto max-w-5xl px-4 py-10">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin · Release Control</p>
            <h1 className="mt-1 text-3xl font-bold">Publish Gate</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              One-click deploy, gated on the latest mobile Lighthouse budgets. Publishing is blocked unless every audited route is green and the report is fresh (&lt;24h).
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
            <label className="inline-flex">
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
              />
              <span className="inline-flex h-9 cursor-pointer items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
                <Upload className="mr-2 h-4 w-4" /> Load JSON
              </span>
            </label>
          </div>
        </header>

        <Card className={`border-2 ${canPublish ? "border-emerald-500/40" : "border-destructive/40"}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {canPublish ? (
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-destructive" />
              )}
              {canPublish ? "All mobile budgets green — deploy unlocked" : missing ? "No Lighthouse report found" : stale ? "Report stale — re-run before deploy" : "Budgets failing — deploy blocked"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary && (
              <div className="grid gap-3 text-sm sm:grid-cols-4">
                <Stat label="Median Perf" value={summary.medianPerformance == null ? "—" : pct(summary.medianPerformance)} />
                <Stat label="Pages audited" value={String(summary.pageCount)} />
                <Stat label="Report age" value={ageHours == null ? "—" : `${ageHours.toFixed(1)} h`} />
                <Stat label="Commit" value={summary.commit?.slice(0, 7) ?? "local"} />
              </div>
            )}
            {missing && (
              <p className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                Run <code className="rounded bg-background px-1.5 py-0.5">bun run build &amp;&amp; bunx --bun @lhci/cli@0.14.x autorun --config=./lighthouserc.mobile.json &amp;&amp; node scripts/lighthouse-summary.mjs</code> locally, or wait for the CI job to upload <code>public/lighthouse-summary.json</code>. You can also drop a downloaded summary into <em>Load JSON</em>.
              </p>
            )}
            <Separator />
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={onPublish} disabled={!canPublish} className="gap-2">
                <Rocket className="h-4 w-4" />
                {canPublish ? "Publish to production" : "Publish blocked"}
              </Button>
              <a
                href="https://trendflux.digital"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                Open live site <ExternalLink className="ml-1 h-3 w-3" />
              </a>
              {!canPublish && summary && (
                <Badge variant="destructive" className="ml-auto">
                  {summary.pages.reduce((n, p) => n + p.failures.length, 0)} failing checks
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: clicking <strong>Publish</strong> opens the Lovable Publish dialog in the editor. Confirm <em>Update</em> there to ship the build.
            </p>
          </CardContent>
        </Card>

        {summary && (
          <section className="mt-8 space-y-3">
            <h2 className="text-lg font-semibold">Per-route audit</h2>
            <div className="grid gap-3">
              {summary.pages.map((p) => (
                <Card key={p.url} className={p.passed ? "" : "border-destructive/40"}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-sm font-mono break-all">{p.url.replace(/^https?:\/\/[^/]+/, "")}</CardTitle>
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        <span className={`rounded px-2 py-0.5 ${scoreColor(p.performance)}`}>Perf {pct(p.performance)}</span>
                        <span className={`rounded px-2 py-0.5 ${scoreColor(p.seo)}`}>SEO {pct(p.seo)}</span>
                        <span className={`rounded px-2 py-0.5 ${scoreColor(p.accessibility)}`}>A11y {pct(p.accessibility)}</span>
                        <span className={`rounded px-2 py-0.5 ${scoreColor(p.bestPractices)}`}>BP {pct(p.bestPractices)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-muted-foreground">
                    <div className="grid gap-2 sm:grid-cols-3">
                      <MetricRow label="LCP" value={fmtMs(p.metrics["largest-contentful-paint"])} />
                      <MetricRow label="TBT" value={fmtMs(p.metrics["total-blocking-time"])} />
                      <MetricRow label="CLS" value={(p.metrics["cumulative-layout-shift"] ?? 0).toFixed(3)} />
                      <MetricRow label="FCP" value={fmtMs(p.metrics["first-contentful-paint"])} />
                      <MetricRow label="SI" value={fmtMs(p.metrics["speed-index"])} />
                      <MetricRow label="TTI" value={fmtMs(p.metrics.interactive)} />
                    </div>
                    {p.failures.length > 0 && (
                      <ul className="mt-2 space-y-1 rounded-md border border-destructive/30 bg-destructive/5 p-2">
                        {p.failures.map((f, i) => (
                          <li key={i} className="text-destructive">
                            {f.kind === "timing"
                              ? `${f.metric}: ${Math.round(f.value)}ms over ${f.budget}ms budget`
                              : `${f.resource}: ${f.value}KB over ${f.budget}KB budget`}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-border bg-card/40 p-3">
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
  </div>
);

const MetricRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between rounded bg-muted/30 px-2 py-1">
    <span>{label}</span>
    <span className="font-mono text-foreground">{value}</span>
  </div>
);

export default PublishGateAdmin;