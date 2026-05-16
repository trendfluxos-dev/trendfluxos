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

export default function CourseTrendflux() {
  const navigate = useNavigate();
  useSeo({
    title: "TrendFlux Course — ৮ Module Masterclass",
    description: "AI + automation মাস্টারক্লাস। প্রতি module ৳2,000, sequential unlock।",
    noindex: true,
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
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
    const [mods, enrs] = await Promise.all([
      supabase.from("course_modules").select("*").order("module_index"),
      supabase.from("module_enrollments").select("id, module_index, status, bkash_trx_id").eq("user_id", uid),
    ]);
    if (mods.data) setModules(mods.data as Module[]);
    if (enrs.data) setEnrollments(enrs.data as Enrollment[]);
    setLoading(false);
  };

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
      <div className="min-h-screen grid place-items-center bg-background text-foreground/70">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <header className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">TrendFlux Masterclass</h1>
            <p className="text-foreground/60 mt-2 text-sm">
              ৮টি module · প্রতিটি ৳{MODULE_PRICE_BDT.toLocaleString("en-BD")} · sequential unlock
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>Sign out</Button>
        </header>

        <div className="space-y-3">
          {modules.map((m) => {
            const s = statusFor(m.module_index);
            const access = canAccess(m.module_index);
            const locked = !access && s !== "paid";

            return (
              <div
                key={m.id}
                className={`rounded-2xl border p-5 transition ${
                  s === "paid"
                    ? "border-gold/40 bg-gold/5"
                    : locked
                    ? "border-border/40 bg-card/40 opacity-70"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-foreground/50">
                        Module {m.module_index}/8
                      </span>
                      {s === "paid" && (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Unlocked
                        </Badge>
                      )}
                      {s === "pending" && (
                        <Badge variant="outline" className="border-amber-500/40 text-amber-400">
                          <Hourglass className="h-3 w-3 mr-1" /> Awaiting approval
                        </Badge>
                      )}
                      {locked && (
                        <Badge variant="outline" className="text-foreground/50">
                          <Lock className="h-3 w-3 mr-1" /> Locked
                        </Badge>
                      )}
                    </div>
                    <h2 className="font-semibold text-base sm:text-lg">{m.title}</h2>
                    <p className="text-sm text-foreground/60 mt-1">{m.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold">৳{m.price_bdt.toLocaleString("en-BD")}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {s === "paid" ? (
                    m.content_url ? (
                      <a href={m.content_url} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="default">
                          Open content <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </a>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        Content link coming soon
                      </Button>
                    )
                  ) : s === "pending" ? (
                    <Button size="sm" variant="outline" disabled>
                      Pending approval…
                    </Button>
                  ) : locked ? (
                    <Button size="sm" variant="outline" disabled>
                      <Lock className="h-3 w-3 mr-1" /> Module {m.module_index - 1} আগে complete করুন
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setOpenModule(m)}>
                      Pay ৳{m.price_bdt.toLocaleString("en-BD")} via bKash
                    </Button>
                  )}
                  {s === "failed" && (
                    <Button size="sm" variant="outline" onClick={() => setOpenModule(m)}>
                      Retry submission
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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