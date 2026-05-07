import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Copy, Loader2, Send } from "lucide-react";
import { track } from "@/lib/analytics";

const SERVICES = [
  "AI Automation",
  "Performance Media",
  "Ecosystem Design",
  "Brand Architecture",
  "Content Engine",
] as const;

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z
    .string()
    .trim()
    .email({ message: "Enter a valid email address" })
    .max(255),
  interests: z
    .array(z.enum(SERVICES))
    .min(1, { message: "Select at least one service interest" }),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional case study slug that originated this booking. Threaded through analytics. */
  sourceCaseSlug?: string | null;
  /** Where the dialog was opened from, e.g. "case_card", "narrative_modal", "footer_cta". */
  source?: string;
};

type Confirmation = {
  reference: string;
  name: string;
  email: string;
  interests: string[];
  bookedAt: Date;
  caseSlug: string | null;
};

/** Short, human-friendly reference id, e.g. TFX-7K3F-2A91 */
function generateReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1
  const pick = (n: number) =>
    Array.from(
      { length: n },
      () => alphabet[Math.floor(Math.random() * alphabet.length)]
    ).join("");
  return `TFX-${pick(4)}-${pick(4)}`;
}

export const StrategySessionDialog = ({
  open,
  onOpenChange,
  sourceCaseSlug = null,
  source,
}: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const toggle = (s: string) =>
    setInterests((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const reset = () => {
    setName("");
    setEmail("");
    setInterests([]);
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      // Reset confirmation when closing so a fresh open shows the form again.
      setConfirmation(null);
      reset();
    }
    onOpenChange(o);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email, interests });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setSubmitting(true);
    try {
      // Funnel: request submitted (pre-confirmation).
      track("strategy_session_request", {
        name: parsed.data.name,
        email: parsed.data.email,
        interests: parsed.data.interests.join(","),
        case_slug: sourceCaseSlug ?? undefined,
        source: source ?? undefined,
      });
      await new Promise((r) => setTimeout(r, 600));

      const reference = generateReference();
      const bookedAt = new Date();

      // Funnel: confirmed booking. Connected to originating case_slug for full-funnel reporting.
      track("strategy_session_booked", {
        reference,
        name: parsed.data.name,
        email: parsed.data.email,
        interests: parsed.data.interests.join(","),
        case_slug: sourceCaseSlug ?? undefined,
        source: source ?? undefined,
        booked_at: bookedAt.toISOString(),
      });

      setConfirmation({
        reference,
        name: parsed.data.name,
        email: parsed.data.email,
        interests: parsed.data.interests,
        bookedAt,
        caseSlug: sourceCaseSlug,
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyReference = async () => {
    if (!confirmation) return;
    try {
      await navigator.clipboard.writeText(confirmation.reference);
      toast.success("Reference ID copied");
    } catch {
      toast.error("Couldn't copy. Please copy manually.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {confirmation ? (
          <>
            <DialogHeader>
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 ring-1 ring-gold/40">
                <CheckCircle2 className="h-7 w-7 text-gold" aria-hidden />
              </div>
              <DialogTitle className="text-center font-display text-2xl">
                Booking confirmed
              </DialogTitle>
              <DialogDescription className="text-center">
                We've received your request and will reach out within 1 business day to
                lock in your session.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 rounded-2xl border border-gold/30 bg-gold/[0.04] p-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
                Reference ID
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <code className="rounded-lg bg-foreground/5 px-3 py-1.5 font-mono text-base font-semibold tracking-wider text-foreground">
                  {confirmation.reference}
                </code>
                <button
                  type="button"
                  onClick={copyReference}
                  aria-label="Copy reference ID"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-foreground/15 text-foreground/70 transition hover:border-gold/50 hover:text-gold"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-2 text-[11px] text-foreground/55">
                Quote this reference in any reply or follow-up email.
              </p>
            </div>

            <dl className="mt-2 grid gap-3 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
                  Name
                </dt>
                <dd className="mt-1 text-foreground">{confirmation.name}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
                  Email
                </dt>
                <dd className="mt-1 break-all text-foreground">{confirmation.email}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
                  Interests
                </dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {confirmation.interests.map((i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-full border border-gold/30 bg-gold/5 px-2.5 py-0.5 text-[11px] font-medium text-gold"
                    >
                      {i}
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
                  Booked
                </dt>
                <dd className="mt-1 text-foreground/80">
                  {confirmation.bookedAt.toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </dd>
              </div>
              {confirmation.caseSlug && (
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
                    Originating case
                  </dt>
                  <dd className="mt-1 font-mono text-xs text-foreground/80">
                    {confirmation.caseSlug}
                  </dd>
                </div>
              )}
            </dl>

            <DialogFooter className="gap-2 sm:gap-3">
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
              <Button type="button" variant="gold" onClick={() => handleOpenChange(false)} autoFocus>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Book a Growth Strategy Session</DialogTitle>
              <DialogDescription>
                One 30-minute call. Walk away with a clear roadmap built for your business.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="ss-name">Full name</Label>
                <Input
                  id="ss-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={100}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ss-email">Work email</Label>
                <Input
                  id="ss-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  maxLength={255}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Service interests</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {SERVICES.map((s) => {
                    const checked = interests.includes(s);
                    return (
                      <label
                        key={s}
                        className="flex items-center gap-2 rounded-lg border border-foreground/10 bg-foreground/[0.02] px-3 py-2 text-sm cursor-pointer hover:border-primary/40 transition"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggle(s)}
                          aria-label={s}
                        />
                        <span>{s}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-3">
                <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="gold" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Request Session
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StrategySessionDialog;
