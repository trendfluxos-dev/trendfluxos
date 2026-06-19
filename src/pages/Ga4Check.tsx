import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";

interface CheckResult {
  url: string;
  ga4Status: "installed" | "missing" | "error";
  measurementIds: string[];
  pageLoadStatus: "ok" | "issue";
  httpStatus: number | null;
  loadTimeMs: number | null;
  trackingEvents: "firing" | "not_firing" | "unknown";
  consentMode: boolean;
  error?: string;
}

const DEFAULT_URLS = [
  "https://trendflux.digital",
  "https://trendflux-hq.lovable.app",
].join("\n");

export default function Ga4Check() {
  useSeo({
    title: "GA4 Check — Admin",
    description: "Internal GA4 installation verification tool.",
    noindex: true,
  });

  const [input, setInput] = useState(DEFAULT_URLS);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  const run = async () => {
    const urls = input.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    if (!urls.length) {
      toast.error("কমপক্ষে একটি URL দিন");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ga4-checker", {
        body: { urls },
      });
      if (error) throw error;
      setResults(data.results || []);
      setCheckedAt(data.checkedAt || null);
      toast.success(`${data.results?.length || 0}টি URL চেক হয়েছে`);
    } catch (e: any) {
      toast.error(e?.message || "চেক ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ ok, okLabel, badLabel }: { ok: boolean; okLabel: string; badLabel: string }) =>
    ok ? (
      <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15 border-emerald-500/30">
        <CheckCircle2 className="mr-1 h-3 w-3" /> {okLabel}
      </Badge>
    ) : (
      <Badge variant="destructive" className="bg-destructive/15 text-destructive hover:bg-destructive/15">
        <XCircle className="mr-1 h-3 w-3" /> {badLabel}
      </Badge>
    );

  const summary = {
    total: results.length,
    ga4Ok: results.filter((r) => r.ga4Status === "installed").length,
    loadOk: results.filter((r) => r.pageLoadStatus === "ok").length,
    eventsOk: results.filter((r) => r.trackingEvents === "firing").length,
  };

  return (
    <div className="min-h-dvh bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">GA4 Integration Check</h1>
          <p className="text-muted-foreground">
            একাধিক URL একসাথে চেক করো — GA4 script installed কিনা, page load OK কিনা, এবং tracking events fire হচ্ছে কিনা।
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>URLs (প্রতি লাইনে একটি)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
              placeholder="https://example.com&#10;https://example.com/page-2"
              className="font-mono text-sm"
            />
            <div className="flex items-center gap-3">
              <Button onClick={run} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Checking…" : "Check URLs"}
              </Button>
              {checkedAt && (
                <span className="text-xs text-muted-foreground">
                  Last checked: {new Date(checkedAt).toLocaleString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Total URLs", value: summary.total },
              { label: "GA4 Installed", value: `${summary.ga4Ok}/${summary.total}` },
              { label: "Page Load OK", value: `${summary.loadOk}/${summary.total}` },
              { label: "Events Firing", value: `${summary.eventsOk}/${summary.total}` },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
                  <div className="mt-1 text-2xl font-semibold text-foreground">{s.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">URL</th>
                    <th className="px-4 py-3">GA4</th>
                    <th className="px-4 py-3">Page Load</th>
                    <th className="px-4 py-3">Tracking Events</th>
                    <th className="px-4 py-3">Measurement IDs</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 align-top">
                        <a href={r.url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                          {r.url}
                        </a>
                        {r.consentMode && (
                          <div className="mt-1 text-xs text-muted-foreground">Consent Mode v2 detected</div>
                        )}
                        {r.error && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" /> {r.error}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusBadge ok={r.ga4Status === "installed"} okLabel="Installed" badLabel="Missing" />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusBadge ok={r.pageLoadStatus === "ok"} okLabel={`OK (${r.httpStatus ?? "-"})`} badLabel={`Issue (${r.httpStatus ?? "-"})`} />
                        {r.loadTimeMs != null && (
                          <div className="mt-1 text-xs text-muted-foreground">{r.loadTimeMs} ms</div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusBadge ok={r.trackingEvents === "firing"} okLabel="Firing" badLabel="Not firing" />
                      </td>
                      <td className="px-4 py-3 align-top">
                        {r.measurementIds.length ? (
                          <div className="flex flex-wrap gap-1">
                            {r.measurementIds.map((id) => (
                              <code key={id} className="rounded bg-muted px-1.5 py-0.5 text-xs">{id}</code>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
