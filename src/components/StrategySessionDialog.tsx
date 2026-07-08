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
import { Loader2, Send } from "lucide-react";
import { track } from "@/lib/analytics";
import TimeslotPicker, { type Timeslot } from "@/components/booking/TimeslotPicker";
import StrategySessionConfirmation, {
  type StrategySessionConfirmationData,
} from "@/components/booking/StrategySessionConfirmation";

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

type Confirmation = StrategySessionConfirmationData;

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
  const [slot, setSlot] = useState<Timeslot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const toggle = (s: string) =>
    setInterests((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const reset = () => {
    setName("");
    setEmail("");
    setInterests([]);
    setSlot(null);
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
    if (submitting) return;
    const parsed = schema.safeParse({ name, email, interests });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    if (!slot) {
      toast.error("Pick a preferred date and time slot");
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
        slot_iso: slot.iso,
        slot_label: slot.label,
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
        slot_iso: slot.iso,
        slot_label: slot.label,
      });

      setConfirmation({
        reference,
        name: parsed.data.name,
        email: parsed.data.email,
        interests: parsed.data.interests,
        bookedAt,
        caseSlug: sourceCaseSlug,
        slot,
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
          <StrategySessionConfirmation
            confirmation={confirmation}
            onCopyReference={copyReference}
            onClose={() => handleOpenChange(false)}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Book a Growth Strategy Session</DialogTitle>
              <DialogDescription>
                One 30-minute call. Walk away with a clear roadmap built for your business.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} aria-busy={submitting} className="space-y-4">
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
              <TimeslotPicker
                idPrefix="ss-slot"
                value={slot}
                onChange={setSlot}
                disabled={submitting}
                required
              />

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
