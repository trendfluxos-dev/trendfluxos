import { useState } from "react";
import { Loader2, CalendarCheck } from "lucide-react";
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

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

/**
 * "Book Direct with Project Lead" flow. Captures a short brief, stores it
 * through the existing `growth-os-lead` edge function (source tagged so it
 * routes to the founder inbox) and offers WhatsApp as an instant fallback.
 */
const ProjectLeadBookingDialog = ({ open, onOpenChange }: Props) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [goal, setGoal] = useState("");

  const reset = () => {
    setName("");
    setEmail("");
    setCompany("");
    setPreferredTime("");
    setGoal("");
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

    setSubmitting(true);
    const message = [
      preferredTime && `Preferred time: ${preferredTime}`,
      goal && `Goal: ${goal}`,
    ]
      .filter(Boolean)
      .join("\n");

    const { error } = await supabase.functions.invoke("growth-os-lead", {
      body: {
        name: trimmedName,
        email: trimmedEmail,
        company: company.trim() || undefined,
        message: message || "Book Direct with Project Lead",
        source: "project-lead-booking",
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
      description: "The Project Lead will follow up within one business day.",
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
            <Label htmlFor="pl-company">Company (optional)</Label>
            <Input
              id="pl-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              autoComplete="organization"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pl-time">Preferred time</Label>
            <Input
              id="pl-time"
              placeholder="e.g. Weekdays 4–7 PM BDT"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
            />
          </div>
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