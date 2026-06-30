import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TfSection } from "@/components/tf/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSeo } from "@/hooks/useSeo";

type Stage = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";

const STAGES: { id: Stage; label: string; tone: string }[] = [
  { id: "new",        label: "New",        tone: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  { id: "contacted",  label: "Contacted",  tone: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  { id: "qualified",  label: "Qualified",  tone: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  { id: "proposal",   label: "Proposal",   tone: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30" },
  { id: "won",        label: "Won",        tone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  { id: "lost",       label: "Lost",       tone: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
];

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  website: string | null;
  monthly_revenue: string | null;
  current_ad_spend: string | null;
  services: string[];
  message: string | null;
  source: string;
  stage: Stage;
  owner_notes: string | null;
  n8n_forwarded: boolean;
  created_at: string;
}

// Mock Meta Ads KPIs — replace once Meta Marketing API is wired.
const META_KPIS = {
  spend_30d: 8420,
  impressions: 412_000,
  clicks: 9_180,
  ctr: 2.23,
  cpc: 0.92,
  roas: 3.6,
};

export default function GrowthConsole() {
  useSeo({
    title: "Growth Console — TrendFlux Digital",
    description: "Unified Meta Ads, CRM pipeline, and lead lifecycle for the Growth OS.",
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("growth_leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load leads", { description: error.message });
    } else {
      setLeads((data ?? []) as Lead[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const byStage = useMemo(() => {
    const map = new Map<Stage, Lead[]>(STAGES.map((s) => [s.id, []]));
    leads.forEach((l) => map.get(l.stage)?.push(l));
    return map;
  }, [leads]);

  const active = useMemo(
    () => leads.find((l) => l.id === activeId) ?? null,
    [leads, activeId],
  );

  useEffect(() => { setNoteDraft(active?.owner_notes ?? ""); }, [active]);

  const updateStage = async (id: string, stage: Stage) => {
    const prev = leads;
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, stage } : l)));
    const { error } = await supabase.from("growth_leads").update({ stage }).eq("id", id);
    if (error) {
      setLeads(prev);
      toast.error("Could not move lead", { description: error.message });
    } else {
      toast.success(`Moved to ${stage}`);
    }
  };

  const saveNotes = async () => {
    if (!active) return;
    const { error } = await supabase
      .from("growth_leads")
      .update({ owner_notes: noteDraft })
      .eq("id", active.id);
    if (error) {
      toast.error("Save failed", { description: error.message });
    } else {
      toast.success("Notes saved");
      setLeads((ls) => ls.map((l) => (l.id === active.id ? { ...l, owner_notes: noteDraft } : l)));
    }
  };

  const wonCount = byStage.get("won")?.length ?? 0;
  const conv = leads.length ? Math.round((wonCount / leads.length) * 100) : 0;

  return (
    <main className="min-h-dvh bg-background pb-24">
      <TfSection
        eyebrow="Growth OS"
        title="Growth Console"
        intro="Meta Ads performance, CRM pipeline, and end-to-end lead lifecycle in one surface."
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label="30-day Ad Spend" value={`$${META_KPIS.spend_30d.toLocaleString()}`} hint="Meta Ads" />
          <KpiCard label="ROAS" value={`${META_KPIS.roas}×`} hint="Blended" />
          <KpiCard label="Total Leads" value={leads.length.toString()} hint="All time" />
          <KpiCard label="Win Rate" value={`${conv}%`} hint={`${wonCount} won`} />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Pipeline */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              CRM Pipeline
            </h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {STAGES.map((stage) => {
                const items = byStage.get(stage.id) ?? [];
                return (
                  <Card key={stage.id} className="border-border/60 bg-card/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-sm">
                        <span>{stage.label}</span>
                        <Badge variant="outline" className={stage.tone}>{items.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {loading && <p className="text-xs text-muted-foreground">Loading…</p>}
                      {!loading && items.length === 0 && (
                        <p className="text-xs text-muted-foreground">No leads.</p>
                      )}
                      {items.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => setActiveId(l.id)}
                          className={`w-full rounded-md border border-border/60 bg-background/50 p-3 text-left transition hover:border-primary/60 hover:bg-background ${
                            activeId === l.id ? "ring-2 ring-primary/60" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium text-foreground">{l.name}</p>
                            {l.n8n_forwarded && (
                              <span className="text-[10px] uppercase tracking-wider text-emerald-400">n8n</span>
                            )}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">{l.company ?? l.email}</p>
                          {l.services?.length > 0 && (
                            <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground/80">
                              {l.services.join(" · ")}
                            </p>
                          )}
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
          <aside className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Lead Detail
            </h2>
            <Card className="border-border/60 bg-card/40">
              <CardContent className="space-y-4 pt-6">
                {!active && (
                  <p className="text-sm text-muted-foreground">
                    Select a lead from the pipeline to view details and update stage.
                  </p>
                )}
                {active && (
                  <>
                    <div>
                      <p className="text-lg font-semibold text-foreground">{active.name}</p>
                      <p className="text-sm text-muted-foreground">{active.email}</p>
                      {active.company && (
                        <p className="text-sm text-muted-foreground">{active.company}</p>
                      )}
                      {active.website && (
                        <a
                          href={active.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary underline"
                        >
                          {active.website}
                        </a>
                      )}
                    </div>

                    <dl className="grid grid-cols-2 gap-2 text-xs">
                      <Field label="Revenue" value={active.monthly_revenue} />
                      <Field label="Ad Spend" value={active.current_ad_spend} />
                      <Field label="Source" value={active.source} />
                      <Field
                        label="Created"
                        value={new Date(active.created_at).toLocaleDateString()}
                      />
                    </dl>

                    {active.message && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Message</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/90">
                          {active.message}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Stage</p>
                      <Select
                        value={active.stage}
                        onValueChange={(v) => updateStage(active.id, v as Stage)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STAGES.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                        Owner notes
                      </p>
                      <Textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        rows={4}
                        placeholder="Outreach context, next action, deal value…"
                      />
                      <Button size="sm" className="mt-2 w-full" onClick={saveNotes}>
                        Save notes
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </TfSection>
    </main>
  );
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="border-border/60 bg-card/40">
      <CardContent className="pt-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        {hint && <p className="mt-1 text-[11px] text-muted-foreground/80">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-foreground/90">{value ?? "—"}</dd>
    </div>
  );
}