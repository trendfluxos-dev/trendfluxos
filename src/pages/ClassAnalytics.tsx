import { useEffect, useState } from "react";
import { lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/hooks/useSeo";
import { toast } from "sonner";
import { Sparkles, RefreshCw } from "lucide-react";
import { format } from "date-fns";

const ResponsiveContainer = lazy(() => import("recharts").then((m) => ({ default: m.ResponsiveContainer })));
const LineChart = lazy(() => import("recharts").then((m) => ({ default: m.LineChart })));
const Line = lazy(() => import("recharts").then((m) => ({ default: m.Line })));
const BarChart = lazy(() => import("recharts").then((m) => ({ default: m.BarChart })));
const Bar = lazy(() => import("recharts").then((m) => ({ default: m.Bar })));
const XAxis = lazy(() => import("recharts").then((m) => ({ default: m.XAxis })));
const YAxis = lazy(() => import("recharts").then((m) => ({ default: m.YAxis })));
const Tooltip = lazy(() => import("recharts").then((m) => ({ default: m.Tooltip })));

type ClassRow = {
  id: string; title: string; starts_at: string;
  curriculum: unknown; curriculum_generated_at: string | null;
};

export default function ClassAnalytics() {
  useSeo({ title: "Class Analytics — Growth OS", description: "RSVP, attendance and curriculum coverage across live classes.", noindex: true });
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [rsvps, setRsvps] = useState<{ day: string; count: number }[]>([]);
  const [perClass, setPerClass] = useState<{ name: string; rsvps: number }[]>([]);
  const [genId, setGenId] = useState<string | null>(null);

  const load = async () => {
    const since = new Date(); since.setDate(since.getDate() - 30);
    const [cls, rsvpRows] = await Promise.all([
      supabase.from("live_classes").select("id,title,starts_at,curriculum,curriculum_generated_at").order("starts_at", { ascending: false }).limit(50),
      supabase.from("live_class_rsvps").select("class_id,created_at").gte("created_at", since.toISOString()),
    ]);
    setClasses((cls.data ?? []) as ClassRow[]);

    const byDay = new Map<string, number>();
    const byClass = new Map<string, number>();
    for (const r of rsvpRows.data ?? []) {
      const d = format(new Date(r.created_at), "MMM d");
      byDay.set(d, (byDay.get(d) ?? 0) + 1);
      byClass.set(r.class_id, (byClass.get(r.class_id) ?? 0) + 1);
    }
    setRsvps([...byDay.entries()].map(([day, count]) => ({ day, count })));
    const titleById = new Map((cls.data ?? []).map((c) => [c.id, c.title]));
    setPerClass([...byClass.entries()].slice(0, 10).map(([id, count]) => ({ name: (titleById.get(id) ?? id).slice(0, 20), rsvps: count })));
  };

  useEffect(() => { load(); }, []);

  const generate = async (classId: string) => {
    setGenId(classId);
    try {
      const { data, error } = await supabase.functions.invoke("generate-curriculum", { body: { class_id: classId } });
      if (error) throw error;
      toast.success(data?.skipped ? "Already has curriculum" : "Curriculum generated");
      await load();
    } catch (e) {
      toast.error((e as Error).message ?? "Generation failed");
    } finally {
      setGenId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Growth OS · Class Analytics</div>
            <h1 className="text-3xl font-semibold tracking-tight mt-1">Live class engagement</h1>
            <p className="text-muted-foreground mt-1">Last 30 days of RSVP signal and curriculum coverage.</p>
          </div>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="mr-1.5 size-4" />Refresh</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm font-medium mb-2">RSVPs over time</div>
            <div className="h-60">
              <Suspense fallback={<div className="h-full grid place-items-center text-xs text-muted-foreground">Loading chart…</div>}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rsvps}>
                    <XAxis dataKey="day" fontSize={11} />
                    <YAxis fontSize={11} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Suspense>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-medium mb-2">RSVPs by class</div>
            <div className="h-60">
              <Suspense fallback={<div className="h-full grid place-items-center text-xs text-muted-foreground">Loading chart…</div>}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perClass}>
                    <XAxis dataKey="name" fontSize={11} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis fontSize={11} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="rsvps" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Suspense>
            </div>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b text-sm font-medium">Class curriculum coverage</div>
          <div className="divide-y">
            {classes.length === 0 && <div className="p-6 text-sm text-muted-foreground">No classes yet.</div>}
            {classes.map((c) => (
              <div key={c.id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{format(new Date(c.starts_at), "MMM d, p")}</div>
                </div>
                {c.curriculum ? (
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Curriculum ready</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">No curriculum</Badge>
                )}
                <Button size="sm" variant="secondary" disabled={genId === c.id} onClick={() => generate(c.id)}>
                  <Sparkles className="mr-1.5 size-4" />{genId === c.id ? "Generating…" : c.curriculum ? "Regenerate" : "Generate"}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}