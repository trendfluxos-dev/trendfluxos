import * as React from "react";
import { format } from "date-fns";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";
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

/** Organizer canonical timezone: strategy calls are scheduled in Dhaka. */
export const ORGANIZER_TZ = "Asia/Dhaka";

/** Default hourly slots expressed as HH:mm wall time in ORGANIZER_TZ. */
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
  /** ISO date (yyyy-MM-dd) of the picked day, in organizer timezone. */
  date: string;
  /** HH:mm (24h) wall time in organizer timezone. */
  time: string;
  /** Combined absolute UTC ISO 8601 timestamp for submission. */
  iso: string;
  /** Legacy composite label (kept for back-compat). */
  label: string;
  /** IANA timezone the slot is anchored to (organizer). */
  organizerTz: string;
  /** IANA timezone the visitor is currently in (browser resolved). */
  userTz: string;
  /** Human-readable label in organizer timezone, e.g. "Mon, 13 Jul 2026 · 15:00 (Asia/Dhaka)". */
  organizerLabel: string;
  /** Same instant rendered in the user's local timezone. */
  userLabel: string;
};

type Props = {
  value: Timeslot | null;
  onChange: (slot: Timeslot | null) => void;
  idPrefix?: string;
  slots?: readonly string[];
  disabled?: boolean;
  required?: boolean;
  /** Override for tests — defaults to the visitor's resolved browser timezone. */
  userTz?: string;
};

function resolveUserTz(explicit?: string): string {
  if (explicit) return explicit;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function buildSlot(date: Date, time: string, userTz: string): Timeslot {
  const dateStr = format(date, "yyyy-MM-dd");
  // Interpret HH:mm as wall time in the organizer timezone, then convert
  // to an absolute UTC instant. Everything else derives from that instant.
  const instant = fromZonedTime(`${dateStr}T${time}:00`, ORGANIZER_TZ);
  const organizerLabel = formatInTimeZone(
    instant,
    ORGANIZER_TZ,
    "EEE, d MMM yyyy · HH:mm '(Asia/Dhaka, BDT)'",
  );
  const userLabel = formatInTimeZone(
    instant,
    userTz,
    `EEE, d MMM yyyy · HH:mm '(${userTz})'`,
  );
  return {
    date: dateStr,
    time,
    iso: instant.toISOString(),
    label: organizerLabel,
    organizerTz: ORGANIZER_TZ,
    userTz,
    organizerLabel,
    userLabel,
  };
}

/**
 * Two-step timeslot picker: date via calendar popover, then hourly slot.
 * Emits a fully-formed Timeslot with an absolute UTC instant plus both
 * organizer- and user-local wall-time labels so downstream UI can show
 * "10:00 BDT (07:00 in your time)" without another conversion pass.
 */
const TimeslotPicker = ({
  value,
  onChange,
  idPrefix = "slot",
  slots = DEFAULT_SLOTS,
  disabled,
  required,
  userTz: userTzProp,
}: Props) => {
  const userTz = React.useMemo(() => resolveUserTz(userTzProp), [userTzProp]);

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
    if (value?.time) onChange(buildSlot(d, value.time, userTz));
    else onChange(null);
  };

  const handleTime = (time: string) => {
    if (!date) return;
    onChange(buildSlot(date, time, userTz));
  };

  // Precompute "local translation" for each BDT slot on the picked date so
  // visitors can see when the call falls in their own timezone.
  const localForSlot = React.useCallback(
    (t: string): string | null => {
      if (!date) return null;
      const dateStr = format(date, "yyyy-MM-dd");
      const instant = fromZonedTime(`${dateStr}T${t}:00`, ORGANIZER_TZ);
      return formatInTimeZone(instant, userTz, "HH:mm");
    },
    [date, userTz],
  );

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
            Preferred time — organizer is on Asia/Dhaka (BDT){required ? " *" : ""}
          </span>
        </Label>
        <div
          role="radiogroup"
          aria-label="Preferred time"
          className="grid grid-cols-3 gap-2 sm:grid-cols-4"
        >
          {slots.map((t) => {
            const active = value?.time === t && !!date;
            const localT = localForSlot(t);
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled || !date}
                onClick={() => handleTime(t)}
                aria-label={
                  localT ? `${t} organizer time · ${localT} your time` : `${t} organizer time`
                }
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-md border px-2 py-1.5 text-sm transition",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-foreground/15 text-foreground/80 hover:border-primary/50",
                  (disabled || !date) && "opacity-50 cursor-not-allowed",
                )}
              >
                <span>{t}</span>
                {localT && localT !== t && (
                  <span className="text-[10px] font-normal text-foreground/50">
                    {localT} local
                  </span>
                )}
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
          <div className="rounded-md border border-foreground/10 bg-foreground/[0.02] p-2 text-xs text-foreground/75">
            <p>
              Organizer time: <span className="font-medium">{value.organizerLabel}</span>
            </p>
            <p className="mt-0.5">
              Your time ({value.userTz}):{" "}
              <span className="font-medium">{value.userLabel}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeslotPicker;