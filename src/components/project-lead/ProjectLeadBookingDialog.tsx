import { useState } from "react";
import { Loader2, CalendarCheck, Video, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TimeslotPicker, { type Timeslot } from "@/components/booking/TimeslotPicker";

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

type SessionType = "video" | "audio";

/**
 * "Book Direct with Project Lead" flow. Captures a short brief, stores it
 * through `strategy-booking-submit`, which writes to `strategy_bookings`,
 * creates a HOLD Google Calendar event with a Meet link, and emails the
 * Brand Architect a one-click confirm URL. On confirm the client is added
 * as an attendee (invite auto-sent) and reminders fire 1 day + 15 min prior.
 */
const ProjectLeadBookingDialog = ({ open, onOpenChange }: Props) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [slot, setSlot] = useState<Timeslot | null>(null);
  const [goal, setGoal] = useState("");
  const [sessionType, setSessionType] = useState<SessionType>("video");

  const reset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setSlot(null);
    setGoal("");
    setSessionType("video");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedName.length < 2) {
      toast({ title: "Please add your name", variant: "destructive" });
      return;
    }
    if (!isEmail(trimmedEmail)) {
      toast({ title: "Enter a valid email", variant: "destructive" });
      return;
    }
    if (!slot) {
      toast({ title: "Pick a preferred date and time", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.functions.invoke("strategy-booking-submit", {
      body: {
        name: trimmedName,
        email: trimmedEmail,
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        goal: goal.trim() || undefined,
        session_type: sessionType,
        requested_slot_iso: slot.iso,
        duration_minutes: 30,
      },
    });
    setSubmitting(false);

    if (error) {
      toast({
        title: "Couldn't send request",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Request received",
      description:
        "Zahid will confirm your slot shortly. You'll receive a Google Meet invite by email as soon as it's locked in.",
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Book Direct with Project Lead
          </DialogTitle>
          <DialogDescription>
            30-minute strategy call with Zahid Hasan Emon. Share a few details
            and we'll confirm a time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} aria-busy={submitting} className="space-y-4">
          <div className="grid gap-2">
            <Label>Session type</Label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { v: "video", label: "Video call", Icon: Video },
                  { v: "audio", label: "Audio call", Icon: Phone },
                ] as const
              ).map(({ v, label, Icon }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSessionType(v)}
                  aria-pressed={sessionType === v}
                  className={
                    "flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition " +
                    (sessionType === v
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted")
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Both options run on Google Meet — audio-only just means we skip video.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pl-name">Your name</Label>
            <Input
              id="pl-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pl-email">Email</Label>
            <Input
              id="pl-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pl-phone">WhatsApp number (optional)</Label>
            <Input
              id="pl-phone"
              type="tel"
              inputMode="tel"
              placeholder="+8801XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pl-company">Company (optional)</Label>
            <Input
              id="pl-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              autoComplete="organization"
            />
          </div>
          <TimeslotPicker
            idPrefix="pl-slot"
            value={slot}
            onChange={setSlot}
            disabled={submitting}
            required
          />
          <div className="grid gap-2">
            <Label htmlFor="pl-goal">What do you want to solve?</Label>
            <Input
              id="pl-goal"
              placeholder="e.g. Scale D2C brand from ৳5L to ৳25L/mo"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              asChild
            >
              <a
                href="https://wa.me/message/5GSNUYK6CSDCN1"
                target="_blank"
                rel="noreferrer"
              >
                Or chat on WhatsApp
              </a>
            </Button>
            <Button type="submit" variant="hero" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
                </>
              ) : (
                "Request my slot"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectLeadBookingDialog;