import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut, ShieldCheck, RefreshCw, Mail, Building2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSeo } from "@/hooks/useSeo";
import { toast } from "sonner";

type DemoRequest = {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  team_size: string;
  message: string | null;
  source: string;
  status: "new" | "contacted" | "closed" | string;
  created_at: string;
  updated_at: string;
};

const STATUSES = ["new", "contacted", "closed"] as const;

const statusLabel: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

const statusTone: Record<string, string> = {
  new: "bg-primary/15 text-primary border-primary/30",
  contacted: "bg-gold/15 text-gold border-gold/30",
  closed: "bg-foreground/10 text-foreground/60 border-foreground/20",
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function EnterpriseDemos() {
  const navigate = useNavigate();
  useSeo({
    title: "Enterprise Demo Requests — Admin",
    description: "Triage incoming Enterprise Control demo requests.",
    noindex: true,
  });

  const [authChecked, setAuthChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [rows, setRows] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Filters
  const [status, setStatus] = useState<"all" | "new" | "contacted" | "closed">("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [q, setQ] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        navigate("/auth");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      const ok = roles?.some((r) => r.role === "admin") ?? false;
      setHasAccess(ok);
      setAuthChecked(true);
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) navigate("/auth");
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("enterprise_demo_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Could not load demo requests");
      setRows([]);
    } else {
      setRows((data ?? []) as DemoRequest[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (hasAccess) load();
  }, [hasAccess]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (from && new Date(r.created_at) < new Date(from)) return false;
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        if (new Date(r.created_at) > end) return false;
      }
      if (q.trim()) {
        const hay =
          `${r.name} ${r.email} ${r.company} ${r.role} ${r.message ?? ""}`.toLowerCase();
        if (!hay.includes(q.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, status, from, to, q]);

  const counts = useMemo(() => {
    const base = { all: rows.length, new: 0, contacted: 0, closed: 0 } as Record<string, number>;
    for (const r of rows) base[r.status] = (base[r.status] ?? 0) + 1;
    return base;
  }, [rows]);

  const updateStatus = async (id: string, next: string) => {
    setUpdating(id);
    const { error } = await supabase
      .from("enterprise_demo_requests")
      .update({ status: next })
      .eq("id", id);
    if (error) {
      toast.error("Update failed");
    } else {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: next } : r)));
      toast.success(`Marked as ${statusLabel[next] ?? next}`);
    }
    setUpdating(null);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!authChecked) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background px-6">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <ShieldCheck className="w-8 h-8 mx-auto text-primary" />
          <h1 className="font-display text-xl font-bold mt-4">Admin access required</h1>
          <p className="text-sm text-foreground/60 mt-2">
            Your account doesn't have admin privileges for this dashboard.
          </p>
          <Button className="mt-5" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-primary">Admin</p>
            <h1 className="font-display text-2xl md:text-3xl font-bold mt-1">
              Enterprise Demo Requests
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        {/* Stat chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "new", "contacted", "closed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors ${
                status === s
                  ? "bg-primary/15 text-primary border-primary/40"
                  : "border-border/60 text-foreground/60 hover:text-foreground"
              }`}
            >
              {s === "all" ? "All" : statusLabel[s]} · {counts[s] ?? 0}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-4 md:p-5 grid md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1.5">
            <Label htmlFor="q">Search</Label>
            <Input
              id="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="name, email, company…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabel[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="from">From</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to">To</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-foreground/60">
            No demo requests match these filters.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <article
                key={r.id}
                className="glass rounded-2xl p-5 md:p-6 grid md:grid-cols-[1fr_auto] gap-4 items-start"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-semibold">{r.name}</h3>
                    <Badge variant="outline" className={statusTone[r.status] ?? ""}>
                      {statusLabel[r.status] ?? r.status}
                    </Badge>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">
                      {r.source}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-foreground/70">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-foreground/40" />
                      <a
                        href={`mailto:${r.email}`}
                        className="hover:text-primary transition-colors break-all"
                      >
                        {r.email}
                      </a>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-foreground/40" />
                      {r.company} · {r.role}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-foreground/40" />
                      {fmtDate(r.created_at)}
                    </span>
                    <span className="text-foreground/40">Team: {r.team_size}</span>
                  </div>
                  {r.message && (
                    <p className="text-sm text-foreground/65 leading-relaxed border-l-2 border-primary/30 pl-3 mt-2">
                      {r.message}
                    </p>
                  )}
                </div>
                <div className="md:w-48">
                  <Label className="text-[11px] uppercase tracking-[0.2em] text-foreground/40">
                    Status
                  </Label>
                  <Select
                    value={r.status}
                    onValueChange={(v) => updateStatus(r.id, v)}
                    disabled={updating === r.id}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {statusLabel[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
