import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/** Default hourly slots in BDT working hours. */
export const DEFAULT_SLOTS = [
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
] as const;

export type Timeslot = {
  /** ISO date (yyyy-MM-dd) of the picked day. */
  date: string;
  /** HH:mm (24h, BDT). */
  time: string;
  /** Combined ISO 8601 timestamp for submission (local timezone). */
  iso: string;
  /** Human-readable label, e.g. "Mon, 13 Jul 2026 · 15:00 BDT". */
  label: string;
};

type Props = {
  value: Timeslot | null;
  onChange: (slot: Timeslot | null) => void;
  idPrefix?: string;
  slots?: readonly string[];
  disabled?: boolean;
  required?: boolean;
};

function buildSlot(date: Date, time: string): Timeslot {
  const [h, m] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(h, m, 0, 0);
  return {
    date: format(date, "yyyy-MM-dd"),
    time,
    iso: combined.toISOString(),
    label: `${format(combined, "EEE, d MMM yyyy")} · ${time} BDT`,
  };
}

/**
 * Two-step timeslot picker: date via calendar popover, then hourly slot.
 * Emits a fully-formed Timeslot including ISO timestamp for form submission.
 */
const TimeslotPicker = ({
  value,
  onChange,
  idPrefix = "slot",
  slots = DEFAULT_SLOTS,
  disabled,
  required,
}: Props) => {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(`${value.date}T00:00:00`) : undefined,
  );
  const [open, setOpen] = React.useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDate = (d: Date | undefined) => {
    setDate(d);
    setOpen(false);
    if (!d) {
      onChange(null);
      return;
    }
    // Preserve current time selection if any, otherwise clear time.
    if (value?.time) onChange(buildSlot(d, value.time));
    else onChange(null);
  };

  const handleTime = (time: string) => {
    if (!date) return;
    onChange(buildSlot(date, time));
  };

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-date`}>
          Preferred date{required ? " *" : ""}
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={`${idPrefix}-date`}
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "EEE, d MMM yyyy") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDate}
              disabled={(d) => d < today}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-2">
        <Label>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Preferred time (BDT){required ? " *" : ""}
          </span>
        </Label>
        <div
          role="radiogroup"
          aria-label="Preferred time"
          className="grid grid-cols-3 gap-2 sm:grid-cols-4"
        >
          {slots.map((t) => {
            const active = value?.time === t && !!date;
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled || !date}
                onClick={() => handleTime(t)}
                className={cn(
                  "rounded-md border px-2 py-1.5 text-sm transition",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-foreground/15 text-foreground/80 hover:border-primary/50",
                  (disabled || !date) && "opacity-50 cursor-not-allowed",
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
        {!date && (
          <p className="text-xs text-muted-foreground">
            Pick a date to unlock time slots.
          </p>
        )}
        {value && (
          <p className="text-xs text-foreground/70">
            Selected: <span className="font-medium">{value.label}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default TimeslotPicker;