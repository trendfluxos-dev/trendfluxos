import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, RefreshCw, CheckCircle2, XCircle, AlertTriangle,
  Play, Activity, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";
import { useToast } from "@/hooks/use-toast";

type ExecutionLog = {
  id: string;
  function_name: string;
  status: "success" | "failure" | "partial";
  triggered_by: string;
  actor_id: string | null;
  lead_id: string | null;
  processed_count: number;
  success_count: number;
  failure_count: number;
  duration_ms: number | null;
  http_status: number | null;
  error: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

type FunctionFilter = "all" | "lead-outreach-start" | "lead-followup-sweeper";
type StatusFilter = "all" | "success" | "failure" | "partial";
type RangeFilter = "24h" | "7d" | "30d" | "all";

const rangeToHours: Record<RangeFilter, number | null> = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
  all: null,
};

function StatusBadge({ status }: { status: ExecutionLog["status"] }) {
  if (status === "success") {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/20">
        <CheckCircle2 className="w-3 h-3 mr-1" /> success
      </Badge>
    );
  }
  if (status === "partial") {
    return (
      <Badge className="bg-amber-500/15 text-amber-600 border border-amber-500/30 hover:bg-amber-500/20">
        <AlertTriangle className="w-3 h-3 mr-1" /> partial
      </Badge>
    );
  }
  return (
    <Badge className="bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/20">
      <XCircle className="w-3 h-3 mr-1" /> failure
    </Badge>
  );
}

export default function OutreachLogsAdmin() {
  useSeo({
    title: "Outreach & Sweeper Logs — TrendFlux Internal",
    description: "Success/failure execution history for outreach and lead-followup-sweeper jobs.",
    noindex: true,
  });

  const { toast } = useToast();
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState<string | null>(null);

  const [fnFilter, setFnFilter] = useState<FunctionFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [range, setRange] = useState<RangeFilter>("7d");

  const load = async () => {
    setLoading(true);
    setError(null);
    let query = supabase
      .from("outreach_execution_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    const hours = rangeToHours[range];
    if (hours) {
      const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
      query = query.gte("created_at", since);
    }
    if (fnFilter !== "all") query = query.eq("function_name", fnFilter);
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data, error } = await query;
    if (error) setError(error.message);
    else setLogs((data ?? []) as ExecutionLog[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [fnFilter, statusFilter, range]);

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("outreach_execution_logs_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "outreach_execution_logs" },
        () => load(),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line
  }, [fnFilter, statusFilter, range]);

  const stats = useMemo(() => {
    const total = logs.length;
    const success = logs.filter(l => l.status === "success").length;
    const failure = logs.filter(l => l.status === "failure").length;
    const partial = logs.filter(l => l.status === "partial").length;
    const avgMs = logs.length
      ? Math.round(logs.reduce((s, l) => s + (l.duration_ms ?? 0), 0) / logs.length)
      : 0;
    const last = logs[0]?.created_at ?? null;
    return { total, success, failure, partial, avgMs, last };
  }, [logs]);

  const lastPerFn = useMemo(() => {
    const map: Record<string, ExecutionLog | undefined> = {};
    for (const l of logs) {
      if (!map[l.function_name]) map[l.function_name] = l;
    }
    return map;
  }, [logs]);

  const triggerSweeper = async () => {
    setRunning("lead-followup-sweeper");
    try {
      const { error } = await supabase.functions.invoke("lead-followup-sweeper", {
        body: {},
      });
      if (error) throw error;
      toast({ title: "Sweeper triggered", description: "Execution logged below." });
      await load();
    } catch (e) {
      toast({
        title: "Sweeper failed",
        description: e instanceof Error ? e.message : "unknown error",
        variant: "destructive",
      });
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin"><ArrowLeft className="w-4 h-4 mr-1" /> Admin</Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Outreach & Sweeper Logs</h1>
              <p className="text-sm text-muted-foreground">
                Execution history and health for <code>lead-outreach-start</code> and{" "}
                <code>lead-followup-sweeper</code>.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline" size="sm"
              onClick={triggerSweeper}
              disabled={running !== null}
            >
              <Play className={`w-4 h-4 mr-1 ${running === "lead-followup-sweeper" ? "animate-pulse" : ""}`} />
              Run sweeper now
            </Button>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <Card className="p-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="w-3 h-3" /> Total runs
            </div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-emerald-600">Success</div>
            <div className="text-2xl font-bold mt-1">{stats.success}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-amber-600">Partial</div>
            <div className="text-2xl font-bold mt-1">{stats.partial}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-destructive">Failure</div>
            <div className="text-2xl font-bold mt-1">{stats.failure}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> Avg duration
            </div>
            <div className="text-2xl font-bold mt-1">
              {stats.avgMs.toLocaleString()}<span className="text-sm text-muted-foreground ml-1">ms</span>
            </div>
          </Card>
        </div>

        {/* Per-function last status */}
        <div className="grid md:grid-cols-2 gap-3 mb-6">
          {["lead-outreach-start", "lead-followup-sweeper"].map(fn => {
            const l = lastPerFn[fn];
            return (
              <Card key={fn} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-mono">{fn}</div>
                    <div className="text-xs text-muted-foreground">
                      {l ? new Date(l.created_at).toLocaleString() : "no runs yet"}
                    </div>
                  </div>
                  {l ? <StatusBadge status={l.status} /> : <Badge variant="outline">idle</Badge>}
                </div>
                {l && (
                  <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-3">
                    <span>processed: {l.processed_count}</span>
                    <span className="text-emerald-600">ok: {l.success_count}</span>
                    <span className="text-destructive">fail: {l.failure_count}</span>
                    <span>{l.duration_ms ?? "—"} ms</span>
                    <span>trigger: {l.triggered_by}</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Select value={range} onValueChange={(v) => setRange(v as RangeFilter)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fnFilter} onValueChange={(v) => setFnFilter(v as FunctionFilter)}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All functions</SelectItem>
              <SelectItem value="lead-outreach-start">lead-outreach-start</SelectItem>
              <SelectItem value="lead-followup-sweeper">lead-followup-sweeper</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="failure">Failure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="px-4 py-2 font-medium">When</th>
                  <th className="px-4 py-2 font-medium">Function</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Trigger</th>
                  <th className="px-4 py-2 font-medium text-right">Processed</th>
                  <th className="px-4 py-2 font-medium text-right">OK</th>
                  <th className="px-4 py-2 font-medium text-right">Fail</th>
                  <th className="px-4 py-2 font-medium text-right">ms</th>
                  <th className="px-4 py-2 font-medium">Error / note</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
                )}
                {!loading && error && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-destructive">{error}</td></tr>
                )}
                {!loading && !error && logs.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No executions in this range.</td></tr>
                )}
                {logs.map((l) => (
                  <tr key={l.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">{l.function_name}</td>
                    <td className="px-4 py-2"><StatusBadge status={l.status} /></td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{l.triggered_by}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{l.processed_count}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-emerald-600">{l.success_count}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-destructive">{l.failure_count}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{l.duration_ms ?? "—"}</td>
                    <td className="px-4 py-2 max-w-xs">
                      {l.error ? (
                        <span className="text-destructive text-xs break-words">{l.error}</span>
                      ) : l.metadata && Object.keys(l.metadata).length > 0 ? (
                        <span className="text-xs text-muted-foreground break-words">
                          {JSON.stringify(l.metadata).slice(0, 120)}
                          {JSON.stringify(l.metadata).length > 120 ? "…" : ""}
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}