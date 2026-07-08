import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Mail, Send, CheckCircle2, XCircle, Ban } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export type TemplateKey = "approve" | "reject" | "hold";
export type TalentStatus =
  | "new"
  | "reviewing"
  | "shortlisted"
  | "rejected"
  | "hired";

export const TEMPLATE_KEYS: TemplateKey[] = ["approve", "reject", "hold"];
export const TALENT_STATUSES: TalentStatus[] = [
  "new",
  "reviewing",
  "shortlisted",
  "rejected",
  "hired",
];

export const TEMPLATES_KEY = "talent_email_templates";
export const STATUS_MAP_KEY = "talent_status_email_map";

export type TalentTemplate = { subject: string; html: string };
export type TalentTemplates = Record<TemplateKey, TalentTemplate>;
export type TalentStatusMap = Record<TalentStatus, TemplateKey | "none">;

export const DEFAULT_TEMPLATES: TalentTemplates = {
  approve: {
    subject: "Great news about your TrendFlux Talent application",
    html: `<p>Hi {{name}},</p>
<p>Congratulations — your application for <b>{{role}}</b> at TrendFlux has moved forward. Our team will reach out shortly with next steps.</p>
<p>— TrendFlux Talent</p>`,
  },
  reject: {
    subject: "Update on your TrendFlux Talent application",
    html: `<p>Hi {{name}},</p>
<p>Thank you for applying for <b>{{role}}</b>. After careful review, we won't be moving forward this time. We appreciate your interest and wish you the best.</p>
<p>— TrendFlux Talent</p>`,
  },
  hold: {
    subject: "Your TrendFlux Talent application is under review",
    html: `<p>Hi {{name}},</p>
<p>Your application for <b>{{role}}</b> is currently under review. We'll get back to you as soon as we have an update.</p>
<p>— TrendFlux Talent</p>`,
  },
};

export const DEFAULT_STATUS_MAP: TalentStatusMap = {
  new: "none",
  reviewing: "hold",
  shortlisted: "approve",
  rejected: "reject",
  hired: "approve",
};

export function renderTemplate(
  tpl: TalentTemplate,
  vars: { name: string; role: string; email: string },
): TalentTemplate {
  const replace = (s: string) =>
    s
      .split("{{name}}").join(vars.name)
      .split("{{role}}").join(vars.role)
      .split("{{email}}").join(vars.email);
  return { subject: replace(tpl.subject), html: replace(tpl.html) };
}

