import { useEffect, useState } from "react";
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
import { Loader2, Mail, Send } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";

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

  const sleep = (ms: number) =>
    new Promise<void>((r) => setTimeout(r, Math.max(0, ms)));

  const invokeWithRetry = async (subject: string, html: string) => {
    let lastErr: string | null = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const { error } = await supabase.functions.invoke("send-resend-email", {
        body: { to: testEmail, subject, html },
      });
      if (!error) return { ok: true as const, attempts: attempt + 1 };
      lastErr = error.message;
      if (attempt < maxRetries) {
        await sleep(retryDelayMs * Math.pow(2, attempt));
      }
    }
    return { ok: false as const, error: lastErr ?? "unknown" };
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

  const sendAllMapped = async () => {
    if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      toast.error("Enter a valid recipient email above");
      return;
    }
    const mapped = TALENT_STATUSES.filter(
      (s) => statusMap[s] && statusMap[s] !== "none",
    );
    if (mapped.length === 0) {
      toast.error("No statuses have a template mapped");
      return;
    }
    setSendingAll(true);
    setBulkProgress({ done: 0, total: mapped.length, ok: 0, failed: 0 });
    let ok = 0;
    let failed = 0;
    for (let i = 0; i < mapped.length; i++) {
      const status = mapped[i];
      const key = statusMap[status] as TemplateKey;
      const tpl = templates[key];
      if (!tpl) {
        failed++;
        setBulkProgress({ done: i + 1, total: mapped.length, ok, failed });
        continue;
      }
      const rendered = renderTemplate(tpl, {
        name: testName || "Test User",
        role: testRole || "Role",
        email: testEmail,
      });
      const result = await invokeWithRetry(
        `[TEST · ${status}] ${rendered.subject}`,
        `<div style="background:#fff3cd;border:1px solid #ffe69c;padding:8px 12px;margin-bottom:12px;font-family:sans-serif;font-size:12px;color:#664d03;">Preview / test email — status <b>${status}</b> → template <b>${key}</b></div>${rendered.html}`,
      );
      if (result.ok) ok++;
      else failed++;
      setBulkProgress({ done: i + 1, total: mapped.length, ok, failed });
      if (i < mapped.length - 1) await sleep(rateDelayMs);
    }
    setSendingAll(false);
    if (failed === 0) toast.success(`Sent ${ok} test emails to ${testEmail}`);
    else toast.error(`Sent ${ok}, failed ${failed}`);
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
            <div className="mt-4 flex justify-end">
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