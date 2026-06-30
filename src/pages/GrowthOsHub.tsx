import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SeoHead } from "@/hooks/useSeo";
import {
  Activity, BarChart3, FileText, GraduationCap, ListChecks, Radio,
  Sparkles, UserPlus, CalendarPlus, PenSquare, ArrowRight,
} from "lucide-react";

type Kpis = {
  leadsToday: number;
  pendingTasks: number;
  classesThisWeek: number;
  draftsPending: number;
};

const QUICK_ACTIONS = [
  { label: "New Lead", icon: UserPlus, to: "/growth-os#apply" },
  { label: "Draft Post", icon: PenSquare, to: "/admin/creator-studio" },
  { label: "Schedule Class", icon: CalendarPlus, to: "/edtech/teach/classes" },
  { label: "Generate Curriculum", icon: Sparkles, to: "/admin/class-analytics" },
];

const MODULES = [
  { title: "Live Class Studio", desc: "Run instant or scheduled live classes with whiteboard + recording.", to: "/edtech/live", icon: Radio },
  { title: "Growth Console", desc: "Meta Ads KPIs and the live CRM pipeline.", to: "/admin/growth-console", icon: BarChart3 },
  { title: "Creator Studio", desc: "Plan, draft and publish content with AI assist + n8n.", to: "/admin/creator-studio", icon: FileText },
  { title: "Portfolio Showcase", desc: "Public proof — brands, systems, case studies.", to: "/showcase", icon: GraduationCap },
  { title: "Smart Task Queue", desc: "Auto-prioritised tasks from leads, drafts, classes and alerts.", to: "/admin/task-queue", icon: ListChecks },
  { title: "Class Analytics", desc: "RSVP, attendance and recording engagement trends.", to: "/admin/class-analytics", icon: Activity },
];

export default function GrowthOsHub() {
  const [kpis, setKpis] = useState<Kpis>({ leadsToday: 0, pendingTasks: 0, classesThisWeek: 0, draftsPending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(); endOfWeek.setDate(endOfWeek.getDate() + 7);
      const [leads, classes, drafts, oldLeads] = await Promise.all([
        supabase.from("growth_leads").select("id", { count: "exact", head: true }).gte("created_at", startOfDay.toISOString()),
        supabase.from("live_classes").select("id", { count: "exact", head: true }).gte("starts_at", new Date().toISOString()).lte("starts_at", endOfWeek.toISOString()),
        supabase.from("creator_content").select("id", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("growth_leads").select("id", { count: "exact", head: true }).eq("stage", "new"),
      ]);
      if (cancelled) return;
      setKpis({
        leadsToday: leads.count ?? 0,
        classesThisWeek: classes.count ?? 0,
        draftsPending: drafts.count ?? 0,
        pendingTasks: (oldLeads.count ?? 0) + (drafts.count ?? 0),
      });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title="Growth OS Hub — TrendFlux Digital" description="Unified command surface for live classes, CRM, creator studio and growth analytics." noindex />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" /> Growth OS · Command Hub
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">One surface. Every system.</h1>
          <p className="text-muted-foreground max-w-2xl">Leads, content, classes, analytics and automation — all wired into one operating layer.</p>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Leads today", value: kpis.leadsToday },
            { label: "Pending tasks", value: kpis.pendingTasks },
            { label: "Classes this week", value: kpis.classesThisWeek },
            { label: "Drafts to publish", value: kpis.draftsPending },
          ].map((k) => (
            <Card key={k.label} className="p-4">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className="text-3xl font-semibold tabular-nums mt-1">{loading ? "—" : k.value}</div>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <Card className="p-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-muted-foreground mr-2">Quick actions</span>
            {QUICK_ACTIONS.map((a) => (
              <Button key={a.label} asChild variant="secondary" size="sm">
                <Link to={a.to}><a.icon className="mr-1.5 size-4" />{a.label}</Link>
              </Button>
            ))}
          </div>
        </Card>

        {/* Modules grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((m) => (
            <Link key={m.to} to={m.to} className="group">
              <Card className="p-5 h-full transition-colors hover:border-primary/50">
                <div className="flex items-start justify-between">
                  <div className="size-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    <m.icon className="size-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px]">Live</Badge>
                </div>
                <h3 className="mt-4 font-semibold">{m.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{m.desc}</p>
                <div className="mt-4 inline-flex items-center text-sm text-primary group-hover:translate-x-0.5 transition-transform">
                  Open <ArrowRight className="ml-1 size-4" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}