import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TfSection } from "@/components/tf/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSeo } from "@/hooks/useSeo";

type LifecycleStatus =
  | "new" | "prospected" | "contacted" | "replied"
  | "qualified" | "proposal_sent" | "won" | "lost" | "nurture";

const STATUS_TONE: Record<LifecycleStatus, string> = {
  new:            "bg-sky-500/15 text-sky-300 border-sky-500/30",
  prospected:     "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  contacted:      "bg-amber-500/15 text-amber-300 border-amber-500/30",
  replied:        "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  qualified:      "bg-violet-500/15 text-violet-300 border-violet-500/30",
  proposal_sent:  "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  won:            "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  lost:           "bg-rose-500/15 text-rose-300 border-rose-500/30",
  nurture:        "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

interface HistoryEntry {
  at: string;
  event?: string;
  lifecycle_status?: string;
  sequence_name?: string | null;
  sequence_step?: number | null;
  channel?: string | null;
  note?: string | null;
  n8n_run_id?: string | null;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  created_at: string;
  lifecycle_status: LifecycleStatus;
  sequence_name: string | null;
  sequence_step: number;
  outreach_channel: string | null;
  last_contacted_at: string | null;
  next_followup_at: string | null;
  prospect_score: number;
  lifecycle_history: HistoryEntry[] | null;
}

const CHANNELS = ["email", "linkedin", "whatsapp", "sms", "call", "other"];
const STATUS_FILTERS: ("all" | LifecycleStatus)[] = [
  "all", "new", "prospected", "contacted", "replied",
  "qualified", "proposal_sent", "won", "lost", "nurture",
];

function relTime(iso: string | null) {
  if (!iso) return "—";
  const ms = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(ms);
  const m = Math.round(abs / 60_000);
  if (m < 60) return ms < 0 ? `${m}m ago` : `in ${m}m`;
  const h = Math.round(m / 60);
  if (h < 48) return ms < 0 ? `${h}h ago` : `in ${h}h`;
  const d = Math.round(h / 24);
  return ms < 0 ? `${d}d ago` : `in ${d}d`;
}

export default function LeadLifecycle() {
  useSeo({
    title: "Lead Lifecycle — Growth OS",
    description: "Lifecycle status, follow-ups, and outreach history for every captured lead.",
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | LifecycleStatus>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sequence, setSequence] = useState("cold-email-v1");
  const [channel, setChannel] = useState("email");
  const [delayMin, setDelayMin] = useState(0);
  const [starting, setStarting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("growth_leads")
      .select("id, name, email, company, created_at, lifecycle_status, sequence_name, sequence_step, outreach_channel, last_contacted_at, next_followup_at, prospect_score, lifecycle_history")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load leads", { description: error.message });
    else setLeads((data ?? []) as unknown as Lead[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => filter === "all" ? leads : leads.filter((l) => l.lifecycle_status === filter),
    [leads, filter],
  );
  const active = useMemo(
    () => leads.find((l) => l.id === activeId) ?? null,
    [leads, activeId],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const l of leads) c[l.lifecycle_status] = (c[l.lifecycle_status] ?? 0) + 1;
    return c;
  }, [leads]);

  const dueNow = useMemo(
    () => leads.filter((l) => l.next_followup_at && new Date(l.next_followup_at) <= new Date()).length,
    [leads],
  );

  const startOutreach = async () => {
    if (!active) return;
    setStarting(true);
    try {
      const { data, error } = await supabase.functions.invoke("lead-outreach-start", {
        body: {
          lead_id: active.id,
          sequence_name: sequence,
          outreach_channel: channel,
          starts_in_minutes: delayMin,
        },
      });
      if (error) throw new Error(error.message);
      if (!(data as { ok?: boolean })?.ok) throw new Error("Function reported failure");
      const forwarded = (data as { forwarded?: boolean }).forwarded;
      toast.success(`Outreach started${forwarded ? " · forwarded to n8n" : " (n8n not forwarded)"}`);
      await load();
    } catch (err) {
      toast.error("Could not start outreach", { description: (err as Error).message });
    } finally {
      setStarting(false);
    }
  };

  return (
    <main className="min-h-dvh bg-background pb-24">
      <TfSection
        eyebrow="Growth OS"
        title="Lead Lifecycle"
        intro="Live view of every captured lead with current lifecycle state, next follow-up, and full n8n outreach history."
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi label="Total leads" value={leads.length.toString()} />
          <Kpi label="Due now" value={dueNow.toString()} hint="next_followup_at ≤ now" />
          <Kpi label="Active sequences" value={(counts.prospected ?? 0 + counts.contacted ?? 0).toString()} hint="prospected + contacted" />
          <Kpi label="Replied" value={(counts.replied ?? 0).toString()} />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
                filter === s
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border/60 text-muted-foreground hover:border-primary/50"
              }`}
            >
              {s.replace("_", " ")}
              {s !== "all" && counts[s] != null && (
                <span className="ml-1 text-[10px] text-muted-foreground">{counts[s]}</span>
              )}
            </button>
          ))}
          <Button size="sm" variant="outline" onClick={load} className="ml-auto">
            Refresh
          </Button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* Lead list */}
          <div className="space-y-2">
            {loading && <p className="text-sm text-muted-foreground">Loading leads…</p>}
            {!loading && filtered.length === 0 && (
              <p className="text-sm text-muted-foreground">No leads in this view.</p>
            )}
            {filtered.map((l) => {
              const due = l.next_followup_at && new Date(l.next_followup_at) <= new Date();
              return (
                <button
                  key={l.id}
                  onClick={() => setActiveId(l.id)}
                  className={`w-full rounded-lg border bg-card/40 p-4 text-left transition hover:border-primary/60 ${
                    activeId === l.id ? "border-primary/70 ring-2 ring-primary/30" : "border-border/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">{l.name}</p>
                        <Badge variant="outline" className={STATUS_TONE[l.lifecycle_status]}>
                          {l.lifecycle_status.replace("_", " ")}
                        </Badge>
                        {due && (
                          <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-300">
                            due
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {l.company ? `${l.company} · ` : ""}{l.email}
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-muted-foreground">
                      <p>next: {relTime(l.next_followup_at)}</p>
                      <p>seq: {l.sequence_name ?? "—"} · step {l.sequence_step}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail + timeline */}
          <aside className="space-y-3 lg:sticky lg:top-4 lg:self-start">
            <Card className="border-border/60 bg-card/40">
              <CardHeader>
                <CardTitle className="text-base">
                  {active ? active.name : "Lead detail"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!active && (
                  <p className="text-sm text-muted-foreground">
                    Select a lead to view lifecycle history and start an outreach sequence.
                  </p>
                )}
                {active && (
                  <>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">{active.email}</p>
                      {active.company && <p className="text-muted-foreground">{active.company}</p>}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline" className={STATUS_TONE[active.lifecycle_status]}>
                          {active.lifecycle_status.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline" className="border-border/60">
                          score {active.prospect_score}
                        </Badge>
                        {active.outreach_channel && (
                          <Badge variant="outline" className="border-border/60">
                            {active.outreach_channel}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-2 text-xs">
                      <Field label="Sequence" value={active.sequence_name ?? "—"} />
                      <Field label="Step" value={active.sequence_step.toString()} />
                      <Field label="Last contacted" value={relTime(active.last_contacted_at)} />
                      <Field label="Next follow-up" value={relTime(active.next_followup_at)} />
                    </dl>

                    <div className="rounded-md border border-border/60 bg-background/40 p-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Start outreach
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={sequence}
                          onChange={(e) => setSequence(e.target.value)}
                          placeholder="sequence name"
                          className="h-9 text-xs"
                        />
                        <Select value={channel} onValueChange={setChannel}>
                          <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CHANNELS.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min={0}
                          value={delayMin}
                          onChange={(e) => setDelayMin(Number(e.target.value))}
                          placeholder="start in (min)"
                          className="h-9 text-xs col-span-2"
                        />
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={starting}
                        onClick={startOutreach}
                      >
                        {starting ? "Starting…" : "Start outreach → n8n"}
                      </Button>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Lifecycle timeline
                      </p>
                      <Timeline entries={active.lifecycle_history ?? []} />
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

function Timeline({ entries }: { entries: HistoryEntry[] }) {
  if (!entries.length) {
    return <p className="text-xs text-muted-foreground">No lifecycle events yet.</p>;
  }
  const ordered = [...entries].reverse();
  return (
    <ol className="relative space-y-3 border-l border-border/60 pl-4">
      {ordered.map((e, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-medium text-foreground">{e.event ?? "update"}</span>
            {e.lifecycle_status && (
              <Badge
                variant="outline"
                className={STATUS_TONE[e.lifecycle_status as LifecycleStatus] ?? "border-border/60"}
              >
                {e.lifecycle_status.replace("_", " ")}
              </Badge>
            )}
            {e.channel && <span className="text-muted-foreground">· {e.channel}</span>}
            {e.sequence_name && (
              <span className="text-muted-foreground">· {e.sequence_name} #{e.sequence_step ?? 0}</span>
            )}
          </div>
          {e.note && <p className="mt-0.5 text-xs text-foreground/80">{e.note}</p>}
          <p className="mt-0.5 text-[11px] text-muted-foreground/70">
            {new Date(e.at).toLocaleString()} · {relTime(e.at)}
          </p>
        </li>
      ))}
    </ol>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
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