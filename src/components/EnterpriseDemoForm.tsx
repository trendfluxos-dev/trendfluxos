import { useState } from "react";
import { z } from "zod";
import { ArrowRight, CheckCircle2, Loader2, Circle, Mail, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";
import { ENTERPRISE } from "@/config/enterprise";

const TEAM_SIZES = ["1-10", "11-50", "51-200", "200+"] as const;

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid work email").max(255),
  company: z.string().trim().min(2, "Company is required").max(150),
  role: z.string().trim().min(2, "Role is required").max(80),
  team_size: z.enum(TEAM_SIZES, { errorMap: () => ({ message: "Pick a team size" }) }),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

type FormState = {
  name: string;
  email: string;
  company: string;
  role: string;
  team_size: string;
  message: string;
};

const EMPTY: FormState = {
  name: "",
  email: "",
  company: "",
  role: "",
  team_size: "",
  message: "",
};

const EnterpriseDemoForm = () => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ email: string; company: string } | null>(null);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      track("enterprise_demo_submit_error", { reason: "validation" });
      return;
    }

    track("enterprise_demo_submit_attempt", {
      team_size: parsed.data.team_size,
      role: parsed.data.role,
    });

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke<{
        ok: boolean;
        id?: string;
        error?: string;
      }>("enterprise-demo-notify", { body: parsed.data });

      if (error || !data?.ok) {
        const reason = data?.error ?? error?.message ?? "unknown";
        track("enterprise_demo_submit_error", { reason });
        toast.error("Couldn't submit your request. Please try again.");
        return;
      }

      track("enterprise_demo_submit_success", {
        lead_id: data.id,
        team_size: parsed.data.team_size,
        role: parsed.data.role,
      });
      setSuccess({ email: parsed.data.email, company: parsed.data.company });
    } catch (err) {
      const reason = err instanceof Error ? err.message : "exception";
      track("enterprise_demo_submit_error", { reason });
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    const steps = [
      {
        key: "received",
        title: "Request received",
        body: "Your details are securely logged in our system.",
        icon: CheckCircle2,
        state: "done" as const,
      },
      {
        key: "review",
        title: "Review by our team",
        body: "We'll match your context to the right TrendFlux operator (typically within 2–4 business hours).",
        icon: Mail,
        state: "current" as const,
      },
      {
        key: "scheduled",
        title: "Demo scheduled",
        body: "You'll receive a calendar invite at the email below.",
        icon: CalendarCheck,
        state: "upcoming" as const,
      },
    ];

    return (
      <div className="glass-strong rounded-3xl p-8 md:p-10 max-w-2xl mx-auto text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="mt-5 font-display text-2xl md:text-3xl font-bold">
          Demo request received.
        </h3>
        <p className="mt-3 text-foreground/65 leading-relaxed">
          Track your request below — we'll move it through each step and update you by email.
        </p>

        {/* Status tracker */}
        <ol className="mt-8 text-left space-y-4">
          {steps.map((s, idx) => {
            const Icon = s.state === "upcoming" ? Circle : s.icon;
            const tone =
              s.state === "done"
                ? "bg-primary/15 text-primary border-primary/40"
                : s.state === "current"
                  ? "bg-gold/15 text-gold border-gold/40 animate-pulse"
                  : "bg-background/50 text-foreground/40 border-border/60";
            return (
              <li key={s.key} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full border flex items-center justify-center ${tone}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-px flex-1 min-h-6 bg-border/60 mt-1" />
                  )}
                </div>
                <div className="pb-2">
                  <p className="font-semibold text-sm">
                    {s.title}
                    {s.state === "current" && (
                      <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-gold">
                        In progress
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-foreground/60 mt-1 leading-relaxed">{s.body}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 rounded-xl border border-border/60 bg-background/50 p-4 text-left text-sm text-foreground/70">
          <p>
            <span className="text-foreground/40">Email:</span>{" "}
            <span className="text-foreground">{success.email}</span>
          </p>
          <p className="mt-1">
            <span className="text-foreground/40">Company:</span>{" "}
            <span className="text-foreground">{success.company}</span>
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="hero">
            <a
              href={ENTERPRISE.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track("enterprise_portal_open", { location: "demo_success" })
              }
            >
              Open Enterprise Portal <ArrowRight />
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="/">Back to TrendFlux</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="glass-strong rounded-3xl p-6 md:p-10 max-w-2xl mx-auto space-y-5"
      noValidate
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="demo-name">Name</Label>
          <Input
            id="demo-name"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="Jane Doe"
            maxLength={100}
            autoComplete="name"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="demo-email">Work email</Label>
          <Input
            id="demo-email"
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            placeholder="jane@company.com"
            maxLength={255}
            autoComplete="email"
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="demo-company">Company</Label>
          <Input
            id="demo-company"
            value={form.company}
            onChange={(e) => setField("company", e.target.value)}
            placeholder="Acme Holdings"
            maxLength={150}
            autoComplete="organization"
          />
          {errors.company && (
            <p className="text-xs text-destructive">{errors.company}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="demo-role">Role</Label>
          <Input
            id="demo-role"
            value={form.role}
            onChange={(e) => setField("role", e.target.value)}
            placeholder="CEO, COO, Ops Lead…"
            maxLength={80}
            autoComplete="organization-title"
          />
          {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="demo-team">Team size</Label>
        <Select
          value={form.team_size}
          onValueChange={(v) => setField("team_size", v)}
        >
          <SelectTrigger id="demo-team">
            <SelectValue placeholder="Pick a range" />
          </SelectTrigger>
          <SelectContent>
            {TEAM_SIZES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.team_size && (
          <p className="text-xs text-destructive">{errors.team_size}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="demo-message">What would you like to discuss? (optional)</Label>
        <Textarea
          id="demo-message"
          value={form.message}
          onChange={(e) => setField("message", e.target.value)}
          placeholder="Workflow we want to automate, compliance scope, timeline…"
          rows={4}
          maxLength={1000}
        />
        {errors.message && (
          <p className="text-xs text-destructive">{errors.message}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <p className="text-xs text-foreground/40">
          We'll only use this to schedule your demo.
        </p>
        <Button type="submit" variant="hero" size="lg" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Sending…
            </>
          ) : (
            <>
              Request demo <ArrowRight />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default EnterpriseDemoForm;
