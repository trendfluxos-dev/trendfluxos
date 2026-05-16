import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, LogOut, Search, CheckCircle2, XCircle, Clock, Unlock } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { toast } from "sonner";

type Enrollment = {
  id: string;
  user_id: string;
  module_index: number;
  status: string;
  amount_bdt: number;
  bkash_trx_id: string | null;
  sender_phone: string | null;
  created_at: string;
  decided_at: string | null;
  decided_via: string | null;
  paid_at: string | null;
};

type EventRow = {
  id: string;
  enrollment_id: string | null;
  user_id: string;
  module_index: number | null;
  event_type: string;
  message: string | null;
  actor: string | null;
  created_at: string;
};

type Profile = { user_id: string; full_name: string | null; email: string | null; phone: string | null };

type UserBundle = {
  profile: Profile;
  enrollments: Enrollment[];
  events: EventRow[];
  lastDecidedAt: string | null;
  lastDecisionVia: string | null;
  paidCount: number;
  pendingCount: number;
};

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : "—");

function statusBadge(s: string) {
  if (s === "paid") return <Badge className="bg-emerald-600 hover:bg-emerald-600">paid</Badge>;
  if (s === "pending") return <Badge className="bg-amber-500 hover:bg-amber-500">pending</Badge>;
  if (s === "failed") return <Badge variant="destructive">failed</Badge>;
  return <Badge variant="secondary">{s}</Badge>;
}

function eventDot(t: string) {
  if (t === "approved" || t === "paid")
    return <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />;
  if (t === "rejected" || t === "failed")
    return <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />;
  if (t === "unlocked")
    return <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />;
  return <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />;
}

