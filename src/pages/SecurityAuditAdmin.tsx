import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Shield, Filter, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";
import { toast } from "sonner";

type AuditRow = {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  outcome: "granted" | "denied";
  reason: string | null;
  ip: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

type Filter = "all" | "granted" | "denied";

export default function SecurityAuditAdmin() {
  useSeo({
    title: "Security Audit — TrendFlux Internal",
    description: "Every access to signed URLs and gated meeting URLs.",
    noindex: true,
  });

  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [retention, setRetention] = useState<number>(30);
  const [retentionInput, setRetentionInput] = useState<string>("30");
  const [savingRetention, setSavingRetention] = useState(false);
  const [purging, setPurging] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("access_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) setErr(error.message);
    else setRows((data ?? []) as AuditRow[]);
    setLoading(false);
  };

  const loadRetention = async () => {
    const { data, error } = await supabase.rpc("get_audit_retention_days");
    if (!error && typeof data === "number") {
      setRetention(data);
      setRetentionInput(String(data));
    }
  };

  const saveRetention = async () => {
    const n = parseInt(retentionInput, 10);
    if (!Number.isFinite(n) || n < 1 || n > 3650) {
      toast.error("Retention must be 1–3650 days");
      return;
    }
    setSavingRetention(true);
    const { data, error } = await supabase.rpc("set_audit_retention_days", { _days: n });
    setSavingRetention(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRetention((data as number) ?? n);
    toast.success(`Retention set to ${n} days`);
  };

  const purgeNow = async () => {
    const n = parseInt(retentionInput, 10) || retention;
    if (!confirm(`Delete every audit row older than ${n} days?`)) return;
    setPurging(true);
    const { data, error } = await supabase.rpc("purge_access_audit_logs", { _days: n });
    setPurging(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Purged ${data ?? 0} rows`);
    void load();
  };

  useEffect(() => {
    load();
    void loadRetention();
    const channel = supabase
      .channel("access_audit_logs_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "access_audit_logs" },
        (payload) => {
          setRows((prev) => [payload.new as AuditRow, ...prev].slice(0, 500));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.outcome !== filter) return false;
      if (!q) return true;
      return (
        r.action.toLowerCase().includes(q) ||
        r.resource_type.toLowerCase().includes(q) ||
        (r.resource_id ?? "").toLowerCase().includes(q) ||
        (r.reason ?? "").toLowerCase().includes(q) ||
        (r.user_id ?? "").toLowerCase().includes(q) ||
        (r.ip ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, filter, search]);

  const stats = useMemo(() => {
    const granted = rows.filter((r) => r.outcome === "granted").length;
    const denied = rows.filter((r) => r.outcome === "denied").length;
    return { granted, denied, total: rows.length };
  }, [rows]);

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
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Shield className="h-6 w-6 text-primary" /> Security Audit
          </h1>
          <p className="text-sm text-muted-foreground">
            Every signed URL mint and gated meeting URL retrieval, with outcome and reason. Streams live.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3">
          <Stat label="Total" value={stats.total} />
          <Stat label="Granted" value={stats.granted} tone="ok" />
          <Stat label="Denied" value={stats.denied} tone="warn" />
        </div>

        <div className="mb-4 rounded-lg border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Retention policy</div>
              <div className="text-xs text-muted-foreground">
                Records older than this are purged automatically each day at 03:15 UTC. Current: {retention} days.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="number"
              min={1}
              max={3650}
              value={retentionInput}
              onChange={(e) => setRetentionInput(e.target.value)}
              className="w-32"
            />
            <span className="text-xs text-muted-foreground">days</span>
            <Button size="sm" onClick={saveRetention} disabled={savingRetention}>
              <Save className="h-4 w-4" /> Save
            </Button>
            <Button size="sm" variant="outline" onClick={purgeNow} disabled={purging}>
              <Trash2 className={`h-4 w-4 ${purging ? "animate-pulse" : ""}`} /> Purge now
            </Button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-md border bg-card p-1">
            {(["all", "granted", "denied"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded px-2 py-1 text-xs capitalize ${
                  filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Filter className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter by user, resource, IP, reason…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7"
            />
          </div>
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
                <th className="px-3 py-2">Outcome</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Resource</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    No audit events.
                  </td>
                </tr>
              )}
              {visible.map((r) => (
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
                          r.outcome === "granted"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {r.outcome}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{r.action}</td>
                    <td className="max-w-xs truncate px-3 py-2 font-mono text-xs text-muted-foreground">
                      {r.resource_type}
                      {r.resource_id ? ` · ${r.resource_id}` : ""}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
                      {r.user_id ? `${r.user_id.slice(0, 8)}…` : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{r.reason ?? "—"}</td>
                  </tr>
                  {expanded === r.id && (
                    <tr className="border-b bg-muted/20">
                      <td colSpan={6} className="px-3 py-3">
                        <dl className="grid grid-cols-2 gap-2 text-xs">
                          <Detail label="User ID" value={r.user_id ?? "—"} mono />
                          <Detail label="IP" value={r.ip ?? "—"} mono />
                          <Detail label="Resource" value={`${r.resource_type} · ${r.resource_id ?? "—"}`} mono />
                          <Detail label="User-Agent" value={r.user_agent ?? "—"} />
                          {Object.keys(r.metadata ?? {}).length > 0 && (
                            <div className="col-span-2">
                              <div className="mb-1 font-semibold">Metadata</div>
                              <pre className="overflow-auto rounded bg-background p-2 font-mono text-[11px]">
                                {JSON.stringify(r.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </dl>
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

function Stat({ label, value, tone }: { label: string; value: number; tone?: "ok" | "warn" }) {
  const toneCls =
    tone === "ok"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "warn"
      ? "text-destructive"
      : "text-foreground";
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${toneCls}`}>{value}</div>
    </div>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="font-semibold">{label}</div>
      <div className={`text-muted-foreground ${mono ? "break-all font-mono text-[11px]" : ""}`}>
        {value}
      </div>
    </div>
  );
}