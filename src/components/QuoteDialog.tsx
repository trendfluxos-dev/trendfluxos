import { useState } from "react";
import { z } from "zod";
import { ArrowRight, Loader2, CheckCircle2, Mail, CalendarClock, Rocket, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const objectives = [
  "Lead Generation",
  "Business Automation",
  "Meta Ads Scaling",
  "Ecosystem Design",
  "Conversion Optimization",
] as const;

const quoteSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(100, "Name must be under 100 characters"),
  email: z
    .string()
    .trim()
    .email("Enter a valid business email")
    .max(255, "Email must be under 255 characters"),
  companyUrl: z
    .string()
    .trim()
    .min(3, "Enter your company URL")
    .max(255, "URL must be under 255 characters")
    .regex(
      /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-./?%&=]*)?$/i,
      "Enter a valid website (e.g. yoursite.com)",
    ),
  objective: z.enum(objectives, {
    errorMap: () => ({ message: "Pick a growth objective" }),
  }),
});

type FormState = {
  name: string;
  email: string;
  companyUrl: string;
  objective: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  companyUrl: "",
  objective: "",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const QuoteDialog = ({ open, onOpenChange }: Props) => {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<FormState | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // Reset on close so reopening starts clean
      setTimeout(() => {
        setForm(initialState);
        setErrors({});
        setSubmitted(null);
      }, 200);
    }
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = quoteSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const subject = encodeURIComponent(
        `New Quote Request — ${parsed.data.objective}`,
      );
      const body = encodeURIComponent(
        `Name: ${parsed.data.name}\n` +
          `Email: ${parsed.data.email}\n` +
          `Company: ${parsed.data.companyUrl}\n` +
          `Objective: ${parsed.data.objective}\n`,
      );
      // Open mail client as the lightweight handoff for now.
      window.location.href = `mailto:zhemongrowth@gmail.com?subject=${subject}&body=${body}`;

      toast({
        title: "Operations initiated",
        description: "We'll be in touch within one business day.",
      });
      setSubmitted({ ...parsed.data });
    } finally {
      setSubmitting(false);
    }
  };

  const timeline = [
    {
      icon: CheckCircle2,
      title: "Request received",
      time: "Just now",
      desc: "Your brief is logged in our intake queue.",
      done: true,
    },
    {
      icon: Mail,
      title: "Strategy review",
      time: "Within 24 hours",
      desc: "Our team audits your site and objective fit.",
    },
    {
      icon: CalendarClock,
      title: "Discovery call",
      time: "Day 2–3",
      desc: "30-min call to align on KPIs, budget, and scope.",
    },
    {
      icon: Rocket,
      title: "Operation blueprint",
      time: "Day 5",
      desc: "Custom growth roadmap delivered to your inbox.",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-gold/30 shadow-gold sm:max-w-lg">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <DialogHeader className="space-y-2 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Request a Quote
          </p>
          <DialogTitle className="font-display text-2xl leading-snug md:text-3xl">
            Architect your growth operation
          </DialogTitle>
          <DialogDescription className="text-foreground/60">
            Tell us where you're headed. We reply within one business day.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="quote-name" className="text-xs uppercase tracking-wider text-foreground/60">
              Name
            </Label>
            <Input
              id="quote-name"
              autoComplete="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Your full name"
              maxLength={100}
              className="bg-background/40 border-border focus-visible:ring-gold/50"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quote-email" className="text-xs uppercase tracking-wider text-foreground/60">
              Business Email
            </Label>
            <Input
              id="quote-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@company.com"
              maxLength={255}
              className="bg-background/40 border-border focus-visible:ring-gold/50"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quote-url" className="text-xs uppercase tracking-wider text-foreground/60">
              Company URL
            </Label>
            <Input
              id="quote-url"
              autoComplete="url"
              value={form.companyUrl}
              onChange={(e) => update("companyUrl", e.target.value)}
              placeholder="yoursite.com"
              maxLength={255}
              className="bg-background/40 border-border focus-visible:ring-gold/50"
            />
            {errors.companyUrl && (
              <p className="text-xs text-destructive">{errors.companyUrl}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-foreground/60">
              Growth Objective
            </Label>
            <Select
              value={form.objective}
              onValueChange={(v) => update("objective", v)}
            >
              <SelectTrigger className="bg-background/40 border-border focus:ring-gold/50">
                <SelectValue placeholder="Choose a primary objective" />
              </SelectTrigger>
              <SelectContent>
                {objectives.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.objective && (
              <p className="text-xs text-destructive">{errors.objective}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            disabled={submitting}
            className="mt-2 w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Initiating…
              </>
            ) : (
              <>
                Initiate Operations <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-[11px] text-foreground/40">
            By submitting, you agree to be contacted by TrendFlux Digital about your request.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