export default function TalentEmailsAdmin() {
  const navigate = useNavigate();
  useSeo({
    title: "Talent Emails — Admin",
    description: "Configure talent application email templates.",
    noindex: true,
  });
  const [authChecked, setAuthChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<TalentTemplates>(DEFAULT_TEMPLATES);
  const [statusMap, setStatusMap] =
    useState<TalentStatusMap>(DEFAULT_STATUS_MAP);
  const [testEmail, setTestEmail] = useState("");
  const [testName, setTestName] = useState("Test User");
  const [testRole, setTestRole] = useState("Content Creator");
  const [sendingKey, setSendingKey] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [maxRetries, setMaxRetries] = useState(2);
  const [retryDelayMs, setRetryDelayMs] = useState(1500);
  const [rateDelayMs, setRateDelayMs] = useState(500);
  const [bulkProgress, setBulkProgress] = useState<{
    done: number;
    total: number;
    ok: number;
    failed: number;
  } | null>(null);
  type BulkResult = {
    index: number;
    status: TalentStatus;
    template: TemplateKey;
    ok: boolean;
    error?: string;
    attempts?: number;
    at: number;
    phase: "before-cancel" | "after-cancel";
  };
  const [bulkResults, setBulkResults] = useState<BulkResult[]>([]);
  const [cancelRequestedAt, setCancelRequestedAt] = useState<number | null>(null);
  const [lastMappedList, setLastMappedList] = useState<TalentStatus[]>([]);
  const cancelBulkRef = useRef(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const sleep = (ms: number) =>
    new Promise<void>((r) => setTimeout(r, Math.max(0, ms)));

  const invokeWithRetry = async (subject: string, html: string) => {
    // Retries + exponential base delay are executed server-side by the
    // send-resend-email edge function so the same policy applies whether
    // this is triggered from the UI or from a scheduled backend job.
    const { data, error } = await supabase.functions.invoke("send-resend-email", {
      body: {
        to: testEmail,
        subject,
        html,
        maxRetries,
        retryBaseDelayMs: retryDelayMs,
      },
    });
    if (error) return { ok: false as const, error: error.message };
    const attempts = (data as { attempts?: number } | null)?.attempts ?? 1;
    return { ok: true as const, attempts };
  };

  const sendTest = async (
    key: TemplateKey | "none",
    label: string,
  ) => {
    if (key === "none") {
      toast.error("This status has no template assigned");
      return;
    }
    if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      toast.error("Enter a valid recipient email above");
      return;
    }
    const tpl = templates[key];
    if (!tpl) return;
    const rendered = renderTemplate(tpl, {
      name: testName || "Test User",
      role: testRole || "Role",
      email: testEmail,
    });
    setSendingKey(label);
    const { error } = await supabase.functions.invoke("send-resend-email", {
      body: {
        to: testEmail,
        subject: `[TEST] ${rendered.subject}`,
        html: `<div style="background:#fff3cd;border:1px solid #ffe69c;padding:8px 12px;margin-bottom:12px;font-family:sans-serif;font-size:12px;color:#664d03;">Preview / test email — ${key} template</div>${rendered.html}`,
      },
    });
    setSendingKey(null);
    if (error) toast.error(`Test failed: ${error.message}`);
    else toast.success(`Test ${key} email sent to ${testEmail}`);
  };

  const runSendBatch = async (
    targets: TalentStatus[],
    mode: "fresh" | "retry" | "resume",
  ) => {
    if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      toast.error("Enter a valid recipient email above");
      return;
    }
    if (targets.length === 0) {
      toast.error(
        mode === "retry"
          ? "No failed emails to retry"
          : mode === "resume"
            ? "No remaining emails to resume"
            : "No statuses have a template mapped",
      );
      return;
    }
    const mapped = targets;
    const baseIndex = mode === "fresh" ? 0 : bulkResults.length;
    setSendingAll(true);
    cancelBulkRef.current = false;
    setCancelling(false);
    setCancelRequestedAt(null);
    if (mode === "fresh") {
      setBulkResults([]);
      setLastMappedList(mapped);
    }
    setBulkProgress({ done: 0, total: mapped.length, ok: 0, failed: 0 });
    let ok = 0;
    let failed = 0;
    const startedAt = Date.now();
    for (let i = 0; i < mapped.length; i++) {
      if (cancelBulkRef.current) break;
      const status = mapped[i];
      const key = statusMap[status] as TemplateKey;
      const tpl = templates[key];
      if (!tpl) {
        failed++;
        setBulkProgress({ done: i + 1, total: mapped.length, ok, failed });
        setBulkResults((prev) => [
          ...prev,
          {
            index: baseIndex + i + 1,
            status,
            template: key,
            ok: false,
            error: "Template missing",
            at: Date.now(),
            phase: cancelBulkRef.current ? "after-cancel" : "before-cancel",
          },
        ]);
        continue;
      }
      const rendered = renderTemplate(tpl, {
        name: testName || "Test User",
        role: testRole || "Role",
        email: testEmail,
      });
      const cancelAtStart = cancelBulkRef.current;
      const subjectPrefix =
        mode === "retry" ? "RETRY" : mode === "resume" ? "RESUME" : "TEST";
      const result = await invokeWithRetry(
        `[${subjectPrefix} · ${status}] ${rendered.subject}`,
        `<div style="background:#fff3cd;border:1px solid #ffe69c;padding:8px 12px;margin-bottom:12px;font-family:sans-serif;font-size:12px;color:#664d03;">Preview / test email — status <b>${status}</b> → template <b>${key}</b> · <b>${subjectPrefix}</b></div>${rendered.html}`,
      );
      if (result.ok) ok++;
      else failed++;
      setBulkProgress({ done: i + 1, total: mapped.length, ok, failed });
      setBulkResults((prev) => [
        ...prev,
        {
          index: baseIndex + i + 1,
          status,
          template: key,
          ok: result.ok,
          error: result.ok ? undefined : (result as { error: string }).error,
          attempts: result.ok ? (result as { attempts: number }).attempts : undefined,
          at: Date.now(),
          phase: cancelAtStart || cancelBulkRef.current ? "after-cancel" : "before-cancel",
        },
      ]);
      if (i < mapped.length - 1 && !cancelBulkRef.current) await sleep(rateDelayMs);
    }
    const wasCancelled = cancelBulkRef.current;
    setSendingAll(false);
    setCancelling(false);
    cancelBulkRef.current = false;
    const label =
      mode === "retry" ? "Retry" : mode === "resume" ? "Resume" : "Bulk send";
    if (wasCancelled) {
      const done = ok + failed;
      const total = mapped.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      const remaining = Math.max(total - done, 0);
      toast.warning(`${label} cancelled`, {
        id: "talent-bulk-send",
        duration: 8000,
        description: [
          `Progress: ${pct}% (${done}/${total})`,
          `Sent: ${ok} · Failed: ${failed} · Skipped: ${remaining}`,
          `Status: stopped after current send · recipient ${testEmail}`,
        ].join("\n"),
      });
    } else if (failed === 0) toast.success(`${label}: sent ${ok} to ${testEmail}`);
    else toast.error(`${label}: sent ${ok}, failed ${failed}`);
    void startedAt;
  };

  const sendAllMapped = () => {
    const mapped = TALENT_STATUSES.filter(
      (s) => statusMap[s] && statusMap[s] !== "none",
    );
    return runSendBatch(mapped, "fresh");
  };

  // Unique statuses whose latest entry failed (excludes ones later retried OK).
  const failedStatuses = (() => {
    const latest = new Map<TalentStatus, boolean>();
    for (const r of bulkResults) latest.set(r.status, r.ok);
    return Array.from(latest.entries())
      .filter(([, ok]) => !ok)
      .map(([s]) => s);
  })();
  // Statuses that were in the original list but never attempted (skipped by cancel).
  const skippedStatuses = lastMappedList.filter(
    (s) => !bulkResults.some((r) => r.status === s),
  );

  const retryFailed = () => runSendBatch(failedStatuses, "retry");
  const resumeSkipped = () => runSendBatch(skippedStatuses, "resume");

  const cancelBulk = () => {
    if (!sendingAll) return;
    cancelBulkRef.current = true;
    setCancelling(true);
    setCancelRequestedAt(Date.now());
    const { done, total, ok, failed } = bulkProgress;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    toast.loading("Cancelling after current send…", {
      id: "talent-bulk-send",
      description: [
        `Progress so far: ${pct}% (${done}/${total})`,
        `Sent: ${ok} · Failed: ${failed}`,
        `Waiting for the in-flight email to finish before stopping…`,
      ].join("\n"),
    });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        navigate("/auth?redirect=/admin/talent/emails");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      const ok = roles?.some((r) => r.role === "admin") ?? false;
      if (!mounted) return;
      setHasAccess(ok);
      setAuthChecked(true);

      if (ok) {
        const { data: rows } = await supabase
          .from("site_settings")
          .select("key,value")
          .in("key", [TEMPLATES_KEY, STATUS_MAP_KEY]);
        const byKey = new Map((rows ?? []).map((r) => [r.key, r.value]));
        const t = byKey.get(TEMPLATES_KEY) as Partial<TalentTemplates> | undefined;
        if (t) setTemplates({ ...DEFAULT_TEMPLATES, ...t });
        const m = byKey.get(STATUS_MAP_KEY) as Partial<TalentStatusMap> | undefined;
        if (m) setStatusMap({ ...DEFAULT_STATUS_MAP, ...m });
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings").upsert(
      [
        { key: TEMPLATES_KEY, value: templates as unknown as never },
        { key: STATUS_MAP_KEY, value: statusMap as unknown as never },
      ],
      { onConflict: "key" },
    );
    setSaving(false);
    if (error) {
      toast.error(`Save failed: ${error.message}`);
      return;
    }
    toast.success("Email settings saved");
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
          Admin role required to edit talent email templates.
        </p>
        <Button onClick={() => navigate("/admin/talent")}>Back</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-4xl px-5 py-10">
      <header className="mb-6">
        <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-foreground/50">
          <Mail className="h-3.5 w-3.5" /> Admin · Talent Emails
        </div>
        <h1 className="font-display text-2xl">Talent application emails</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Placeholders you can use: <code>{"{{name}}"}</code>,{" "}
          <code>{"{{role}}"}</code>, <code>{"{{email}}"}</code>.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 font-display text-lg">Test email preview</h2>
            <p className="mb-3 text-xs text-foreground/60">
              Send any template to a recipient with sample placeholder values.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs uppercase tracking-wider text-foreground/60">
                  Recipient
                </Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-foreground/60">
                  Sample name
                </Label>
                <Input
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-foreground/60">
                  Sample role
                </Label>
                <Input
                  value={testRole}
                  onChange={(e) => setTestRole(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 font-display text-lg">
              Status → template mapping
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {TALENT_STATUSES.map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <Label className="w-24 text-sm capitalize">{status}</Label>
                  <Select
                    value={statusMap[status]}
                    onValueChange={(v) =>
                      setStatusMap((m) => ({
                        ...m,
                        [status]: v as TemplateKey | "none",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— no email —</SelectItem>
                      {TEMPLATE_KEYS.map((k) => (
                        <SelectItem key={k} value={k} className="capitalize">
                          {k}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={
                      statusMap[status] === "none" ||
                      sendingKey === `map-${status}`
                    }
                    onClick={() =>
                      sendTest(statusMap[status], `map-${status}`)
                    }
                    title="Send test email using the template mapped to this status"
                  >
                    {sendingKey === `map-${status}` ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-dashed border-border/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Bulk test controls</h3>
                <span className="text-[10px] uppercase tracking-wider text-foreground/50">
                  Client-side retry & pacing
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-foreground/60">
                    Max retries per email
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={5}
                    value={maxRetries}
                    onChange={(e) =>
                      setMaxRetries(
                        Math.max(0, Math.min(5, Number(e.target.value) || 0)),
                      )
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-foreground/60">
                    Retry base delay (ms)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step={100}
                    value={retryDelayMs}
                    onChange={(e) =>
                      setRetryDelayMs(Math.max(0, Number(e.target.value) || 0))
                    }
                  />
                  <p className="mt-1 text-[10px] text-foreground/50">
                    Exponential backoff: delay × 2^attempt
                  </p>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-foreground/60">
                    Between-emails delay (ms)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    step={100}
                    value={rateDelayMs}
                    onChange={(e) =>
                      setRateDelayMs(Math.max(0, Number(e.target.value) || 0))
                    }
                  />
                  <p className="mt-1 text-[10px] text-foreground/50">
                    Rate limit: pause between sends
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                {bulkProgress ? (
                  <div className="text-xs text-foreground/70">
                    Progress: {bulkProgress.done}/{bulkProgress.total} · ok{" "}
                    <span className="text-emerald-600">{bulkProgress.ok}</span> ·
                    failed{" "}
                    <span className="text-destructive">
                      {bulkProgress.failed}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-foreground/50">
                    Applies to "Test all status mappings"
                  </span>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={sendingAll}
                  onClick={sendAllMapped}
                >
                  {sendingAll ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-3.5 w-3.5" />
                  )}
                  Test all status mappings
                </Button>
                {sendingAll ? (
                  <AlertDialog
                    open={confirmCancelOpen}
                    onOpenChange={setConfirmCancelOpen}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={cancelling}
                      >
                        {cancelling ? "Cancelling…" : "Cancel"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Stop the bulk send?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {bulkProgress ? (
                            <>
                              Progress so far:{" "}
                              <strong>
                                {bulkProgress.done}/{bulkProgress.total}
                              </strong>{" "}
                              · sent{" "}
                              <strong className="text-emerald-600">
                                {bulkProgress.ok}
                              </strong>{" "}
                              · failed{" "}
                              <strong className="text-destructive">
                                {bulkProgress.failed}
                              </strong>
                              .<br />
                            </>
                          ) : null}
                          The email currently in flight will finish sending —
                          any remaining emails in the queue will be skipped and
                          logged under "After cancel".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep sending</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            setConfirmCancelOpen(false);
                            cancelBulk();
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, cancel
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : null}
              </div>

              {bulkProgress && bulkProgress.total > 0 && (
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-foreground/70">
                    <span className="inline-flex items-center gap-2">
                      {sendingAll && !cancelling && (
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      )}
                      {cancelling
                        ? "Cancelling — finishing current send…"
                        : sendingAll
                          ? "Sending…"
                          : bulkProgress.done < bulkProgress.total
                            ? "Stopped"
                            : "Complete"}
                    </span>
                    <span className="tabular-nums text-foreground/80">
                      {Math.round((bulkProgress.done / bulkProgress.total) * 100)}%
                      <span className="ml-2 text-foreground/50">
                        ({bulkProgress.done}/{bulkProgress.total})
                      </span>
                    </span>
                  </div>
                  <Progress
                    value={(bulkProgress.done / bulkProgress.total) * 100}
                    className={cancelling ? "[&>div]:bg-amber-500" : ""}
                    aria-label="Bulk email send progress"
                  />
                </div>
              )}

              {bulkResults.length > 0 && (
                <div className="mt-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold">
                      Per-email delivery log
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-foreground/60">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> success
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-destructive" /> failed
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Ban className="h-3 w-3 text-amber-600" /> post-cancel
                      </span>
                      <button
                        type="button"
                        className="text-primary underline-offset-2 hover:underline"
                        onClick={() => {
                          setBulkResults([]);
                          setBulkProgress(null);
                          setCancelRequestedAt(null);
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {(["before-cancel", "after-cancel"] as const).map((phase) => {
                    const rows = bulkResults.filter((r) => r.phase === phase);
                    if (rows.length === 0) return null;
                    const okCount = rows.filter((r) => r.ok).length;
                    const failCount = rows.length - okCount;
                    return (
                      <div
                        key={phase}
                        className={`overflow-hidden rounded-xl border ${
                          phase === "after-cancel"
                            ? "border-amber-500/40 bg-amber-500/[0.04]"
                            : "border-border bg-background/40"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-3 py-2 text-[11px] uppercase tracking-wider">
                          <span className="flex items-center gap-2 font-semibold text-foreground/80">
                            {phase === "after-cancel" ? (
                              <>
                                <Ban className="h-3.5 w-3.5 text-amber-600" />
                                After cancel
                              </>
                            ) : (
                              "Before cancel"
                            )}
                          </span>
                          <span className="text-foreground/60">
                            {rows.length} email{rows.length === 1 ? "" : "s"} ·{" "}
                            <span className="text-emerald-600">{okCount} ok</span>{" "}
                            ·{" "}
                            <span className="text-destructive">
                              {failCount} failed
                            </span>
                          </span>
                        </div>
                        <div className="max-h-64 overflow-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="sticky top-0 bg-card/95 text-[10px] uppercase tracking-wider text-foreground/50 backdrop-blur">
                              <tr>
                                <th className="px-3 py-2 font-medium">#</th>
                                <th className="px-3 py-2 font-medium">Status → Template</th>
                                <th className="px-3 py-2 font-medium">Result</th>
                                <th className="px-3 py-2 font-medium">Attempts</th>
                                <th className="px-3 py-2 font-medium">Time</th>
                                <th className="px-3 py-2 font-medium">Error</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((r) => (
                                <tr
                                  key={`${r.index}-${r.at}`}
                                  className="border-t border-border/40 align-top"
                                >
                                  <td className="px-3 py-2 font-mono text-foreground/60">
                                    {String(r.index).padStart(2, "0")}
                                  </td>
                                  <td className="px-3 py-2">
                                    <span className="capitalize">{r.status}</span>
                                    <span className="mx-1 text-foreground/40">→</span>
                                    <span className="capitalize font-medium">
                                      {r.template}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2">
                                    {r.ok ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Sent
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-destructive">
                                        <XCircle className="h-3 w-3" />
                                        Failed
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-foreground/70">
                                    {r.attempts ?? "—"}
                                  </td>
                                  <td className="px-3 py-2 text-foreground/60 tabular-nums">
                                    {new Date(r.at).toLocaleTimeString()}
                                  </td>
                                  <td className="px-3 py-2 text-destructive/90">
                                    {r.error ? (
                                      <span title={r.error} className="line-clamp-2">
                                        {r.error}
                                      </span>
                                    ) : (
                                      <span className="text-foreground/40">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}

                  {cancelRequestedAt && (
                    <p className="text-[11px] text-foreground/50">
                      Cancel requested at{" "}
                      <span className="tabular-nums">
                        {new Date(cancelRequestedAt).toLocaleTimeString()}
                      </span>
                      . Any send already in flight at that moment is listed under
                      "After cancel".
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {TEMPLATE_KEYS.map((key) => (
            <section
              key={key}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="font-display text-lg capitalize">
                  {key} template
                </h2>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={sendingKey === `tpl-${key}`}
                  onClick={() => sendTest(key, `tpl-${key}`)}
                >
                  {sendingKey === `tpl-${key}` ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-3.5 w-3.5" />
                  )}
                  Test send
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-foreground/60">
                    Subject
                  </Label>
                  <Input
                    value={templates[key].subject}
                    onChange={(e) =>
                      setTemplates((t) => ({
                        ...t,
                        [key]: { ...t[key], subject: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-foreground/60">
                    HTML body
                  </Label>
                  <Textarea
                    rows={8}
                    value={templates[key].html}
                    onChange={(e) =>
                      setTemplates((t) => ({
                        ...t,
                        [key]: { ...t[key], html: e.target.value },
                      }))
                    }
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </section>
          ))}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate("/admin/talent")}>
              Back
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}