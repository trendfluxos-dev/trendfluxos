import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";

type ClientError = {
  id: string;
  message: string;
  stack: string | null;
  source: string | null;
  url: string | null;
  user_agent: string | null;
  release: string | null;
  severity: string;
  user_id: string | null;
  created_at: string;
};

export default function ErrorLogsAdmin() {
  useSeo({
    title: "Client Error Logs — TrendFlux Internal",
    description: "Runtime errors captured from the live site.",
    noindex: true,
  });

  const [rows, setRows] = useState<ClientError[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("client_errors")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) setErr(error.message);
    else setRows((data ?? []) as ClientError[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("client_errors_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "client_errors" },
        (payload) => {
          setRows((prev) => [payload.new as ClientError, ...prev].slice(0, 200));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const clearAll = async () => {
    if (!confirm("Delete all logged errors?")) return;
    await supabase.from("client_errors").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    void load();
  };

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="container max-w-6xl py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Admin
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              <Trash2 className="h-4 w-4" /> Clear
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <AlertTriangle className="h-6 w-6 text-primary" /> Client Error Logs
          </h1>
          <p className="text-sm text-muted-foreground">
            Live runtime errors from production. New errors stream in automatically.
          </p>
        </div>

        {err && (
          <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {err}
          </div>
        )}

        <div className="rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Message</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">URL</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                    No errors logged. 🎉
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <Fragment key={r.id}>
                  <tr
                    className="cursor-pointer border-b hover:bg-muted/40"
                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  >
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs ${
                          r.severity === "error"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {r.severity}
                      </span>
                    </td>
                    <td className="max-w-md truncate px-3 py-2 font-mono text-xs">
                      {r.message}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{r.source}</td>
                    <td className="max-w-xs truncate px-3 py-2 text-xs text-muted-foreground">
                      {r.url}
                    </td>
                  </tr>
                  {expanded === r.id && (
                    <tr className="border-b bg-muted/20">
                      <td colSpan={5} className="px-3 py-3">
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="font-semibold">User-Agent: </span>
                            <span className="text-muted-foreground">{r.user_agent ?? "—"}</span>
                          </div>
                          <div>
                            <span className="font-semibold">Release: </span>
                            <span className="text-muted-foreground">{r.release ?? "—"}</span>
                          </div>
                          {r.stack && (
                            <pre className="max-h-64 overflow-auto rounded bg-background p-2 font-mono text-[11px] leading-relaxed">
                              {r.stack}
                            </pre>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
