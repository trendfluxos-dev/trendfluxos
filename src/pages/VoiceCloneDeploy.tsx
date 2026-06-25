import { useEffect, useState } from "react";
import { Loader2, Rocket, Activity, CheckCircle2, XCircle, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";

type StatusResp = {
  live: boolean;
  endpoint: string;
  webhook_configured: boolean;
  checks: {
    health: { ok: boolean; ms: number; value?: { status: number; body: string }; error?: string };
    docs: { ok: boolean; ms: number; value?: { status: number; ok: boolean }; error?: string };
  };
  checked_at: string;
};

type VerifyResp = {
  ok: boolean;
  checks: {
    health: { ok: boolean; ms: number; error?: string };
    generate: { ok: boolean; ms: number; value?: { contentType: string; audio_bytes?: number; body?: string }; error?: string };
  };
  checked_at: string;
};

const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/xtts-deploy`;

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sign in required");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

const StatusDot = ({ ok }: { ok: boolean }) => (
  <span
    className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"} ${ok ? "animate-pulse" : ""}`}
    aria-label={ok ? "ok" : "down"}
  />
);

const VoiceCloneDeploy = () => {
  useSeo({
    title: "Voice Studio Deploy — TrendFlux",
    description: "Founder-only one-click deploy + health check for the XTTS-v2 voice engine.",
  });

  const [status, setStatus] = useState<StatusResp | null>(null);
  const [statusErr, setStatusErr] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verify, setVerify] = useState<VerifyResp | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const append = (line: string) =>
    setLog((prev) => [`${new Date().toLocaleTimeString()}  ${line}`, ...prev].slice(0, 50));

  const fetchStatus = async () => {
    setPolling(true);
    setStatusErr(null);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${fnUrl}?action=status`, { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `status ${res.status}`);
      setStatus(json as StatusResp);
      append(`status → ${json.live ? "LIVE" : "DOWN"}  (${json.checks.health.ms}ms health · ${json.checks.docs.ms}ms docs)`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatusErr(msg);
      append(`status error → ${msg}`);
    } finally {
      setPolling(false);
    }
  };

  const handleDeploy = async () => {
    setDeploying(true);
    append("trigger → calling VPS deploy webhook…");
    try {
      const headers = await authHeaders();
      const res = await fetch(`${fnUrl}?action=trigger`, { method: "POST", headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? json.hint ?? `trigger ${res.status}`);
      append(`trigger → ${json.triggered ? "accepted" : "failed"} (${json.ms}ms)`);
      toast.success(json.triggered ? "Deploy triggered — polling for LIVE…" : "Deploy call returned an error");
      // Poll status for ~5 minutes (XTTS first boot can be slow)
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        await fetchStatus();
        if ((await (async () => status)()) && status?.live) break;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      append(`trigger error → ${msg}`);
      toast.error(msg);
    } finally {
      setDeploying(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerify(null);
    append("verify → /health + /generate smoke test…");
    try {
      const headers = await authHeaders();
      const res = await fetch(`${fnUrl}?action=verify`, { method: "POST", headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `verify ${res.status}`);
      setVerify(json as VerifyResp);
      append(`verify → ${json.ok ? "PASS" : "FAIL"}`);
      json.ok ? toast.success("Voice engine verified") : toast.error("Verification failed");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      append(`verify error → ${msg}`);
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    void fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const live = !!status?.live;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Founder-only · Deployment Console
            </p>
            <h1 className="flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
              <Rocket className="h-7 w-7" /> Voice Studio Deploy
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              One-click trigger for <code className="rounded bg-muted px-1 py-0.5 text-xs">deploy.sh</code> on your XTTS-v2 VPS, with live health checks.
            </p>
          </div>
          <Badge variant={live ? "default" : "secondary"} className="gap-2 px-3 py-1.5 text-sm">
            <StatusDot ok={live} />
            {polling ? "Checking…" : live ? "LIVE" : "Offline"}
          </Badge>
        </header>

        {/* Status card */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Activity className="h-5 w-5" /> Health checks
            </h2>
            <Button size="sm" variant="outline" onClick={fetchStatus} disabled={polling}>
              {polling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
          </div>
          {statusErr && (
            <p className="mb-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {statusErr}
            </p>
          )}
          {status && (
            <div className="grid gap-3 sm:grid-cols-2">
              <CheckRow
                label="VPS /health"
                ok={status.checks.health.ok && (status.checks.health.value?.status ?? 500) < 500}
                detail={status.checks.health.error ?? `HTTP ${status.checks.health.value?.status} · ${status.checks.health.ms}ms`}
              />
              <CheckRow
                label="VPS /docs (FastAPI)"
                ok={status.checks.docs.ok && (status.checks.docs.value?.ok ?? false)}
                detail={status.checks.docs.error ?? `HTTP ${status.checks.docs.value?.status} · ${status.checks.docs.ms}ms`}
              />
              <CheckRow label="Endpoint" ok detail={status.endpoint} mono />
              <CheckRow
                label="Deploy webhook"
                ok={status.webhook_configured}
                detail={status.webhook_configured ? "XTTS_DEPLOY_WEBHOOK_URL set" : "Not configured (Deploy button disabled)"}
              />
            </div>
          )}
          {status && (
            <p className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground">
              Checked {new Date(status.checked_at).toLocaleString()}
            </p>
          )}
        </section>

        {/* Actions */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <ActionCard
            title="Deploy"
            description="Triggers deploy.sh on the VPS via XTTS_DEPLOY_WEBHOOK_URL, then polls status until LIVE."
            button={
              <Button
                onClick={handleDeploy}
                disabled={deploying || !status?.webhook_configured}
                className="w-full"
              >
                {deploying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
                Deploy now
              </Button>
            }
          />
          <ActionCard
            title="Verify engine"
            description="Runs /health + a tiny /generate smoke test using the latest uploaded voice."
            button={
              <Button onClick={handleVerify} disabled={verifying} variant="secondary" className="w-full">
                {verifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Run smoke test
              </Button>
            }
          />
        </section>

        {/* Verify result */}
        {verify && (
          <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              {verify.ok ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
              Smoke test {verify.ok ? "passed" : "failed"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <CheckRow label="/health" ok={verify.checks.health.ok} detail={verify.checks.health.error ?? `${verify.checks.health.ms}ms`} />
              <CheckRow
                label="/generate"
                ok={verify.checks.generate.ok}
                detail={
                  verify.checks.generate.error ??
                  (verify.checks.generate.value?.audio_bytes
                    ? `${(verify.checks.generate.value.audio_bytes / 1024).toFixed(1)} KB audio · ${verify.checks.generate.ms}ms`
                    : `${verify.checks.generate.value?.contentType ?? ""} · ${verify.checks.generate.ms}ms`)
                }
              />
            </div>
          </section>
        )}

        {/* Live log */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Live log</h2>
          <pre className="max-h-72 overflow-auto rounded-lg bg-muted/40 p-3 font-mono text-xs leading-relaxed text-foreground/90">
            {log.length === 0 ? "Waiting for first event…" : log.join("\n")}
          </pre>
        </section>

        <footer className="mt-8 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
          <p>
            <strong className="text-foreground">Setup:</strong> on your VPS run{" "}
            <code className="rounded bg-background px-1 py-0.5">cd vps &amp;&amp; bash deploy.sh</code> once. Expose a tiny webhook (e.g. a one-line FastAPI route or a GitHub Actions trigger) that re-runs the script, then set the secret{" "}
            <code className="rounded bg-background px-1 py-0.5">XTTS_DEPLOY_WEBHOOK_URL</code> (and optional{" "}
            <code className="rounded bg-background px-1 py-0.5">XTTS_DEPLOY_WEBHOOK_TOKEN</code>).
          </p>
          <a
            href="/voice-clone"
            className="mt-2 inline-flex items-center gap-1 text-foreground underline-offset-4 hover:underline"
          >
            Go to Voice Studio <ExternalLink className="h-3 w-3" />
          </a>
        </footer>
      </div>
    </div>
  );
};

const CheckRow = ({
  label,
  ok,
  detail,
  mono,
}: {
  label: string;
  ok: boolean;
  detail: string;
  mono?: boolean;
}) => (
  <div className="flex items-start gap-3 rounded-lg border border-border bg-background/40 p-3">
    <StatusDot ok={ok} />
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium">{label}</p>
      <p className={`mt-0.5 truncate text-xs text-muted-foreground ${mono ? "font-mono" : ""}`}>{detail}</p>
    </div>
  </div>
);

const ActionCard = ({
  title,
  description,
  button,
}: {
  title: string;
  description: string;
  button: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
    <h3 className="text-base font-semibold">{title}</h3>
    <p className="mb-4 mt-1 text-sm text-muted-foreground">{description}</p>
    {button}
  </div>
);

export default VoiceCloneDeploy;