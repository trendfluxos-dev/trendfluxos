import { useEffect, useState } from "react";
import { toast } from "sonner";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import EdtechPageHeader from "@/components/edtech/EdtechPageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";
import { track, EVENTS } from "@/lib/analytics";

type Booking = {
  id: string;
  subject: string;
  starts_at: string;
  ends_at: string;
  status: string;
  notes: string | null;
  price: number;
  currency: string;
  tutor_id: string;
  student_id: string;
};

const BKASH_RECEIVE_NUMBER = "01756004037";
const PAYABLE_STATES = new Set(["accepted", "awaiting_payment", "payment_rejected"]);

/**
 * Unified bookings view. Pass `as="student"` to show /me/bookings,
 * `as="tutor"` to show /teach/bookings with accept/decline actions.
 */
const EdtechBookings = ({ as }: { as: "student" | "tutor" }) => {
  useSeo({
    title: as === "tutor" ? "Tutor inbox — TrendFlux EdTech" : "My bookings — TrendFlux EdTech",
    noindex: true,
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [trxId, setTrxId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const reload = async () => {
    const { data: s } = await supabase.auth.getSession();
    const uid = s.session?.user.id;
    if (!uid) {
      setLoading(false);
      return;
    }
    const col = as === "tutor" ? "tutor_id" : "student_id";
    const { data, error } = await supabase
      .from("tutor_bookings")
      .select("id,subject,starts_at,ends_at,status,notes,price,currency,tutor_id,student_id")
      .eq(col, uid)
      .order("starts_at", { ascending: false });
    if (error) toast.error(error.message);
    setBookings((data ?? []) as Booking[]);
    setLoading(false);
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [as]);

  const respond = async (id: string, status: "accepted" | "declined") => {
    const { error } = await supabase
      .from("tutor_bookings")
      .update({ status, responded_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Booking ${status}.`);
    void reload();
  };

  const openPayment = (id: string) => {
    setPayingId(id);
    setTrxId("");
    setSenderNumber("");
  };

  const submitPayment = async (booking: Booking) => {
    if (submittingPayment) return;
    if (trxId.trim().length < 4 || senderNumber.trim().length < 6) {
      toast.error("Please enter a valid TrxID and sender number.");
      return;
    }
    setSubmittingPayment(true);
    const { data, error } = await supabase.functions.invoke<{ ok: boolean; error?: string }>(
      "tutor-booking-payment-submit",
      {
        body: {
          booking_id: booking.id,
          trx_id: trxId.trim(),
          sender_number: senderNumber.trim(),
          amount: Number(booking.price),
        },
      },
    );
    setSubmittingPayment(false);
    if (error || !data?.ok) {
      toast.error(data?.error || "Could not submit payment. Please try again.");
      return;
    }
    toast.success("Payment submitted. Awaiting admin approval.");
    track(EVENTS.TUTOR_BOOKING_PAYMENT_SUBMIT, {
      booking_id: booking.id,
      amount: Number(booking.price),
      currency: booking.currency,
    });
    setPayingId(null);
    void reload();
  };

  return (
    <EdtechShell>
      <EdtechHeader />
      <EdtechPageHeader
        eyebrow={as === "tutor" ? "Tutor inbox" : "My bookings"}
        title={as === "tutor" ? "Incoming booking requests" : "My booking history"}
        description={
          as === "tutor"
            ? "10 মিনিটের মধ্যে accept / decline না হলে auto-release হবে।"
            : "আপনার সব tutor session — accepted, pending, এবং past sessions।"
        }
      />
      <main className="mx-auto max-w-4xl px-6 py-10 lg:px-10">
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/60 bg-card/40 p-10 text-center">
            <p className="font-display text-lg">এখনো কোনো booking নেই।</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="rounded-2xl border border-border/60 bg-card/40 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-semibold">{b.subject}</h3>
                    <p className="mt-1 text-[12px] text-foreground/60">
                      {new Date(b.starts_at).toLocaleString()} →{" "}
                      {new Date(b.ends_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {b.notes && (
                      <p className="mt-2 text-[13px] leading-[1.7] text-foreground/70">{b.notes}</p>
                    )}
                  </div>
                  <StatusPill status={b.status} />
                </div>
                {as === "tutor" && b.status === "requested" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => respond(b.id, "accepted")}
                      className="rounded-full bg-primary px-4 py-1.5 text-[12px] font-semibold text-primary-foreground"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => respond(b.id, "declined")}
                      className="rounded-full border border-border px-4 py-1.5 text-[12px] font-semibold"
                    >
                      Decline
                    </button>
                  </div>
                )}
                {as === "student" && PAYABLE_STATES.has(b.status) && (
                  <div className="mt-4 rounded-xl border border-border/60 bg-background/60 p-4">
                    {payingId === b.id ? (
                      <div className="space-y-3">
                        <div className="text-[12px] text-foreground/70 leading-relaxed">
                          bKash <b>Send Money</b> to{" "}
                          <code className="rounded bg-card px-1.5 py-0.5">{BKASH_RECEIVE_NUMBER}</code>{" "}
                          — amount <b>৳{Number(b.price).toLocaleString()}</b>, then paste your TrxID below.
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            placeholder="bKash TrxID"
                            className="rounded-lg border border-border bg-card px-3 py-2 text-[13px]"
                            aria-label="bKash transaction ID"
                          />
                          <input
                            value={senderNumber}
                            onChange={(e) => setSenderNumber(e.target.value)}
                            placeholder="Sender bKash number"
                            className="rounded-lg border border-border bg-card px-3 py-2 text-[13px]"
                            aria-label="Sender bKash number"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => submitPayment(b)}
                            disabled={submittingPayment}
                            className="rounded-full bg-primary px-4 py-1.5 text-[12px] font-semibold text-primary-foreground disabled:opacity-60"
                          >
                            {submittingPayment ? "Submitting…" : "Submit payment"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPayingId(null)}
                            className="rounded-full border border-border px-4 py-1.5 text-[12px] font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openPayment(b.id)}
                        className="rounded-full bg-primary px-4 py-1.5 text-[12px] font-semibold text-primary-foreground"
                      >
                        {b.status === "payment_rejected" ? "Resubmit payment" : "Pay with bKash"}
                      </button>
                    )}
                  </div>
                )}
                {as === "student" && b.status === "payment_submitted" && (
                  <p className="mt-3 text-[12px] text-amber-500">
                    Payment submitted — awaiting admin approval.
                  </p>
                )}
                {as === "tutor" && b.status === "payment_submitted" && (
                  <p className="mt-3 text-[12px] text-amber-500">
                    Student has submitted payment — awaiting admin verification.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </EdtechShell>
  );
};

const StatusPill = ({ status }: { status: string }) => {
  const tone =
    status === "accepted" || status === "confirmed" || status === "completed"
      ? "bg-primary/15 text-primary"
      : status === "declined" || status === "cancelled" || status === "payment_rejected"
      ? "bg-rose-500/15 text-rose-400"
      : "bg-amber-400/15 text-amber-500";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${tone}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};

export default EdtechBookings;