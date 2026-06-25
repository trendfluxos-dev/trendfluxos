import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, ExternalLink, MonitorUp, RefreshCw, ShieldAlert, X } from "lucide-react";
import { toast } from "sonner";
import { pickWindowStream } from "@/lib/screenBroadcast";

type PickError =
  | { kind: "unsupported"; message: string }
  | { kind: "denied"; message: string }
  | { kind: "nothing"; message: string }
  | { kind: "other"; message: string };

function classify(err: unknown): PickError {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
    return { kind: "unsupported", message: "এই ব্রাউজার window/tab share সাপোর্ট করে না।" };
  }
  const e = err as { name?: string; message?: string };
  const name = e?.name ?? "";
  const msg = e?.message ?? "";
  if (/NotAllowed|Permission/i.test(name) || /denied|permission/i.test(msg)) {
    return { kind: "denied", message: "Permission দেওয়া হয়নি বা picker বন্ধ করে দেওয়া হয়েছে।" };
  }
  if (/NotFound|AbortError/i.test(name)) {
    return { kind: "nothing", message: "কোনো window/tab সিলেক্ট হয়নি।" };
  }
  return { kind: "other", message: msg || "Screen share শুরু করা গেল না।" };
}

export function ShareWindowDialog({
  open,
  onClose,
  onConfirm,
  studentUrl,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (stream: MediaStream) => void;
  studentUrl?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<PickError | null>(null);
  const [supported, setSupported] = useState<boolean>(true);

  const stopStream = useCallback((s: MediaStream | null) => {
    s?.getTracks().forEach((t) => { try { t.stop(); } catch { /* noop */ } });
  }, []);

  const pick = useCallback(async () => {
    setError(null);
    setPicking(true);
    try {
      const s = await pickWindowStream();
      // If picker returns no video tracks, treat as nothing chosen.
      if (!s.getVideoTracks().length) {
        stopStream(s);
        setError({ kind: "nothing", message: "কোনো window/tab সিলেক্ট হয়নি।" });
        return;
      }
      // Stop any prior preview before swapping.
      setStream((prev) => { stopStream(prev); return s; });
      // Auto-stop preview if user clicks browser's "Stop sharing".
      s.getVideoTracks()[0]?.addEventListener("ended", () => {
        setStream((curr) => (curr === s ? null : curr));
      });
    } catch (e) {
      setError(classify(e));
    } finally {
      setPicking(false);
    }
  }, [stopStream]);

  // On open: detect support, auto-open picker once.
  useEffect(() => {
    if (!open) return;
    const ok = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getDisplayMedia;
    setSupported(ok);
    setError(null);
    if (!ok) {
      setError({ kind: "unsupported", message: "এই ব্রাউজার window/tab share সাপোর্ট করে না।" });
      return;
    }
    void pick();
  }, [open, pick]);

  // Cleanup any preview stream when dialog closes / unmounts.
  useEffect(() => {
    if (open) return;
    setStream((prev) => { stopStream(prev); return null; });
  }, [open, stopStream]);
  useEffect(() => () => { stopStream(stream); }, [stream, stopStream]);

  // Bind preview stream to <video>.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.srcObject = stream;
    if (stream) v.play().catch(() => { /* autoplay block ok */ });
  }, [stream]);

  const confirm = useCallback(() => {
    if (!stream) return;
    // Hand the stream to the caller WITHOUT stopping it.
    const handoff = stream;
    setStream(null); // prevent cleanup effect from stopping it
    onConfirm(handoff);
  }, [stream, onConfirm]);

  const copyLink = useCallback(async () => {
    if (!studentUrl) return;
    try { await navigator.clipboard.writeText(studentUrl); toast.success("Student link copied."); }
    catch { toast.error(`Link: ${studentUrl}`); }
  }, [studentUrl]);

  if (!open) return null;

  const trackLabel = stream?.getVideoTracks()[0]?.label || "নির্বাচিত উইন্ডো";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
          <div className="flex items-center gap-2">
            <MonitorUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Share a window with students</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-foreground/60 hover:bg-accent/50 hover:text-foreground" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {/* Preview */}
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-black" style={{ aspectRatio: "16 / 9" }}>
            {stream ? (
              <video ref={videoRef} muted playsInline className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center text-white/80">
                {picking ? (
                  <>
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                    <p className="text-[12px] text-white/70">ব্রাউজারের picker খুলুন এবং একটি window/tab বেছে নিন…</p>
                  </>
                ) : (
                  <p className="text-[12px] text-white/60">কোনো প্রিভিউ নেই — একটি window/tab বেছে নিন।</p>
                )}
              </div>
            )}
            {stream && (
              <div className="absolute left-2 top-2 max-w-[80%] truncate rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                {trackLabel}
              </div>
            )}
          </div>

          {/* Error block with fallback CTA */}
          {error && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-[12.5px] text-amber-200">
              <div className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="font-semibold">
                    {error.kind === "unsupported" && "Browser এই feature সাপোর্ট করছে না"}
                    {error.kind === "denied" && "Screen share permission পাওয়া যায়নি"}
                    {error.kind === "nothing" && "Window/tab বেছে নেওয়া হয়নি"}
                    {error.kind === "other" && "Screen share শুরু করা গেল না"}
                  </p>
                  <p className="text-amber-100/90">{error.message}</p>
                  {error.kind === "denied" && (
                    <p className="text-amber-100/80">
                      Chrome/Edge address bar-এর lock আইকনে গিয়ে Site settings → Screen share → Allow করুন, তারপর আবার চেষ্টা করুন।
                    </p>
                  )}
                  {error.kind === "unsupported" && (
                    <p className="text-amber-100/80">
                      Desktop Chrome, Edge অথবা Firefox-এর সর্বশেষ ভার্সনে চালান। iOS Safari এখনো window-share সাপোর্ট করে না।
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(error.kind === "denied" || error.kind === "nothing" || error.kind === "other") && (
                      <button type="button" onClick={pick} disabled={picking} className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1 text-[11px] font-semibold text-amber-950 hover:bg-amber-400 disabled:opacity-60">
                        <RefreshCw className="h-3 w-3" /> আবার চেষ্টা করুন
                      </button>
                    )}
                    {studentUrl && (
                      <>
                        <button type="button" onClick={copyLink} className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/50 bg-transparent px-3 py-1 text-[11px] font-semibold text-amber-100 hover:bg-amber-500/15">
                          <Copy className="h-3 w-3" /> Student link কপি
                        </button>
                        <a href={studentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/50 bg-transparent px-3 py-1 text-[11px] font-semibold text-amber-100 hover:bg-amber-500/15">
                          <ExternalLink className="h-3 w-3" /> অন্য ব্রাউজারে খুলুন
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action bar */}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-[12px] font-medium text-foreground/80 hover:bg-background/80">
              Cancel
            </button>
            {supported && (
              <button type="button" onClick={pick} disabled={picking} className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[12px] font-medium text-foreground/80 hover:bg-background/80 disabled:opacity-60">
                <RefreshCw className="h-3.5 w-3.5" /> {stream ? "অন্য window বেছে নিন" : "Window বেছে নিন"}
              </button>
            )}
            <button type="button" onClick={confirm} disabled={!stream} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
              <MonitorUp className="h-3.5 w-3.5" /> Share শুরু করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}