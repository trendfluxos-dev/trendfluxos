import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRecordingUrlByToken } from "@/lib/classRecordings";
import { useSeo } from "@/hooks/useSeo";

const ClassRecording = () => {
  const { token = "" } = useParams<{ token: string }>();
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "error"; msg: string }
    | { kind: "ready"; url: string; mime: string; title: string }
  >({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await getRecordingUrlByToken(token);
        if (cancelled) return;
        setState({ kind: "ready", url: r.url, mime: r.mime_type, title: r.title });
      } catch {
        if (!cancelled) setState({ kind: "error", msg: "Recording পাওয়া যায়নি বা link expired।" });
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  useSeo({
    title: state.kind === "ready" ? `${state.title} — Class recording` : "Class recording",
    noindex: true,
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-10">
      {state.kind === "loading" && (
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      )}
      {state.kind === "error" && (
        <div className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center">
          <h1 className="font-display text-xl font-semibold">Recording পাওয়া যায়নি</h1>
          <p className="mt-2 text-sm text-foreground/70">{state.msg}</p>
        </div>
      )}
      {state.kind === "ready" && (
        <div className="w-full space-y-4">
          <h1 className="font-display text-2xl font-semibold">{state.title}</h1>
          <video controls playsInline className="w-full rounded-2xl bg-black shadow-xl"
            src={state.url} />
        </div>
      )}
    </main>
  );
};

export default ClassRecording;