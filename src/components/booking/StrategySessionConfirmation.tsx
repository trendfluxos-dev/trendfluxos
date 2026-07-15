import { CheckCircle2, Copy } from "lucide-react";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Timeslot } from "@/components/booking/TimeslotPicker";

export type StrategySessionConfirmationData = {
  reference: string;
  name: string;
  email: string;
  interests: string[];
  bookedAt: Date;
  caseSlug: string | null;
  slot: Timeslot;
};

type Props = {
  confirmation: StrategySessionConfirmationData;
  onCopyReference: () => void;
  onClose: () => void;
};

/**
 * Success/confirmation view for the Strategy Session dialog. Extracted so
 * it can be snapshot-tested independently of the booking form state.
 */
const StrategySessionConfirmation = ({
  confirmation,
  onCopyReference,
  onClose,
}: Props) => (
  <>
    <DialogHeader>
      <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 ring-1 ring-gold/40">
        <CheckCircle2 className="h-7 w-7 text-gold" aria-hidden />
      </div>
      <DialogTitle className="text-center font-display text-2xl">
        Booking confirmed
      </DialogTitle>
      <DialogDescription className="text-center">
        We've received your request and will reach out within 1 business day to
        lock in your session.
      </DialogDescription>
    </DialogHeader>

    <div className="mt-2 rounded-2xl border border-gold/30 bg-gold/[0.04] p-4 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
        Reference ID
      </p>
      <div className="mt-2 flex items-center justify-center gap-2">
        <code className="rounded-lg bg-foreground/5 px-3 py-1.5 font-mono text-base font-semibold tracking-wider text-foreground">
          {confirmation.reference}
        </code>
        <button
          type="button"
          onClick={onCopyReference}
          aria-label="Copy reference ID"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-foreground/15 text-foreground/70 transition hover:border-gold/50 hover:text-gold"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mt-2 text-[11px] text-foreground/55">
        Quote this reference in any reply or follow-up email.
      </p>
    </div>

    <dl className="mt-2 grid gap-3 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm sm:grid-cols-2">
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
          Name
        </dt>
        <dd className="mt-1 text-foreground">{confirmation.name}</dd>
      </div>
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
          Email
        </dt>
        <dd className="mt-1 break-all text-foreground">{confirmation.email}</dd>
      </div>
      <div className="sm:col-span-2">
        <dt className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
          Interests
        </dt>
        <dd className="mt-1 flex flex-wrap gap-1.5">
          {confirmation.interests.map((i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-full border border-gold/30 bg-gold/5 px-2.5 py-0.5 text-[11px] font-medium text-gold"
            >
              {i}
            </span>
          ))}
        </dd>
      </div>
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
          Booked
        </dt>
        <dd className="mt-1 text-foreground/80">
          {confirmation.bookedAt.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </dd>
      </div>
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
          Session slot
        </dt>
        <dd className="mt-1 space-y-0.5 text-foreground/80">
          <p>
            <span className="text-[10px] uppercase tracking-wider text-foreground/50">Organizer</span>{" "}
            {confirmation.slot.organizerLabel ?? confirmation.slot.label}
          </p>
          {confirmation.slot.userLabel &&
            confirmation.slot.userTz !== confirmation.slot.organizerTz && (
              <p>
                <span className="text-[10px] uppercase tracking-wider text-foreground/50">
                  Your time
                </span>{" "}
                {confirmation.slot.userLabel}
              </p>
            )}
        </dd>
      </div>
      {confirmation.caseSlug && (
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.25em] text-foreground/50">
            Originating case
          </dt>
          <dd className="mt-1 font-mono text-xs text-foreground/80">
            {confirmation.caseSlug}
          </dd>
        </div>
      )}
    </dl>

    <DialogFooter className="gap-2 sm:gap-3">
      <Button type="button" variant="ghost" onClick={onClose}>
        Close
      </Button>
      <Button type="button" variant="gold" onClick={onClose} autoFocus>
        Done
      </Button>
    </DialogFooter>
  </>
);

export default StrategySessionConfirmation;