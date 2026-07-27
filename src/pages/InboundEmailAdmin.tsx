import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CheckCircle2,
  Circle,
  Copy,
  Loader2,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/hooks/useSeo";

type StatusResponse = {
  ok: boolean;
  webhook_url: string;
  secret_configured: boolean;
  total_received: number;
  recent: { id: string; from_email: string; subject: string | null; status: string; received_at: string }[];
};

type TestStep = { name: string; ok: boolean; detail: string };

type TestResponse = {
  ok: boolean;
  webhook_url: string;
  steps: TestStep[];
  recent: StatusResponse["recent"];
  error?: string;
};

const STORAGE_KEY = "tf_hostinger_inbound_checklist_v1";

const MANUAL_STEPS = [
  {
    id: "open",
    title: "Open the mailbox webhook settings",
    hint: "Hostinger Agentic Mail → your mailbox → Webhooks / Integrations → Add webhook.",
  },
  {
    id: "url",
    title: "Paste the webhook URL",
    hint: "Method POST, payload format JSON (parsed) — not raw MIME.",
  },
  {
    id: "event",
    title: "Select the event “Inbound message received”",
    hint: "Only inbound delivery events should hit this endpoint.",
  },
  {
    id: "secret",
    title: "Add the x-webhook-secret header",
    hint: "Header name x-webhook-secret, value = the INBOUND_EMAIL_WEBHOOK_SECRET saved in your backend. If Hostinger cannot set custom headers, append ?secret=<value> to the URL instead.",
  },
  {
    id: "save",
    title: "Save and enable the webhook",
    hint: "Then send a real email to the mailbox and refresh the activity list below.",
  },
] as const;

type ManualState = Record<string, boolean>;

const loadManual = (): ManualState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ManualState) : {};
  } catch {
    return {};
  }
};

export default function InboundEmailAdmin() {
  const navigate = useNavigate();
  useSeo({
    title: "Inbound Email Webhook — Admin",
    description: "Hostinger Agentic Mail webhook setup checklist and end-to-end test.",
    noindex: true,
  });

  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [test, setTest] = useState<TestResponse | null>(null);
  const [manual, setManual] = useState<ManualState>({});

  useEffect(() => setManual(loadManual()), []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke<StatusResponse>(
        "inbound-email-test",
        { body: { action: "status" } },
      );
      if (error || !data) throw error ?? new Error("No response");
      setStatus(data);
    } catch (e) {
      toast.error("Could not load webhook status: " + (e instanceof Error ? e.message : "unknown"));
    } finally {
      setLoading(false);
    }
  }, []);

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
      setIsAdmin(ok);
      setAuthChecked(true);
      if (ok) void refresh();
    };
    void init();
  }, [navigate, refresh]);

  const toggleManual = (id: string) => {
    const next = { ...manual, [id]: !manual[id] };
    setManual(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed — select the text manually");
    }
  };

  const sendTest = async () => {
    setTesting(true);
    setTest(null);
    try {
      const { data, error } = await supabase.functions.invoke<TestResponse>(
        "inbound-email-test",
        { body: { action: "send-test" } },
      );
      if (error || !data) throw error ?? new Error("No response");
      setTest(data);
      if (data.ok) toast.success("Test delivery passed all checks");
      else toast.error(data.error ?? "Test delivery reported failures");
      void refresh();
    } catch (e) {
      toast.error("Test failed: " + (e instanceof Error ? e.message : "unknown"));
    } finally {
      setTesting(false);
    }
  };

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-3 px-4 text-center">
        <ShieldCheck className="h-8 w-8 text-muted-foreground" />
        <h1 className="font-display text-xl font-semibold">Admin access required</h1>
        <p className="text-sm text-muted-foreground">
          This page is limited to accounts with the admin role.
        </p>
      </main>
    );
  }

  const webhookUrl = status?.webhook_url ?? test?.webhook_url ?? "";
  const done = MANUAL_STEPS.filter((s) => manual[s.id]).length;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold">Inbound email webhook</h1>
            <p className="text-sm text-muted-foreground">
              Hostinger Agentic Mail setup checklist and end-to-end delivery test.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </header>

      {/* Connection details */}
      <section className="mb-6 rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-display text-lg font-semibold">Connection details</h2>

        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Webhook URL
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="min-w-0 flex-1 overflow-x-auto rounded-md border border-border bg-muted px-3 py-2 text-xs">
                {webhookUrl || "Loading…"}
              </code>
              <Button
                variant="outline"
                size="sm"
                disabled={!webhookUrl}
                onClick={() => void copy(webhookUrl, "Webhook URL")}
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Auth header name
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-xs">
                  x-webhook-secret
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void copy("x-webhook-secret", "Header name")}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Header value
              </p>
              <p className="rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
                The saved <code>INBOUND_EMAIL_WEBHOOK_SECRET</code> — never shown here for safety.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${
                status?.secret_configured
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-destructive/40 bg-destructive/10 text-destructive"
              }`}
            >
              {status?.secret_configured ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              Secret {status?.secret_configured ? "configured" : "missing"}
            </span>
            <span className="text-muted-foreground">
              {status?.total_received ?? 0} message{status?.total_received === 1 ? "" : "s"} received
            </span>
          </div>
        </div>
      </section>

      {/* Manual checklist */}
      <section className="mb-6 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold">Hostinger setup checklist</h2>
          <span className="text-xs tabular-nums text-muted-foreground">
            {done}/{MANUAL_STEPS.length}
          </span>
        </div>
        <ol className="divide-y divide-border">
          {MANUAL_STEPS.map((step, i) => {
            const isDone = Boolean(manual[step.id]);
            return (
              <li key={step.id} className="flex items-start gap-3 px-5 py-4">
                <button
                  type="button"
                  onClick={() => toggleManual(step.id)}
                  aria-pressed={isDone}
                  aria-label={`Mark “${step.title}” ${isDone ? "incomplete" : "complete"}`}
                  className="mt-0.5 shrink-0 transition-transform hover:scale-110"
                >
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/50" />
                  )}
                </button>
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${isDone ? "text-muted-foreground line-through" : ""}`}>
                    {i + 1}. {step.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{step.hint}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* One-click test */}
      <section className="mb-6 rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Send test email</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Posts a Hostinger-shaped delivery to the live webhook, verifies auth, parsing and
              duplicate handling, then removes the test message.
            </p>
          </div>
          <Button onClick={() => void sendTest()} disabled={testing || !status?.secret_configured}>
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {testing ? "Testing…" : "Send test email"}
          </Button>
        </div>

        {test && (
          <ul className="mt-5 space-y-2">
            {test.steps.map((s) => (
              <li
                key={s.name}
                className="flex items-start gap-2.5 rounded-lg border border-border bg-background px-3 py-2.5"
              >
                {s.ok ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent activity */}
      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold">Recent inbound messages</h2>
        </div>
        {status?.recent?.length ? (
          <ul className="divide-y divide-border">
            {status.recent.map((r) => (
              <li key={r.id} className="px-5 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{r.subject || "(no subject)"}</p>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {r.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {r.from_email} · {new Date(r.received_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-6 text-sm text-muted-foreground">
            No inbound messages yet. Once Hostinger delivers the first email it appears here.
          </p>
        )}
      </section>
    </main>
  );
}
