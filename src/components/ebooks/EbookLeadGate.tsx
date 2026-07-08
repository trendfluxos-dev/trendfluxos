import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2, Mail, CheckCircle2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "trendflux.ebooks.lead.v1";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name")
    .max(120, "Name is too long"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(255, "Email is too long"),
});

type Props = {
  onUnlock?: () => void;
};

const EbookLeadGate = ({ onUnlock }: Props) => {
  const [unlocked, setUnlocked] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) {
        setUnlocked(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email });
    if (!parsed.success) {
      const field = parsed.error.flatten().fieldErrors;
      setErrors({ name: field.name?.[0], email: field.email?.[0] });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const { error } = await supabase.from("growth_leads").insert({
        name: parsed.data.name,
        email: parsed.data.email,
        source: "trendflux-contact",
        services: [],
        message: "Ebook download opt-in — Operator Playbooks",
      });
      if (error) throw error;
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ email: parsed.data.email, at: Date.now() }),
        );
      } catch {
        // ignore storage errors (private mode etc.)
      }
      setUnlocked(true);
      onUnlock?.();
      toast({
        title: "You're on the list",
        description: "Downloads unlocked below — enjoy the playbooks.",
      });
    } catch (err) {
      console.error("[EbookLeadGate] insert failed", err);
      toast({
        title: "Something went wrong",
        description:
          "We couldn't save your email. Please try again — or use the downloads directly if the issue persists.",
        variant: "destructive",
      });
      // Fail-open so downloads still work if the API is unavailable.
      setUnlocked(true);
      onUnlock?.();
    } finally {
      setSubmitting(false);
    }
  };

  if (unlocked) {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>
          Downloads unlocked. New drops go to your inbox first — no spam,
          unsubscribe anytime.
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-5 md:p-6"
      aria-labelledby="ebook-lead-heading"
      noValidate
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3
            id="ebook-lead-heading"
            className="text-base font-semibold tracking-tight md:text-lg"
          >
            Get the playbooks — plus new drops as they ship
          </h3>
          <p className="mt-1 text-xs text-muted-foreground md:text-sm">
            Drop your name and email to unlock the downloads. You'll also get
            an occasional field-note from ZAHID HASAN EMON. No spam,
            unsubscribe anytime.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr,1.4fr,auto]">
        <div>
          <Label htmlFor="ebook-lead-name" className="sr-only">
            Name
          </Label>
          <Input
            id="ebook-lead-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "ebook-lead-name-err" : undefined}
            maxLength={120}
            disabled={submitting}
          />
          {errors.name && (
            <p
              id="ebook-lead-name-err"
              className="mt-1 text-xs text-destructive"
            >
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="ebook-lead-email" className="sr-only">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="ebook-lead-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              placeholder="you@work.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? "ebook-lead-email-err" : undefined
              }
              maxLength={255}
              disabled={submitting}
              className="pl-9"
            />
          </div>
          {errors.email && (
            <p
              id="ebook-lead-email-err"
              className="mt-1 text-xs text-destructive"
            >
              {errors.email}
            </p>
          )}
        </div>
        <Button type="submit" disabled={submitting} className="md:w-auto">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            "Unlock downloads"
          )}
        </Button>
      </div>
    </form>
  );
};

export default EbookLeadGate;