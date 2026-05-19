import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { LUXE_VEIL_GATE_EVENT, type LuxeVeilGateDetail } from "@/lib/luxeVeilGate";
import { track } from "@/lib/analytics";
import {
  clearLuxeVeilSession,
  ensureLuxeVeilSession,
  hasFreshLuxeVeilSession,
  persistLuxeVeilToken,
} from "@/lib/luxeVeilSession";
import { openAccessRequest } from "@/lib/accessRequest";
import { getAppMode } from "@/lib/appMode";

const TARGET_PATH = "/luxe-veil";

/**
 * Globally-mounted Luxe Veil gate. Cached-fresh sessions navigate
 * straight to the private experience; otherwise the visitor can either
 * enter an existing invite code or request access (which routes through
 * the global access-request approval flow).
 */
const LuxeVeilGate = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const handler = async (e: Event) => {
      const detail = (e as CustomEvent<LuxeVeilGateDetail>).detail ?? {};
      track("luxe_veil_gate_open", { source: detail.source ?? "unknown" });

      if (hasFreshLuxeVeilSession()) {
        track("luxe_veil_gate_skip", { reason: "cached" });
        navigate(TARGET_PATH);
        return;
      }
      if (await ensureLuxeVeilSession()) {
        track("luxe_veil_gate_skip", { reason: "revalidated" });
        navigate(TARGET_PATH);
        return;
      }
      clearLuxeVeilSession();

      setError("");
      setCode("");
      setOpen(true);
    };

    window.addEventListener(LUXE_VEIL_GATE_EVENT, handler);
    return () => window.removeEventListener(LUXE_VEIL_GATE_EVENT, handler);
  }, [navigate]);

  const requestAccess = () => {
    setOpen(false);
    openAccessRequest({
      source: "luxe-veil",
      title: "Request Luxe Veil access",
      description:
        "Luxe Veil is invite-only. Share a few details and we'll review your request and contact you shortly.",
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifying) return;
    setVerifying(true);
    setError("");
    try {
      const { data, error: fnErr } = await supabase.functions.invoke<{
        ok: boolean;
        token?: string;
        error?: string;
      }>("verify-invite", { body: { code: code.trim() } });
      if (fnErr || !data?.ok || !data.token) {
        setError("Invalid Invite Code. Please contact support for access.");
      } else {
        persistLuxeVeilToken(data.token);
        track("luxe_veil_gate_verified", {});
        setOpen(false);
        setCode("");
        navigate(TARGET_PATH);
      }
    } catch {
      setError("Could not verify invitation. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-border bg-background text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-primary">
            <Lock className="h-4 w-4 text-gold" />
            Luxe Veil — Invitation Required
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Luxe Veil is invite-only. Enter your code, or request access if you don't have one yet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter invitation code"
            autoFocus
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm tracking-wider text-foreground placeholder:text-foreground/40 focus:border-gold focus:outline-none"
            aria-label="Invitation code"
          />
          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={verifying || !code.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-gold-foreground shadow-gold transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {verifying ? "Verifying…" : "Unlock Luxe Veil"}
          </button>
          <div className="flex items-center gap-3 py-1 text-[11px] uppercase tracking-[0.3em] text-foreground/40">
            <span className="h-px flex-1 bg-border" />
            <span>or</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <button
            type="button"
            onClick={requestAccess}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:border-gold hover:text-gold"
          >
            Request access (admin approval)
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LuxeVeilGate;