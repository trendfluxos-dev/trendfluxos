import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, ExternalLink, Mail, Phone, Users } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import {
  DEFAULT_STATUS_MAP,
  DEFAULT_TEMPLATES,
  STATUS_MAP_KEY,
  TEMPLATES_KEY,
  renderTemplate,
  type TalentStatusMap,
  type TalentTemplates,
  type TemplateKey,
} from "./TalentEmailsAdmin";
import { Link } from "react-router-dom";

type Status = "new" | "reviewing" | "shortlisted" | "rejected" | "hired";
const STATUSES: readonly Status[] = [
  "new",
  "reviewing",
  "shortlisted",
  "rejected",
  "hired",
] as const;

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  portfolio_url: string | null;
  linkedin_url: string | null;
  skills: string[];
  experience_years: number | null;
  cover_letter: string | null;
  source: string;
  status: Status;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
};

const STATUS_VARIANT: Record<Status, string> = {
  new: "bg-primary/15 text-primary",
  reviewing: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  shortlisted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  rejected: "bg-destructive/15 text-destructive",
  hired: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
};

export default function TalentApplicationsAdmin() {
  const navigate = useNavigate();
  useSeo({
    title: "Talent Applications — Admin",
    description: "Review TrendFlux Talent applications.",
    noindex: true,
  });
  const [authChecked, setAuthChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<TalentTemplates>(DEFAULT_TEMPLATES);
  const [statusMap, setStatusMap] = useState<TalentStatusMap>(DEFAULT_STATUS_MAP);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        navigate("/auth?redirect=/admin/talent");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      const ok =
        roles?.some((r) => r.role === "admin" || r.role === "editor") ?? false;
      if (!mounted) return;
      setHasAccess(ok);
      setAuthChecked(true);
    };
    init();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("talent_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      toast.error("Could not load applications");
      console.error(error);
      setRows([]);
    } else {
      setRows((data ?? []) as Row[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (hasAccess) load();
  }, [hasAccess, load]);

  useEffect(() => {
    if (!hasAccess) return;
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key,value")
        .in("key", [TEMPLATES_KEY, STATUS_MAP_KEY]);
      const byKey = new Map((data ?? []).map((r) => [r.key, r.value]));
      const t = byKey.get(TEMPLATES_KEY) as Partial<TalentTemplates> | undefined;
      if (t) setTemplates({ ...DEFAULT_TEMPLATES, ...t });
      const m = byKey.get(STATUS_MAP_KEY) as Partial<TalentStatusMap> | undefined;
      if (m) setStatusMap({ ...DEFAULT_STATUS_MAP, ...m });
    })();
  }, [hasAccess]);

  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  const counts = useMemo(() => {
    const c: Record<Status | "all", number> = {
      all: rows.length,
      new: 0,
      reviewing: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0,
    };
    for (const r of rows) c[r.status]++;
    return c;
  }, [rows]);

  const updateStatus = async (row: Row, status: Status) => {
    setSavingId(row.id);
    const { error } = await supabase
      .from("talent_applications")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        review_notes: notesDraft[row.id] ?? row.review_notes,
      })
      .eq("id", row.id);
    setSavingId(null);
    if (error) {
      toast.error(`Update failed: ${error.message}`);
      return;
    }
    toast.success(`Marked as ${status}`);
    const templateKey = statusMap[status];
    if (templateKey && templateKey !== "none" && row.email) {
      const tpl = templates[templateKey as TemplateKey];
      if (tpl) {
        const rendered = renderTemplate(tpl, {
          name: row.name,
          role: row.role,
          email: row.email,
        });
        supabase.functions
          .invoke("send-resend-email", {
            body: {
              to: row.email,
              subject: rendered.subject,
              html: rendered.html,
            },
          })
          .then(({ error: emailErr }) => {
            if (emailErr) toast.error(`Email failed: ${emailErr.message}`);
            else toast.success(`Email sent (${templateKey})`);
          });
      }
    }
    load();
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (!hasAccess) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-2xl">Access denied</h1>
        <p className="text-sm text-foreground/70">
          You need admin or editor role to view talent applications.
        </p>
        <Button onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-6xl px-5 py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-foreground/50">
            <Users className="h-3.5 w-3.5" /> Admin · TrendFlux Talent
          </div>
          <h1 className="font-display text-2xl">Talent Applications</h1>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Refresh
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin/talent/emails">
            <Mail className="mr-2 h-4 w-4" /> Email templates
          </Link>
        </Button>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              filter === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-card/70"
            }`}
          >
            {s} <span className="opacity-70">({counts[s]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-foreground/60">
          No applications match this filter yet.
        </div>
      ) : (
        <ul className="space-y-4">
          {filtered.map((row) => {
            const notes = notesDraft[row.id] ?? row.review_notes ?? "";
            return (
              <li
                key={row.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-lg">{row.name}</h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_VARIANT[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-foreground/60">
                      {row.role} · {new Date(row.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`mailto:${row.email}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs hover:bg-card/70"
                    >
                      <Mail className="h-3 w-3" /> {row.email}
                    </a>
                    {row.phone && (
                      <a
                        href={`tel:${row.phone}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs hover:bg-card/70"
                      >
                        <Phone className="h-3 w-3" /> {row.phone}
                      </a>
                    )}
                    {row.portfolio_url && (
                      <a
                        href={row.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs hover:bg-card/70"
                      >
                        <ExternalLink className="h-3 w-3" /> Portfolio
                      </a>
                    )}
                    {row.linkedin_url && (
                      <a
                        href={row.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs hover:bg-card/70"
                      >
                        <ExternalLink className="h-3 w-3" /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>

                {(row.skills?.length > 0 || row.experience_years != null) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {row.experience_years != null && (
                      <Badge variant="secondary">
                        {row.experience_years} yr exp
                      </Badge>
                    )}
                    {row.skills?.map((s) => (
                      <Badge key={s} variant="outline">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}

                {row.cover_letter && (
                  <p className="mt-3 whitespace-pre-wrap rounded-lg bg-background p-3 text-sm text-foreground/80">
                    {row.cover_letter}
                  </p>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <Textarea
                    value={notes}
                    onChange={(e) =>
                      setNotesDraft((prev) => ({
                        ...prev,
                        [row.id]: e.target.value,
                      }))
                    }
                    placeholder="Internal review notes (saved with the next status change)"
                    rows={2}
                    className="text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <Select
                      value={row.status}
                      onValueChange={(v) => updateStatus(row, v as Status)}
                      disabled={savingId === row.id}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {savingId === row.id && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}