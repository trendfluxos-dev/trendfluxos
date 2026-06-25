import { useEffect, useState } from "react";
import { toast } from "sonner";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import EdtechPageHeader from "@/components/edtech/EdtechPageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";

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
      : status === "declined" || status === "cancelled"
      ? "bg-rose-500/15 text-rose-400"
      : "bg-amber-400/15 text-amber-500";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${tone}`}
    >
      {status}
    </span>
  );
};

export default EdtechBookings;