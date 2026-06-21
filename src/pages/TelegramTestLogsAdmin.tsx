import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, CheckCircle2, XCircle, Send, MessageSquare } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { toast } from "sonner";

type Mode = "production" | "staging";

type LogRow = {
  id: string;
  mode: Mode;
  chat_id: string | null;
  status: number | null;
  ok: boolean;
  description: string | null;
  message_id: number | null;
  sent_at: string;
};

export default function TelegramTestLogsAdmin() {
  const navigate = useNavigate();
  useSeo({
    title: "Telegram Test Logs — Admin",
    description: "Recent outcomes of Telegram production/staging test sends.",
    noindex: true,
  });

  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | Mode>("all");
  const [sending, setSending] = useState<Mode | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from("telegram_test_logs")
        .select("id, mode, chat_id, status, ok, description, message_id, sent_at")
        .order("sent_at", { ascending: false })
        .limit(100);
      if (filter !== "all") q = q.eq("mode", filter);
      const { data, error } = await q;
      if (error) throw error;
      setRows((data ?? []) as LogRow[]);
    } catch (e) {
      toast.error("Failed to load logs: " + (e instanceof Error ? e.message : "unknown"));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { navigate("/auth"); return; }
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", data.session.user.id);
      const ok = roles?.some((r) => r.role === "admin") ?? false;
      setIsAdmin(ok);
      setAuthChecked(true);
    };
    init();
  }, [navigate]);

  useEffect(() => { if (isAdmin) void load(); }, [isAdmin, load]);

  const sendTest = async (mode: Mode) => {
    setSending(mode);
    try {
      const { data, error } = await supabase.functions.invoke<{
        ok: boolean; message_id?: number; description?: string;
      }>("telegram-test", { body: { mode } });
      if (error) throw error;
      if (data?.ok) toast.success(`Sent ${mode} test (msg ${data.message_id ?? "?"})`);
      else toast.error(`${mode} failed: ${data?.description ?? "unknown"}`);
      await load();
    } catch (e) {
      toast.error("Send failed: " + (e instanceof Error ? e.message : "unknown"));
    } finally {
      setSending(null);
    }
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-6 text-center text-foreground">
        <div>
          <h1 className="text-xl font-semibold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">You need the admin role.</p>
        </div>
      </div>
    );
  }

  const totals = rows.reduce(
    (acc, r) => {
      acc[r.mode].total++;
      if (r.ok) acc[r.mode].ok++;
      return acc;
    },
    { production: { total: 0, ok: 0 }, staging: { total: 0, ok: 0 } } as Record<Mode, { total: number; ok: number }>,
  );

  return (
    <div className="min-h-dvh bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <MessageSquare className="h-6 w-6 text-primary" /> Telegram Test Logs
          </h1>
          <p className="text-sm text-muted-foreground">
            Latest outcomes from production and staging Telegram health checks.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(["production", "staging"] as Mode[]).map((m) => (
            <div key={m} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{m}</div>
                  <div className="text-2xl font-semibold">
                    {totals[m].ok}/{totals[m].total}
                    <span className="ml-1 text-xs text-muted-foreground">ok</span>
                  </div>
                </div>
                <Button size="sm" onClick={() => sendTest(m)} disabled={sending !== null}>
                  {sending === m ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Send test
                </Button>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1">
              {(["all", "production", "staging"] as const).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? "default" : "secondary"}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </Button>
              ))}
            </div>
            <Button size="sm" variant="secondary" onClick={load} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">When</th>
                  <th className="px-3 py-2 text-left">Mode</th>
                  <th className="px-3 py-2 text-left">Result</th>
                  <th className="px-3 py-2 text-left">HTTP</th>
                  <th className="px-3 py-2 text-left">Chat ID</th>
                  <th className="px-3 py-2 text-left">Message ID</th>
                  <th className="px-3 py-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                      No test outcomes yet.
                    </td>
                  </tr>
                ) : rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(r.sent_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{r.mode}</td>
                    <td className="px-3 py-2">
                      {r.ok ? (
                        <span className="inline-flex items-center gap-1 text-green-500">
                          <CheckCircle2 className="h-4 w-4" /> ok
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-destructive">
                          <XCircle className="h-4 w-4" /> fail
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{r.status ?? "—"}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.chat_id ?? "—"}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.message_id ?? "—"}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{r.description ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}