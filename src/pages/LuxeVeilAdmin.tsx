import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, LogOut, Check, X, Mail, Search, RefreshCw, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;
type SortField = "created_at" | "name" | "email" | "status";
type SortDir = "asc" | "desc";

type RequestStatus = "pending" | "approved" | "rejected";
type Req = {
  id: string;
  name: string;
  email: string;
  reference: string | null;
  message: string;
  status: RequestStatus;
  created_at: string;
};

const statusStyle: Record<RequestStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rejected: "bg-red-500/15 text-red-300 border-red-500/30",
};

export default function LuxeVeilAdmin() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [rows, setRows] = useState<Req[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | RequestStatus>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", data.session.user.id);
      setHasAccess(roles?.some((r) => r.role === "admin") ?? false);
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
      .from("luxe_veil_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRows((data ?? []) as Req[]);
    setLoading(false);
  };

  useEffect(() => {
    if (hasAccess) load();
  }, [hasAccess]);

  const setStatus = async (id: string, status: RequestStatus) => {
    const prev = rows;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    const { error } = await supabase
      .from("luxe_veil_requests").update({ status }).eq("id", id);
    if (error) {
      setRows(prev);
      toast.error(error.message);
    } else {
      toast.success(`Marked as ${status}`);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-4 rounded-2xl glass p-8">
          <h1 className="font-display text-2xl font-bold">Admin only</h1>
          <p className="text-sm text-foreground/60">You need an admin role to view Luxe Veil requests.</p>
          <Button onClick={() => supabase.auth.signOut().then(() => navigate("/auth"))} variant="outline">Sign out</Button>
        </div>
      </div>
    );
  }

  const filtered = rows.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return (
      r.name.toLowerCase().includes(s) ||
      r.email.toLowerCase().includes(s) ||
      (r.reference ?? "").toLowerCase().includes(s) ||
      r.message.toLowerCase().includes(s)
    );
  });

  const counts = {
    all: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <h1 className="font-display text-xl font-bold">Luxe Veil · Invitation Requests</h1>
            <p className="text-xs text-foreground/60">Review, approve, or reject incoming requests.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin"><Button size="sm" variant="outline">Press Editor</Button></Link>
            <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-4 w-4 mr-1" />Refresh</Button>
            <Button size="sm" variant="outline" onClick={() => supabase.auth.signOut().then(() => navigate("/auth"))}>
              <LogOut className="h-4 w-4 mr-1" />Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, message…" className="pl-9" />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({counts.all})</SelectItem>
              <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
              <SelectItem value="approved">Approved ({counts.approved})</SelectItem>
              <SelectItem value="rejected">Rejected ({counts.rejected})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-gold" />
        ) : filtered.length === 0 ? (
          <p className="text-sm text-foreground/50 py-12 text-center">No requests match.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-xl glass p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{r.name}</h3>
                      <span className={`text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border ${statusStyle[r.status]}`}>
                        {r.status}
                      </span>
                    </div>
                    <a href={`mailto:${r.email}`} className="text-xs text-foreground/60 inline-flex items-center gap-1 hover:text-primary">
                      <Mail className="h-3 w-3" /> {r.email}
                    </a>
                    {r.reference && (
                      <p className="text-xs text-foreground/50 mt-1">Referred by: {r.reference}</p>
                    )}
                    <p className="text-xs text-foreground/40 mt-1">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={r.status === "approved"} onClick={() => setStatus(r.id, "approved")}>
                      <Check className="h-4 w-4 mr-1" />Approve
                    </Button>
                    <Button size="sm" variant="outline" disabled={r.status === "rejected"} onClick={() => setStatus(r.id, "rejected")}>
                      <X className="h-4 w-4 mr-1" />Reject
                    </Button>
                    {r.status !== "pending" && (
                      <Button size="sm" variant="ghost" onClick={() => setStatus(r.id, "pending")}>
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{r.message}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
