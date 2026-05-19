import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Send } from "lucide-react";
import { hasFreshLuxeVeilSession } from "@/lib/luxeVeilSession";

const GROUP_LINK = "https://t.me/+5p6S0bI4tDA0OWM1"; // Group id -1003985249841 (public invite preferred)
const INTERVAL_MS = 60 * 1000;

/**
 * Recurring premium reminder to join the private Telegram group.
 * Appears immediately after a verified invite-code unlock, and re-appears
 * every 60 seconds after being dismissed while the visitor is browsing.
 */
const TelegramGroupPopup = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let timer: number | undefined;

    const tick = () => {
      if (hasFreshLuxeVeilSession()) setOpen(true);
    };

    const start = () => {
      // Show immediately when unlocked.
      tick();
      window.clearInterval(timer);
      timer = window.setInterval(tick, INTERVAL_MS);
    };

    start();
    const onFocus = () => tick();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-border bg-background text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-primary">
            <Send className="h-4 w-4 text-gold" />
            Join the Luxe Veil Telegram Circle
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Get instant updates, private offers, and direct access. Join our exclusive Telegram group — members-only.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <a
            href={GROUP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-gold-foreground shadow-gold transition hover:scale-[1.02]"
          >
            <Send className="h-4 w-4" /> Join Telegram Group
          </a>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-center text-xs uppercase tracking-[0.3em] text-foreground/50 hover:text-foreground"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TelegramGroupPopup;
