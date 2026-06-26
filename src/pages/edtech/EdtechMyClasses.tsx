import { useEffect, useState } from "react";
import { Loader2, PlayCircle, ExternalLink } from "lucide-react";
import EdtechShell from "@/components/edtech/EdtechShell";
import { useSeo } from "@/hooks/useSeo";
import { listRecordingsForAttendee, getRecordingUrl, type ClassRecording } from "@/lib/classRecordings";
import { toast } from "sonner";

const EdtechMyClasses = () => {
  useSeo({ title: "My Classes — Recordings", noindex: true });
  const [rows, setRows] = useState<ClassRecording[] | null>(null);
  const [playing, setPlaying] = useState<{ id: string; url: string; mime: string } | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    listRecordingsForAttendee().then(setRows).catch(() => setRows([]));
  }, []);

  const watch = async (rec: ClassRecording) => {
    setLoadingId(rec.id);
    try {
      const r = await getRecordingUrl(rec.id);
      setPlaying({ id: rec.id, url: r.url, mime: r.mime_type });
    } catch {
      toast.error("ভিডিও লোড করা গেল না");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <EdtechShell>
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
        <h1 className="font-display text-2xl font-semibold">My Classes</h1>
        <p className="mt-1 text-sm text-foreground/70">আপনি যে live class-গুলোতে join করেছেন তার recording।</p>

        {playing && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border/60 bg-black">
            <video controls autoPlay playsInline className="w-full" src={playing.url} />
          </div>
        )}

        <div className="mt-6">
          {rows === null ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : rows.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-8 text-center text-sm text-foreground/60">
              এখনো কোনো recording নেই।
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {rows.map((r) => (
                <li key={r.id} className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card/40 p-4">
                  <h2 className="line-clamp-2 font-semibold text-foreground">{r.title}</h2>
                  {r.description && <p className="line-clamp-2 text-xs text-foreground/65">{r.description}</p>}
                  <p className="text-[11px] text-foreground/55">
                    {new Date(r.recorded_at).toLocaleString()}{r.duration_sec ? ` · ${Math.round(r.duration_sec/60)} min` : ""}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <button type="button" disabled={loadingId === r.id}
                      onClick={() => watch(r)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                      {loadingId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
                      Watch
                    </button>
                    {r.public_token && (
                      <a href={`/class-recording/${r.public_token}`} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground/75 hover:bg-background/80">
                        <ExternalLink className="h-3.5 w-3.5" /> Public link
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </EdtechShell>
  );
};

export default EdtechMyClasses;