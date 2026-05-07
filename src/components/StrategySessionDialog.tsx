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
};

export const StrategySessionDialog = ({ open, onOpenChange }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggle = (s: string) =>
    setInterests((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const reset = () => {
    setName("");
    setEmail("");
    setInterests([]);
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
      // Lightweight client-side analytics ping; replace with backend later.
      const dataLayer = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
      dataLayer?.push?.({ event: "strategy_session_request", ...parsed.data });
      await new Promise((r) => setTimeout(r, 600));
      toast.success("Request received", {
        description: "We'll reach out within 1 business day to schedule your session.",
      });
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
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
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
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
      </DialogContent>
    </Dialog>
  );
};

export default StrategySessionDialog;
