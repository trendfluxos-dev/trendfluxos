import { useEffect, useState } from "react";
import { ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  ACCESS_REQUEST_EVENT,
  type AccessRequestDetail,
} from "@/lib/accessRequest";
import { track } from "@/lib/analytics";
import { z } from "zod";

const FormSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

/**
 * Global, site-wide access-request dialog. Listens for `access-request:open`
 * events (dispatched via `openAccessRequest({ source })`), collects basic
 * details, persists them and notifies the admin via Telegram. The visitor
 * always sees a "thanks, we'll contact you" confirmation — actual approval
 * happens out-of-band via the admin's Telegram Approve/Reject buttons.
 */
const AccessRequestGate = () => {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<AccessRequestDetail | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent<AccessRequestDetail>).detail;
      if (!d) return;
      track("access_request_open", { source: d.source });
      setDetail(d);
      setError("");
      setDone(false);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setOpen(true);
    };
    window.addEventListener(ACCESS_REQUEST_EVENT, handler);
    return () => window.removeEventListener(ACCESS_REQUEST_EVENT, handler);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !detail) return;
    const parsed = FormSchema.safeParse({ name, email, phone, message });
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      setError(first ?? "Please check your details.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { data, error: fnErr } = await supabase.functions.invoke<{
        ok: boolean; error?: string;
      }>("access-request", {
        body: {
          source: detail.source,
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone || undefined,
          message: parsed.data.message || undefined,
          metadata: detail.metadata ?? {},
        },
      });
      if (fnErr || !data?.ok) {
        setError(data?.error || "Could not submit. Please try again.");
      } else {
        track("access_request_submitted", { source: detail.source });
        setDone(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const title = detail?.title ?? "Request access";
  const description =
    detail?.description ??
    "Submit your details and our team will review your request and contact you shortly.";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-border bg-background text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-primary">
            <ShieldCheck className="h-4 w-4 text-gold" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            {description}
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="space-y-3 py-2 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-gold" />
            <p className="font-display text-lg text-primary">Thanks — request received</p>
            <p className="text-sm text-foreground/70">
              Our team has been notified. We'll contact you at <b>{email}</b> once your access is approved.
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-card/70"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
              maxLength={120}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold focus:outline-none"
              aria-label="Full name"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              maxLength={255}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold focus:outline-none"
              aria-label="Email"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone / WhatsApp (optional)"
              maxLength={40}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold focus:outline-none"
              aria-label="Phone"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Anything we should know? (optional)"
              rows={3}
              maxLength={2000}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold focus:outline-none"
              aria-label="Message"
            />
            {error && (
              <p className="text-xs text-destructive" role="alert">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-gold-foreground shadow-gold transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                </>
              ) : (
                "Request access"
              )}
            </button>
            <p className="text-center text-[11px] uppercase tracking-[0.3em] text-foreground/40">
              Admin approval required
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AccessRequestGate;