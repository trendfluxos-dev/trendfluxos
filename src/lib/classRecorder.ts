// Browser MediaRecorder wrapper. Mixes a video-only screen share stream
// with the teacher's microphone audio, records as webm, and returns
// the final Blob on stop.
export type RecorderHandle = {
  stop: () => Promise<Blob>;
  cancel: () => void;
  getMimeType: () => string;
  getStartedAt: () => number;
};

const PREFERRED_MIMES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

export function isRecorderSupported(): boolean {
  return typeof window !== "undefined"
    && typeof (window as unknown as { MediaRecorder?: unknown }).MediaRecorder === "function";
}

function pickMime(): string {
  if (!isRecorderSupported()) return "";
  for (const m of PREFERRED_MIMES) {
    try { if (MediaRecorder.isTypeSupported(m)) return m; } catch { /* ignore */ }
  }
  return "";
}

export async function startClassRecorder(videoStream: MediaStream): Promise<RecorderHandle> {
  if (!isRecorderSupported()) {
    throw new Error("এই browser-এ recording supported না। Chrome/Edge ব্যবহার করুন।");
  }
  let micStream: MediaStream | null = null;
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    // Continue without mic — we will record video only.
    micStream = null;
  }

  const tracks: MediaStreamTrack[] = [];
  videoStream.getVideoTracks().forEach((t) => tracks.push(t));
  videoStream.getAudioTracks().forEach((t) => tracks.push(t)); // tab audio if any
  micStream?.getAudioTracks().forEach((t) => tracks.push(t));

  const mixed = new MediaStream(tracks);
  const mime = pickMime();
  const recorder = new MediaRecorder(mixed, mime ? { mimeType: mime } : undefined);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const startedAt = Date.now();
  recorder.start(2_000); // chunk every 2s for crash safety

  // If the screen stream ends, stop recording.
  videoStream.getVideoTracks()[0]?.addEventListener("ended", () => {
    if (recorder.state !== "inactive") {
      try { recorder.stop(); } catch { /* ignore */ }
    }
  });

  function cleanupMic() {
    micStream?.getTracks().forEach((t) => { try { t.stop(); } catch { /* ignore */ } });
  }

  return {
    getMimeType: () => recorder.mimeType || mime || "video/webm",
    getStartedAt: () => startedAt,
    stop: () => new Promise<Blob>((resolve, reject) => {
      const onStop = () => {
        cleanupMic();
        const blob = new Blob(chunks, { type: recorder.mimeType || mime || "video/webm" });
        resolve(blob);
      };
      recorder.addEventListener("stop", onStop, { once: true });
      recorder.addEventListener("error", (ev) => {
        cleanupMic();
        const err = (ev as unknown as { error?: Error }).error;
        reject(err ?? new Error("Recorder error"));
      }, { once: true });
      try {
        if (recorder.state !== "inactive") recorder.stop();
        else onStop();
      } catch (e) { cleanupMic(); reject(e as Error); }
    }),
    cancel: () => {
      try { if (recorder.state !== "inactive") recorder.stop(); } catch { /* ignore */ }
      cleanupMic();
    },
  };
}