export default function CourseEnrollmentsAdmin() {
  const navigate = useNavigate();
  useSeo({ title: "Course Enrollments — Admin", description: "Per-user enrollment timeline.", noindex: true });

  const [authChecked, setAuthChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", data.session.user.id);
      const ok = roles?.some((r) => r.role === "admin") ?? false;
      setHasAccess(ok);
      setAuthChecked(true);
      if (ok) load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const load = async () => {
    setLoading(true);
    const [{ data: enr }, { data: ev }, { data: pr }] = await Promise.all([
      supabase.from("module_enrollments").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("enrollment_events").select("*").order("created_at", { ascending: false }).limit(1000),
      supabase.from("profiles").select("user_id, full_name, email, phone").limit(500),
    ]);
    setEnrollments((enr ?? []) as Enrollment[]);
    setEvents((ev ?? []) as EventRow[]);
    setProfiles((pr ?? []) as Profile[]);
    setLoading(false);
  };

  const bundles = useMemo<UserBundle[]>(() => {
    const map = new Map<string, UserBundle>();
    const pmap = new Map(profiles.map((p) => [p.user_id, p]));
    for (const e of enrollments) {
      const p = pmap.get(e.user_id) ?? { user_id: e.user_id, full_name: null, email: null, phone: null };
      const b = map.get(e.user_id) ?? {
        profile: p, enrollments: [], events: [],
        lastDecidedAt: null, lastDecisionVia: null, paidCount: 0, pendingCount: 0,
      };
      b.enrollments.push(e);
      if (e.status === "paid") b.paidCount++;
      if (e.status === "pending") b.pendingCount++;
      if (e.decided_at && (!b.lastDecidedAt || e.decided_at > b.lastDecidedAt)) {
        b.lastDecidedAt = e.decided_at;
        b.lastDecisionVia = e.decided_via;
      }
      map.set(e.user_id, b);
    }
    for (const ev of events) {
      const b = map.get(ev.user_id);
      if (b) b.events.push(ev);
    }
    return Array.from(map.values()).sort((a, b) => {
      const ta = a.enrollments[0]?.created_at ?? "";
      const tb = b.enrollments[0]?.created_at ?? "";
      return tb.localeCompare(ta);
    });
  }, [enrollments, events, profiles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bundles;
    return bundles.filter((b) =>
      [b.profile.full_name, b.profile.email, b.profile.phone, b.profile.user_id]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
      || b.enrollments.some((e) => e.bkash_trx_id?.toLowerCase().includes(q) || e.sender_phone?.includes(q))
    );
  }, [bundles, query]);

  const signOut = async () => { await supabase.auth.signOut(); navigate("/auth"); };

  if (!authChecked) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }
  if (!hasAccess) {
    return (
      <div className="min-h-screen grid place-items-center bg-background p-6">
        <div className="max-w-md text-center space-y-4 rounded-2xl border border-border p-8">
          <h1 className="font-display text-2xl font-bold">Admin only</h1>
          <p className="text-sm text-muted-foreground">You need the admin role to view enrollments.</p>
          <Button onClick={signOut} variant="outline">Sign out</Button>
        </div>
      </div>
    );
  }

  const totalPaid = bundles.reduce((s, b) => s + b.paidCount, 0);
  const totalPending = bundles.reduce((s, b) => s + b.pendingCount, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <h1 className="font-display text-xl font-bold">Course Enrollments</h1>
            <p className="text-xs text-muted-foreground">
              {bundles.length} students · {totalPaid} paid modules · {totalPending} pending
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search name, email, phone, TrxID…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 w-64 h-9"
              />
            </div>
            <Button onClick={load} size="sm" variant="outline" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
              Refresh
            </Button>
            <Button onClick={signOut} size="sm" variant="outline"><LogOut className="h-4 w-4 mr-1" />Sign out</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 space-y-3">
        {loading && filtered.length === 0 && (
          <div className="py-20 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="rounded-xl border border-border p-10 text-center text-muted-foreground text-sm">
            No enrollments match this search.
          </div>
        )}

        {filtered.map((b) => {
          const isOpen = expanded === b.profile.user_id;
          const last = b.events[0];
          return (
            <article key={b.profile.user_id} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : b.profile.user_id)}
                className="w-full flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-semibold truncate">
                    {b.profile.full_name || b.profile.email || b.profile.user_id.slice(0, 8)}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {b.profile.email} {b.profile.phone ? `· ${b.profile.phone}` : ""}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="outline" className="gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" />{b.paidCount}/8 paid</Badge>
                  {b.pendingCount > 0 && (
                    <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3 text-amber-500" />{b.pendingCount} pending</Badge>
                  )}
                  {b.lastDecidedAt && (
                    <Badge variant="outline" className="gap-1">
                      <span className="text-muted-foreground">Last {b.lastDecisionVia ?? "decision"}:</span>
                      <span>{fmt(b.lastDecidedAt)}</span>
                    </Badge>
                  )}
                  {last && (
                    <Badge variant="outline" className="gap-1">
                      <span className="text-muted-foreground">Last event:</span>
                      <span className="font-medium">{last.event_type}</span>
                    </Badge>
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border px-5 py-5 grid gap-6 md:grid-cols-2">
                  {/* Modules grid */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Modules</h3>
                    <div className="space-y-2">
                      {Array.from({ length: 8 }, (_, i) => i + 1).map((idx) => {
                        const rows = b.enrollments.filter((e) => e.module_index === idx)
                          .sort((a, c) => c.created_at.localeCompare(a.created_at));
                        const latest = rows[0];
                        return (
                          <div key={idx} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono text-xs w-6 text-muted-foreground">M{idx}</span>
                              {latest ? (
                                <span className="truncate">
                                  TrxID <code className="text-xs">{latest.bkash_trx_id ?? "—"}</code>
                                  {latest.sender_phone && <span className="text-muted-foreground"> · {latest.sender_phone}</span>}
                                </span>
                              ) : (
                                <span className="text-muted-foreground italic">no submission</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {latest ? statusBadge(latest.status) : <Badge variant="outline">locked</Badge>}
                              {rows.length > 1 && (
                                <span className="text-[10px] text-muted-foreground">{rows.length} attempts</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Timeline ({b.events.length})
                    </h3>
                    <ol className="space-y-3 max-h-[480px] overflow-auto pr-2">
                      {b.events.length === 0 && (
                        <li className="text-xs text-muted-foreground italic">No events logged yet.</li>
                      )}
                      {b.events.map((ev) => (
                        <li key={ev.id} className="flex gap-3 text-sm">
                          {eventDot(ev.event_type)}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium capitalize">{ev.event_type}</span>
                              {ev.module_index && <Badge variant="outline" className="text-[10px]">M{ev.module_index}</Badge>}
                              {ev.actor && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{ev.actor}</span>}
                            </div>
                            {ev.message && <p className="text-xs text-muted-foreground mt-0.5 break-words">{ev.message}</p>}
                            <p className="text-[10px] text-muted-foreground/70 mt-0.5">{fmt(ev.created_at)}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </article>
          );
        })}

        <div className="pt-4 text-[11px] text-muted-foreground">
          <Unlock className="inline h-3 w-3 mr-1" />
          Admin approvals are idempotent — duplicate Telegram clicks never double-send.
          Approve/reject decisions are HMAC-signed and protected by a unique index per enrollment.
        </div>
      </main>
    </div>
  );
}
