import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/hooks/useSeo";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, FileText, GraduationCap, UserPlus, RefreshCw } from "lucide-react";

type Task = {
  id: string;
  title: string;
  source: "lead" | "draft" | "class" | "alert";
  priority: number; // higher = more urgent
  age: string;
  href: string;
  meta?: string;
};

const SOURCE_META: Record<Task["source"], { label: string; icon: any; tone: string }> = {
  lead:  { label: "Lead",    icon: UserPlus,       tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  draft: { label: "Content", icon: FileText,       tone: "bg-sky-500/15 text-sky-600 dark:text-sky-400" },
  class: { label: "Class",   icon: GraduationCap,  tone: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
  alert: { label: "Alert",   icon: AlertTriangle,  tone: "bg-red-500/15 text-red-600 dark:text-red-400" },
};

const HOUR = 1000 * 60 * 60;

export default function TaskQueue() {
  useSeo({ title: "Smart Task Queue — Growth OS", description: "Auto-prioritised tasks across leads, content, classes and alerts.", noindex: true });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [snoozed, setSnoozed] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("tf.taskqueue.snoozed") || "[]")); } catch { return new Set(); }
  });

  const load = useCallback(async () => {
    const now = Date.now();
    const in72h = new Date(now + 72 * HOUR).toISOString();
    const in48h = new Date(now + 48 * HOUR).toISOString();
    const last24h = new Date(now - 24 * HOUR).toISOString();

    const [leadsRes, draftsRes, classesRes, alertsRes] = await Promise.all([
      supabase.from("growth_leads").select("id,name,email,created_at,stage").eq("stage", "new").order("created_at", { ascending: true }).limit(50),
      supabase.from("creator_content").select("id,title,status,scheduled_at,updated_at").eq("status", "draft").order("scheduled_at", { ascending: true, nullsFirst: false }).limit(50),
      supabase.from("live_classes").select("id,title,starts_at,meeting_url,curriculum").gte("starts_at", new Date().toISOString()).lte("starts_at", in72h).limit(50),
      supabase.from("telegram_error_logs").select("id,event_type,error_message,created_at").gte("created_at", last24h).order("created_at", { ascending: false }).limit(50),
    ]);

    const out: Task[] = [];
    for (const l of leadsRes.data ?? []) {
      const ageH = (now - new Date(l.created_at).getTime()) / HOUR;
      out.push({
        id: `lead-${l.id}`,
        source: "lead",
        title: `Follow up: ${l.name || l.email}`,
        meta: l.email,
        priority: ageH > 24 ? 90 : 60,
        age: formatDistanceToNow(new Date(l.created_at), { addSuffix: true }),
        href: "/admin/growth-console",
      });
    }
    for (const d of draftsRes.data ?? []) {
      const scheduled = d.scheduled_at ? new Date(d.scheduled_at).getTime() : null;
      const hoursUntil = scheduled ? (scheduled - now) / HOUR : null;
      out.push({
        id: `draft-${d.id}`,
        source: "draft",
        title: `Review draft: ${d.title}`,
        meta: scheduled ? `scheduled ${formatDistanceToNow(new Date(d.scheduled_at!), { addSuffix: true })}` : "unscheduled",
        priority: hoursUntil !== null && hoursUntil < 48 ? 80 : 50,
        age: formatDistanceToNow(new Date(d.updated_at), { addSuffix: true }),
        href: "/admin/creator-studio",
      });
    }
    for (const c of classesRes.data ?? []) {
      const missing: string[] = [];
      if (!c.meeting_url) missing.push("meeting URL");
      if (!c.curriculum) missing.push("curriculum");
      if (missing.length === 0) continue;
      const hoursUntil = (new Date(c.starts_at).getTime() - now) / HOUR;
      out.push({
        id: `class-${c.id}`,
        source: "class",
        title: `Prep class: ${c.title}`,
        meta: `missing ${missing.join(" + ")} · starts ${formatDistanceToNow(new Date(c.starts_at), { addSuffix: true })}`,
        priority: hoursUntil < 24 ? 95 : hoursUntil < 48 ? 75 : 55,
        age: formatDistanceToNow(new Date(c.starts_at), { addSuffix: true }),
        href: `/edtech/live/studio/${c.id}`,
      });
    }
    for (const a of alertsRes.data ?? []) {
      out.push({
        id: `alert-${a.id}`,
        source: "alert",
        title: `Acknowledge alert: ${a.event_type ?? "error"}`,
        meta: (a.error_message ?? "").slice(0, 120),
        priority: 70,
        age: formatDistanceToNow(new Date(a.created_at), { addSuffix: true }),
        href: "/admin/errors",
      });
    }

    out.sort((a, b) => b.priority - a.priority);
    setTasks(out);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    const channels = ["growth_leads", "creator_content", "live_classes", "telegram_error_logs"].map((table) =>
      supabase.channel(`tq-${table}`)
        .on("postgres_changes", { event: "*", schema: "public", table }, () => load())
        .subscribe()
    );
    return () => {
      clearInterval(interval);
      channels.forEach((c) => supabase.removeChannel(c));
    };
  }, [load]);

  const visible = useMemo(() => tasks.filter((t) => !snoozed.has(t.id)), [tasks, snoozed]);

  const snooze = (id: string) => {
    const next = new Set(snoozed); next.add(id);
    setSnoozed(next);
    localStorage.setItem("tf.taskqueue.snoozed", JSON.stringify([...next]));
  };
  const unsnoozeAll = () => { setSnoozed(new Set()); localStorage.removeItem("tf.taskqueue.snoozed"); };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Growth OS · Task Queue</div>
            <h1 className="text-3xl font-semibold tracking-tight mt-1">Smart Task Queue</h1>
            <p className="text-muted-foreground mt-1">Auto-prioritised across leads, content, classes and alerts. Refreshes every 30s.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => load()}><RefreshCw className="mr-1.5 size-4" />Refresh</Button>
            {snoozed.size > 0 && <Button variant="ghost" size="sm" onClick={unsnoozeAll}>Restore snoozed ({snoozed.size})</Button>}
          </div>
        </div>

        {loading ? (
          <Card className="p-10 text-center text-muted-foreground">Loading…</Card>
        ) : visible.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="text-2xl">🎯</div>
            <div className="mt-2 font-medium">Inbox zero</div>
            <div className="text-sm text-muted-foreground">No pending tasks across leads, drafts, classes, or alerts.</div>
          </Card>
        ) : (
          <div className="space-y-2">
            {visible.map((t) => {
              const m = SOURCE_META[t.source];
              const Icon = m.icon;
              return (
                <Card key={t.id} className="p-4 flex items-start gap-3">
                  <div className={`size-9 rounded-md flex items-center justify-center shrink-0 ${m.tone}`}><Icon className="size-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{m.label}</Badge>
                      <span className="text-xs text-muted-foreground">{t.age}</span>
                      {t.priority >= 90 && <Badge className="text-[10px] bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30" variant="outline">Urgent</Badge>}
                    </div>
                    <div className="font-medium mt-1 truncate">{t.title}</div>
                    {t.meta && <div className="text-sm text-muted-foreground truncate">{t.meta}</div>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button asChild size="sm" variant="secondary"><Link to={t.href}>Open</Link></Button>
                    <Button size="sm" variant="ghost" onClick={() => snooze(t.id)}>Snooze</Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}