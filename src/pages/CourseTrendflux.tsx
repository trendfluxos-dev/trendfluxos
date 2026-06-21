import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useSeo } from "@/hooks/useSeo";
import { Lock, CheckCircle2, Hourglass, ExternalLink, Copy } from "lucide-react";
import {
  BKASH_RECEIVE_NUMBER,
  BKASH_RECEIVE_TYPE,
  MODULE_PRICE_BDT,
} from "@/config/coursePayment";

type Module = {
  id: string;
  module_index: number;
  title: string;
  description: string;
  price_bdt: number;
  content_url: string | null;
};

type Enrollment = {
  id: string;
  module_index: number;
  status: "pending" | "paid" | "failed" | "cancelled";
  bkash_trx_id: string | null;
};

type EnrollmentEvent = {
  id: string;
  module_index: number;
  event_type: "submitted" | "approved" | "rejected" | "unlocked";
  message: string | null;
  actor: string | null;
  created_at: string;
};

export default function CourseTrendflux() {
  const navigate = useNavigate();
  useSeo({
    title: "TrendFlux Course — ৭ Module Masterclass",
    description: "AI + automation মাস্টারক্লাস। ৭টি module, প্রতিটি ৳2,000, sequential unlock।",
    noindex: true,
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [events, setEvents] = useState<EnrollmentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModule, setOpenModule] = useState<Module | null>(null);

  useEffect(() => {
    let active = true;

    const init = async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate("/auth?redirect=/course/trendflux", { replace: true });
        return;
      }
      if (!active) return;
      setUserId(sess.session.user.id);
      await refresh(sess.session.user.id);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth?redirect=/course/trendflux", { replace: true });
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = async (uid: string) => {
    setLoading(true);
    const [mods, enrs, evts] = await Promise.all([
      supabase.from("course_modules").select("*").order("module_index"),
      supabase.from("module_enrollments").select("id, module_index, status, bkash_trx_id").eq("user_id", uid),
      supabase.from("enrollment_events")
        .select("id, module_index, event_type, message, actor, created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(40),
    ]);
    if (mods.data) setModules(mods.data as Module[]);
    if (enrs.data) setEnrollments(enrs.data as Enrollment[]);
    if (evts.data) setEvents(evts.data as EnrollmentEvent[]);
    setLoading(false);
  };

  // Realtime subscription so user dashboard updates instantly on admin approve
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`course-events-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "module_enrollments", filter: `user_id=eq.${userId}` },
        () => refresh(userId),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "enrollment_events", filter: `user_id=eq.${userId}` },
        () => refresh(userId),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const statusFor = (idx: number): Enrollment["status"] | null => {
    const list = enrollments.filter((e) => e.module_index === idx);
    if (list.find((e) => e.status === "paid")) return "paid";
    if (list.find((e) => e.status === "pending")) return "pending";
    if (list.find((e) => e.status === "failed")) return "failed";
    return null;
  };

  const paidIndexes = useMemo(
    () => new Set(enrollments.filter((e) => e.status === "paid").map((e) => e.module_index)),
    [enrollments],
  );

  const canAccess = (idx: number) => idx === 1 || paidIndexes.has(idx - 1);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center bg-background text-foreground/70">
        Loading…
      </div>
    );
  }

  return (
    <div lang="bn" className="min-h-dvh bg-background text-foreground">
      {/* Ambient brand glow */}
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute -top-24 right-0 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[160px]" />
        <div className="absolute bottom-0 -left-24 h-[420px] w-[420px] rounded-full bg-gold/10 blur-[160px]" />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl relative">
        <header className="flex items-start justify-between gap-4 mb-10 animate-fade-up">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-2 font-semibold">
              TrendFlux Masterclass · Dashboard
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Your Learning <span className="text-gradient">Operating System</span>
            </h1>
            <p className="text-foreground/60 mt-3 text-sm">
              ৭টি module · প্রতিটি ৳{MODULE_PRICE_BDT.toLocaleString("en-BD")} · sequential unlock
            </p>

            <div className="mt-5 max-w-sm">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-foreground/50 mb-1.5">
                <span>Progress</span>
                <span className="text-foreground/70 font-semibold">
                  {paidIndexes.size} / {modules.length || 7}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] transition-all duration-700 ease-out"
                  style={{
                    width: `${
                      modules.length ? (paidIndexes.size / modules.length) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>Sign out</Button>
        </header>

        <div className="space-y-3">
          {modules.map((m, idx) => {
            const s = statusFor(m.module_index);
            const access = canAccess(m.module_index);
            const locked = !access && s !== "paid";

            return (
              <div
                key={m.id}
                className={`group rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elegant animate-fade-up ${
                  s === "paid"
                    ? "border-primary/30 bg-gradient-to-br from-primary/[0.04] to-transparent"
                    : locked
                    ? "border-border/60 bg-card/60 opacity-80"
                    : "border-border bg-card hover:border-primary/40"
                }`}
                style={{ animationDelay: `${Math.min(idx, 7) * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/45">
                        Module {m.module_index} / 7
                      </span>
                      {s === "paid" && (
                        <Badge className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/15">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Unlocked
                        </Badge>
                      )}
                      {s === "pending" && (
                        <Badge variant="outline" className="border-[hsl(var(--accent-orange))]/50 text-[hsl(var(--accent-orange))]">
                          <Hourglass className="h-3 w-3 mr-1 animate-pulse" /> Awaiting approval
                        </Badge>
                      )}
                      {locked && (
                        <Badge variant="outline" className="text-foreground/50 border-border">
                          <Lock className="h-3 w-3 mr-1" /> Locked
                        </Badge>
                      )}
                    </div>
                    <h2 className="font-display font-semibold text-base sm:text-lg leading-snug">{m.title}</h2>
                    <p className="text-sm text-foreground/60 mt-1.5 leading-relaxed">{m.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base font-bold tracking-tight">৳{m.price_bdt.toLocaleString("en-BD")}</div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/40 mt-0.5">one-time</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {s === "paid" ? (
                    m.content_url ? (
                      <a href={m.content_url} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="default" className="rounded-full">
                          Open content <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </a>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="rounded-full">
                        Content link coming soon
                      </Button>
                    )
                  ) : s === "pending" ? (
                    <Button size="sm" variant="outline" disabled className="rounded-full">
                      <Hourglass className="h-3 w-3 mr-1.5" /> Pending approval…
                    </Button>
                  ) : locked ? (
                    <Button size="sm" variant="outline" disabled className="rounded-full">
                      <Lock className="h-3 w-3 mr-1.5" /> Module {m.module_index - 1} আগে complete করুন
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setOpenModule(m)} className="rounded-full btn-cta-red text-primary-foreground border-0">
                      Pay ৳{m.price_bdt.toLocaleString("en-BD")} via bKash
                    </Button>
                  )}
                  {s === "failed" && (
                    <Button size="sm" variant="outline" onClick={() => setOpenModule(m)} className="rounded-full">
                      Retry submission
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {events.length > 0 && (
          <section className="mt-12 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <h2 className="font-display text-xl font-bold mb-4 tracking-tight">Activity timeline</h2>
            <ol className="space-y-3 border-l border-border/60 pl-5">
              {events.map((e) => (
                <li key={e.id} className="relative text-sm">
                  <span
                    className={`absolute -left-[1.42rem] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-background ${
                      e.event_type === "approved" || e.event_type === "unlocked"
                        ? "bg-primary"
                        : e.event_type === "rejected"
                        ? "bg-destructive"
                        : "bg-[hsl(var(--accent-orange))]"
                    }`}
                  />
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-foreground/45">M{e.module_index}</span>
                    <span className="font-semibold capitalize text-foreground/85">{e.event_type}</span>
                    <span className="text-[11px] text-foreground/40">
                      {new Date(e.created_at).toLocaleString("en-GB", {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {e.message && (
                    <p className="text-foreground/60 text-xs mt-1 leading-relaxed">{e.message}</p>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>


      {openModule && (
        <PaymentDialog
          module={openModule}
          onClose={() => setOpenModule(null)}
          onSubmitted={async () => {
            setOpenModule(null);
            if (userId) await refresh(userId);
          }}
        />
      )}
    </div>
  );
}

function PaymentDialog({
  module: m,
  onClose,
  onSubmitted,
}: {
  module: Module;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [trxId, setTrxId] = useState("");
  const [sender, setSender] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trxId.trim().length < 4) return toast.error("bKash TrxID দিন");
    if (sender.trim().length < 6) return toast.error("সঠিক sender number দিন");
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("course-payment-submit", {
        body: {
          module_index: m.module_index,
          bkash_trx_id: trxId.trim(),
          sender_phone: sender.trim(),
          note: note.trim() || undefined,
        },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Submission failed");
      toast.success("Submission পেয়েছি। Admin approve করলে module unlock হবে।");
      onSubmitted();
    } catch (err: any) {
      toast.error(err.message || "কিছু ভুল হয়েছে — আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(BKASH_RECEIVE_NUMBER);
      toast.success("Number copied");
    } catch {
      /* noop */
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pay ৳{m.price_bdt.toLocaleString("en-BD")} — Module {m.module_index}</DialogTitle>
          <DialogDescription>{m.title}</DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-pink-500/30 bg-pink-500/5 p-4 text-sm space-y-2">
          <p className="font-semibold">bKash {BKASH_RECEIVE_TYPE} করুন:</p>
          <div className="flex items-center justify-between gap-2 rounded-lg bg-background/60 px-3 py-2">
            <code className="text-lg font-bold tracking-wider">{BKASH_RECEIVE_NUMBER}</code>
            <Button type="button" size="sm" variant="ghost" onClick={copyNumber}>
              <Copy className="h-3 w-3 mr-1" /> Copy
            </Button>
          </div>
          <ol className="list-decimal list-inside text-foreground/70 space-y-1 text-xs">
            <li>bKash app → {BKASH_RECEIVE_TYPE} → উপরের number-এ ৳{m.price_bdt} পাঠান</li>
            <li>সফল হলে SMS/app থেকে <b>TrxID</b> কপি করুন</li>
            <li>নিচের form fill up করে submit করুন</li>
            <li>Admin verify করার পর module unlock হবে (সাধারণত 1–4 ঘণ্টা)</li>
          </ol>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="trxid">bKash TrxID *</Label>
            <Input
              id="trxid"
              required
              maxLength={40}
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              placeholder="e.g. 9A8B7C6D5E"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sender">আপনার bKash number *</Label>
            <Input
              id="sender"
              required
              maxLength={20}
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="01XXXXXXXXX"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="কোনো reference / কথা থাকলে লিখুন"
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}