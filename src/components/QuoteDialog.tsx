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
import { track } from "@/lib/analytics";

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
  context?: {
    source?: string;
    module?: string;
    category?: string;
    /**
     * When launched from a showcase card / detail page, pre-fills the
     * "related project" chip and includes the reference in the intake email
     * + analytics so the intake team knows which case study prompted the call.
     */
    project?: {
      id: string;
      title: string;
      href?: string;
    };
  } | null;
};

export const QuoteDialog = ({ open, onOpenChange, context }: Props) => {
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
    if (submitting) return;
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
        context?.project
          ? `Strategy Call — ${parsed.data.objective} · ${context.project.title}`
          : `New Quote Request — ${parsed.data.objective}`,
      );
      const body = encodeURIComponent(
        `Name: ${parsed.data.name}\n` +
          `Email: ${parsed.data.email}\n` +
          `Company: ${parsed.data.companyUrl}\n` +
          `Objective: ${parsed.data.objective}\n` +
          (context?.project
            ? `Related project: ${context.project.title}${context.project.href ? ` (${context.project.href})` : ""}\n`
            : ""),
      );
      // Open mail client as the lightweight handoff for now.
      window.location.href = `mailto:zhemongrowth@gmail.com?subject=${subject}&body=${body}`;

      // Generic submit + module-scoped submit when launched from a service module
      track("quote_submit", {
        objective: parsed.data.objective,
        source: context?.source ?? "default",
        module: context?.module ?? null,
        category: context?.category ?? null,
        project: context?.project?.id ?? null,
      });
      if (context?.source === "services_grid" && context.module) {
        track("service_module_submit", {
          module: context.module,
          category: context.category ?? null,
          objective: parsed.data.objective,
        });
      }

      toast({
        title: "Operations initiated",
        description: "We'll be in touch within one business day.",
      });
      setSubmitted({ ...form, ...parsed.data });
    } catch (err) {
      console.error("QuoteDialog submit failed", err);
      toast({
        title: "Couldn't open your mail client",
        description:
          "Please email zhemongrowth@gmail.com directly with your request.",
        variant: "destructive",
      });
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="glass border-gold/30 shadow-gold sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

        {!submitted ? (
          <>
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
              {context?.project && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-gold/30 bg-gold/[0.06] px-3 py-2">
                  <Rocket className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
                  <div className="min-w-0 text-left">
                    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gold/90">
                      Related project
                    </p>
                    <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                      {context.project.title}
                    </p>
                  </div>
                </div>
              )}
            </DialogHeader>

            <form onSubmit={handleSubmit} aria-busy={submitting} className="space-y-4" noValidate>
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
                By submitting, you agree to be contacted by TrendFlux Ecosystem about your request.
              </p>
            </form>
          </>
        ) : (
          <div className="space-y-6 animate-in fade-in-50 zoom-in-95 duration-300">
            <DialogHeader className="space-y-3 text-left">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 ring-1 ring-gold/40">
                  <CheckCircle2 className="h-5 w-5 text-gold" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                  Operations initiated
                </p>
              </div>
              <DialogTitle className="font-display text-2xl leading-snug md:text-3xl">
                Welcome aboard, {submitted.name.split(" ")[0]}
              </DialogTitle>
              <DialogDescription className="text-foreground/60">
                Your Growth Strategy request has been logged. Here's a snapshot
                of what you sent — and what happens next.
              </DialogDescription>
            </DialogHeader>

            {/* Collected details */}
            <div className="rounded-lg border border-gold/20 bg-background/40 p-4 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold/80">
                Your brief
              </p>
              <dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
                <dt className="col-span-1 text-foreground/50">Name</dt>
                <dd className="col-span-2 text-foreground">{submitted.name}</dd>

                <dt className="col-span-1 text-foreground/50">Email</dt>
                <dd className="col-span-2 text-foreground break-all">{submitted.email}</dd>

                <dt className="col-span-1 text-foreground/50">Company</dt>
                <dd className="col-span-2 text-foreground break-all">{submitted.companyUrl}</dd>

                <dt className="col-span-1 text-foreground/50">Objective</dt>
                <dd className="col-span-2">
                  <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
                    {submitted.objective}
                  </span>
                </dd>
              </dl>
            </div>

            {/* Next-step timeline */}
            <div className="space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold/80">
                Next steps
              </p>
              <ol className="relative space-y-5 border-l border-gold/20 pl-5">
                {timeline.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <li key={i} className="relative">
                      <span
                        className={`absolute -left-[30px] flex h-6 w-6 items-center justify-center rounded-full ring-1 ${
                          step.done
                            ? "bg-gold/20 ring-gold/50 text-gold"
                            : "bg-background/60 ring-border text-foreground/60"
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                      </span>
                      <div className="flex items-baseline justify-between gap-3">
                        <h4 className="text-sm font-semibold text-foreground">
                          {step.title}
                        </h4>
                        <span className="text-[10px] uppercase tracking-wider text-foreground/40">
                          {step.time}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-foreground/55">
                        {step.desc}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSubmitted(null);
                  setForm(initialState);
                }}
              >
                <Send className="h-4 w-4" /> Send another
              </Button>
              <Button
                type="button"
                variant="gold"
                onClick={() => handleOpenChange(false)}
              >
                Close <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
