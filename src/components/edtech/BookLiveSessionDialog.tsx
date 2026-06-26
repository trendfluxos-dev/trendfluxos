import { useEffect, useState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { supabase } from "@/integrations/supabase/client";
import { formatStartsAt, rsvp, type LiveClass } from "@/lib/liveClasses";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: LiveClass[];
  /** Class to preselect when the modal opens. */
  selectedClassId?: string | null;
  onBooked?: () => void;
}

const BookLiveSessionDialog = ({
  open,
  onOpenChange,
  classes,
  selectedClassId,
  onBooked,
}: Props) => {
  const [classId, setClassId] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setClassId(selectedClassId ?? classes[0]?.id ?? "");
    setNote("");
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) {
        setEmail((prev) => prev || u.email || "");
        const meta = (u.user_metadata ?? {}) as Record<string, string>;
        setName((prev) => prev || meta.full_name || meta.name || "");
      }
    });
  }, [open, selectedClassId, classes]);

  const selected = classes.find((c) => c.id === classId) ?? null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) {
      toast.error("Please pick a session.");
      return;
    }
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (uid) {
        await rsvp(classId, uid);
        toast.success("You're booked! Join link unlocks 15 min before start.");
      } else {
        // No session — store a lightweight booking intent locally so the
        // user can sign in and confirm afterwards.
        const intents = JSON.parse(
          localStorage.getItem("edtech.bookingIntents") ?? "[]",
        ) as Array<Record<string, string>>;
        intents.push({
          classId,
          name: name.trim(),
          email: email.trim(),
          note: note.trim(),
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem("edtech.bookingIntents", JSON.stringify(intents));
        toast.success("Booking saved. Sign in to confirm your seat.");
      }
      onBooked?.();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Could not complete booking. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
            Book a Live Session
          </DialogTitle>
          <DialogDescription>
            Reserve your seat. We'll unlock the join link 15 minutes before the
            call starts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="book-session">Session</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger id="book-session">
                <SelectValue placeholder="Choose a session" />
              </SelectTrigger>
              <SelectContent>
                {classes.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No upcoming sessions yet.
                  </div>
                ) : (
                  classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selected && (
              <p className="text-[11px] text-muted-foreground">
                {formatStartsAt(selected.starts_at)} · {selected.duration_min} min
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="book-name">Your name</Label>
              <Input
                id="book-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="book-email">Email</Label>
              <Input
                id="book-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="book-note">Anything we should know? (optional)</Label>
            <Textarea
              id="book-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Topics you want covered, questions, etc."
            />
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-border/60 px-4 py-2 text-sm hover:bg-muted/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || classes.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
              Confirm booking
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookLiveSessionDialog;