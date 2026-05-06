import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Download, ExternalLink, FileText, X } from "lucide-react";

const RESUME_URL = "https://zhemonbrand-compasslabs.lovable.app";
const RESUME_PDF = "/resume.pdf"; // drop a PDF at public/resume.pdf to enable direct download

type AnalyticsPayload = {
  event: string;
  label: string;
  href: string;
  ts: number;
};

const trackResumeEvent = (label: string, href: string) => {
  const payload: AnalyticsPayload = {
    event: "resume_cv_click",
    label,
    href,
    ts: Date.now(),
  };
  // 1. dataLayer (GTM / GA4)
  try {
    // @ts-expect-error optional global
    (window.dataLayer = window.dataLayer || []).push(payload);
  } catch {
    /* ignore */
  }
  // 2. Optional analytics endpoint via beacon
  try {
    const endpoint = (import.meta as { env?: Record<string, string> }).env
      ?.VITE_ANALYTICS_ENDPOINT;
    if (endpoint && "sendBeacon" in navigator) {
      navigator.sendBeacon(endpoint, new Blob([JSON.stringify(payload)], { type: "application/json" }));
    }
  } catch {
    /* ignore */
  }
  // 3. Console for visibility in dev
  console.info("[analytics]", payload);
};

export const ResumeButton = () => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) triggerRef.current?.focus();
  }, [open]);

  const openModal = () => {
    trackResumeEvent("open_modal", RESUME_URL);
    setOpen(true);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openModal}
        aria-label="Preview the Resume / CV of Brand Architect Zahid Hasan Emon in a modal — opens an embedded preview with options to view online or download the PDF"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="absolute bottom-6 right-6 inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-semibold text-gold-foreground shadow-gold transition hover:scale-105 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <FileText className="w-3.5 h-3.5" aria-hidden="true" />
        Resume / CV
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="resume-modal-title"
          aria-describedby="resume-modal-desc"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="Close Resume / CV preview"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative z-10 flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gold/40 bg-background shadow-2xl">
            <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
              <div>
                <h2 id="resume-modal-title" className="font-display text-base font-semibold text-foreground">
                  Resume / CV — Zahid Hasan Emon
                </h2>
                <p id="resume-modal-desc" className="text-xs text-foreground/60">
                  Preview, open in a new tab, or download the PDF.
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close Resume / CV preview"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 hover:bg-foreground/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-foreground/5 px-5 py-3">
              <a
                href={RESUME_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackResumeEvent("open_external", RESUME_URL)}
                className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-semibold text-gold-foreground shadow-gold transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Open the full Resume / CV in a new browser tab"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                Open in new tab <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </a>
              <a
                href={RESUME_PDF}
                download="Zahid-Hasan-Emon-Resume.pdf"
                onClick={() => trackResumeEvent("download_pdf", RESUME_PDF)}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 px-4 py-2 text-xs font-semibold text-gold transition hover:bg-gold/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Download the Resume / CV as a PDF file"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Download PDF
              </a>
            </div>

            <div className="relative flex-1 bg-foreground/[0.02]">
              <iframe
                src={RESUME_URL}
                title="Resume / CV preview — Zahid Hasan Emon"
                className="h-full w-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResumeButton;
