import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "consentGranted";

/**
 * GDPR-style consent banner that powers GA4 Consent Mode v2.
 * The button carries id="consent-grant-btn" so the gtag handler
 * in index.html binds to it automatically.
 */
const ConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "true") {
        // Defer slightly to avoid CLS on first paint
        const t = window.setTimeout(() => setVisible(true), 600);
        return () => window.clearTimeout(t);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  const handleGrant = () => {
    // The actual gtag('consent','update') is handled by the listener in
    // index.html (bound to #consent-grant-btn). We just close the banner.
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-2xl border border-border/60 bg-background/95 p-4 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-muted-foreground">
          We use cookies to analyse traffic and improve your experience. By
          accepting, you allow analytics in line with our{" "}
          <a href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </a>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={dismiss}
            className="text-muted-foreground"
          >
            Decline
          </Button>
          <Button
            id="consent-grant-btn"
            size="sm"
            onClick={handleGrant}
            className="font-semibold"
          >
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
