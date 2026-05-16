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

const STORAGE_KEY = "luxe_veil_token";
const TARGET_PATH = "/luxe-veil";

const verifyTokenRemote = async (token: string): Promise<boolean> => {
  try {
    const { data } = await supabase.functions.invoke<{ ok: boolean }>(
      "verify-invite?action=verify-token",
      { body: { token } },
    );
    return !!data?.ok;
  } catch {
    return false;
  }
};

/**
 * Globally-mounted invite-code gate. Listens for `luxe-veil:open` events
 * (dispatched via openLuxeVeilGate()), prompts for an invite code, and
 * navigates to /luxe-veil on success. If a valid token already exists in
 * localStorage, navigates immediately without prompting.
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

      // Fast path: existing valid token → navigate directly.
      const existing =
        typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (existing) {
        const ok = await verifyTokenRemote(existing);
        if (ok) {
          navigate(TARGET_PATH);
          return;
        }
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      }

      setError("");
      setCode("");
      setOpen(true);
    };

    window.addEventListener(LUXE_VEIL_GATE_EVENT, handler);
    return () => window.removeEventListener(LUXE_VEIL_GATE_EVENT, handler);
  }, [navigate]);

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
        setError(data?.error || "Invalid invitation code. Please check with your host.");
      } else {
        try { localStorage.setItem(STORAGE_KEY, data.token); } catch { /* ignore */ }
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
            Luxe Veil is invite-only. Enter your code to access the private experience.
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
          <p className="text-center text-[11px] uppercase tracking-[0.3em] text-foreground/40">
            By referral only
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LuxeVeilGate;
