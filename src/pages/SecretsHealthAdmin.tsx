import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, CheckCircle2, XCircle, Loader2, Send, RefreshCw } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";

const REQUIRED_KEYS = [
  { key: "TELEGRAM_BOT_TOKEN", label: "Telegram production token" },
  { key: "TELEGRAM_CHAT_ID", label: "Telegram production chat ID" },
  { key: "TELEGRAM_BOT_TOKEN_STAGING", label: "Telegram staging token" },
  { key: "TELEGRAM_CHAT_ID_STAGING", label: "Telegram staging chat ID" },
  { key: "LUXE_VEIL_INVITE_CODES", label: "Production invite codes" },
  { key: "LUXE_VEIL_INVITE_CODES_STAGING", label: "Staging invite codes" },
] as const;

type Mode = "production" | "staging";

type InviteTestRow = {
  code: string;
  mode: Mode;
  valid: boolean;
  message: string;
  at: string;
};

const PRESET_PRODUCTION = ["LUXE2026", "VIP2026", "EARLYACCESS"];
const PRESET_STAGING = ["TESTCODE", "STAGEVIP"];

export default function SecretsHealthAdmin() {
  const navigate = useNavigate();
  useSeo({
    title: "Secrets Health — Admin",
    description: "Admin-only diagnostics for Telegram and invite-code secrets.",
    noindex: true,
  });

  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean> | null>(null);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [healthOk, setHealthOk] = useState<boolean | null>(null);

  const [tgSending, setTgSending] = useState<Mode | null>(null);
  const [tgResult, setTgResult] = useState<string | null>(null);

  const [customCode, setCustomCode] = useState("");
  const [customMode, setCustomMode] = useState<Mode>("production");
  const [testing, setTesting] = useState(false);
  const [testRows, setTestRows] = useState<InviteTestRow[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        navigate("/auth");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", session.user.id);
      const ok = roles?.some((r) => r.role === "admin") ?? false;
      setIsAdmin(ok);
      setAuthChecked(true);
      if (ok) void runHealthCheck();
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) navigate("/auth");
    });
    return () => sub.subscription.unsubscribe();
     
  }, [navigate]);

  const runHealthCheck = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke<{
        ok: boolean; checks: Record<string, boolean>; missing: string[];
      }>("secrets-health", { body: {} });
      if (error || !data) throw error ?? new Error("No response");
      setChecks(data.checks);
      setHealthOk(data.ok);
      setLastChecked(new Date().toISOString());
    } catch (e) {
      toast.error("Health check failed: " + (e instanceof Error ? e.message : "unknown"));
      setHealthOk(false);
    } finally {
      setChecking(false);
    }
  };

  const sendTelegramTest = async (mode: Mode) => {
    setTgSending(mode);
    setTgResult(null);
    try {
      const { data, error } = await supabase.functions.invoke<{
        ok: boolean; mode: string; description?: string; message_id?: number; error?: string;
      }>("telegram-test", { body: { mode } });
      if (error) throw error;
      if (data?.ok) {
        toast.success(`Telegram ${mode} test sent (msg ${data.message_id ?? "?"})`);
        setTgResult(`OK — ${mode} message_id=${data.message_id ?? "?"}`);
      } else {
        const msg = data?.description ?? data?.error ?? "Unknown error";
        toast.error(`Telegram ${mode} test failed: ${msg}`);
        setTgResult(`FAIL — ${mode}: ${msg}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      toast.error("Telegram test error: " + msg);
      setTgResult("FAIL — " + msg);
    } finally {
      setTgSending(null);
    }
  };

  const testInvite = async (code: string, mode: Mode) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke<{
        ok: boolean; token?: string; error?: string; mode?: string;
      }>("verify-invite", { body: { code: trimmed, mode } });
      const valid = !!data?.ok;
      const message = data?.ok
        ? "Valid — token issued"
        : (data?.error ?? error?.message ?? "Invalid");
      setTestRows((rows) => [
        { code: trimmed, mode, valid, message, at: new Date().toISOString() },
        ...rows,
      ].slice(0, 30));
    } catch (e) {
      setTestRows((rows) => [
        {
          code: trimmed, mode, valid: false,
          message: e instanceof Error ? e.message : "unknown",
          at: new Date().toISOString(),
        }, ...rows,
      ].slice(0, 30));
    } finally {
      setTesting(false);
    }
  };

  const runPreset = async () => {
    for (const c of PRESET_PRODUCTION) await testInvite(c, "production");
    for (const c of PRESET_STAGING) await testInvite(c, "staging");
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md text-center text-foreground">
          <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-destructive" />
          <h1 className="text-xl font-semibold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need the admin role to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <ShieldCheck className="h-6 w-6 text-primary" /> Secrets Health
          </h1>
          <p className="text-sm text-muted-foreground">
            Admin-only diagnostics. Secret values are never returned to the browser —
            only set/missing booleans.
          </p>
        </header>

        {/* Health */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Edge function environment</h2>
              <p className="text-xs text-muted-foreground">
                {lastChecked ? `Last checked ${new Date(lastChecked).toLocaleString()}` : "Not yet checked"}
                {healthOk !== null && (
                  <span className={"ml-2 font-medium " + (healthOk ? "text-green-500" : "text-destructive")}>
                    {healthOk ? "All set" : "Issues detected"}
                  </span>
                )}
              </p>
            </div>
            <Button onClick={runHealthCheck} disabled={checking} variant="secondary">
              {checking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Re-check
            </Button>
          </div>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {REQUIRED_KEYS.map(({ key, label }) => {
              const present = checks?.[key];
              return (
                <li key={key} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">{label}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{key}</div>
                  </div>
                  {present === undefined ? (
                    <span className="text-xs text-muted-foreground">—</span>
                  ) : present ? (
                    <span className="inline-flex items-center gap-1 text-sm text-green-500">
                      <CheckCircle2 className="h-4 w-4" /> Set
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-destructive">
                      <XCircle className="h-4 w-4" /> Missing
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Telegram test */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-lg font-semibold">Telegram test</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Sends a safe test message to the configured chat. No secrets are exposed.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => sendTelegramTest("production")}
              disabled={tgSending !== null}
            >
              {tgSending === "production"
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <Send className="mr-2 h-4 w-4" />}
              Send Telegram Test (production)
            </Button>
            <Button
              variant="secondary"
              onClick={() => sendTelegramTest("staging")}
              disabled={tgSending !== null}
            >
              {tgSending === "staging"
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <Send className="mr-2 h-4 w-4" />}
              Send Telegram Test (staging)
            </Button>
          </div>
          {tgResult && (
            <p className="mt-3 text-xs text-muted-foreground">{tgResult}</p>
          )}
        </section>

        {/* Invite code tester */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-1 text-lg font-semibold">Invite code tester</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Calls the real <code className="rounded bg-muted px-1">verify-invite</code> edge
            function — same logic as the live invite gate.
          </p>

          <div className="mb-4 flex flex-wrap gap-2">
            <Button onClick={runPreset} disabled={testing} variant="secondary">
              {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Run preset (prod + staging)
            </Button>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px_auto]">
            <div>
              <Label htmlFor="code" className="text-xs">Custom code</Label>
              <Input
                id="code" value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="Enter an invite code"
              />
            </div>
            <div>
              <Label className="text-xs">Mode</Label>
              <select
                value={customMode}
                onChange={(e) => setCustomMode(e.target.value as Mode)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="production">production</option>
                <option value="staging">staging</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => testInvite(customCode, customMode)}
                disabled={testing || !customCode.trim()}
              >
                Test
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Code</th>
                  <th className="px-3 py-2 text-left">Mode</th>
                  <th className="px-3 py-2 text-left">Result</th>
                  <th className="px-3 py-2 text-left">Message</th>
                  <th className="px-3 py-2 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {testRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                      No tests yet.
                    </td>
                  </tr>
                ) : testRows.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-2 font-mono">{r.code}</td>
                    <td className="px-3 py-2">{r.mode}</td>
                    <td className="px-3 py-2">
                      {r.valid ? (
                        <span className="inline-flex items-center gap-1 text-green-500">
                          <CheckCircle2 className="h-4 w-4" /> valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-destructive">
                          <XCircle className="h-4 w-4" /> invalid
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{r.message}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {new Date(r.at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}