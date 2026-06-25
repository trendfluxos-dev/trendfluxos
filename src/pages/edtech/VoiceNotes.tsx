import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mic, Square, Upload, Loader2, Sparkles, Trash2, BookOpen, ListChecks, Brain, FileQuestion, ArrowRight } from "lucide-react";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechPageHeader from "@/components/edtech/EdtechPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";

type Lecture = {
  id: string;
  title: string;
  subject: string | null;
  status: "pending" | "transcribing" | "ready" | "failed";
  duration_sec: number | null;
  audio_path: string | null;
  transcript: string | null;
  error_message: string | null;
  created_at: string;
};

type Material = {
  lecture_id: string;
  summary: string | null;
  key_concepts: Array<{ term: string; definition: string }>;
  flashcards: Array<{ q: string; a: string }>;
  quiz: Array<{ q: string; options: string[]; answerIndex: number }>;
};

const VoiceNotes = () => {
  useSeo({
    title: "Voice Notes — TrendFlux EdTech",
    description: "Record a lecture or voice note, get an instant AI transcript, summary, flashcards and quiz.",
  });
  const nav = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [materials, setMaterials] = useState<Record<string, Material>>({});
  const [active, setActive] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [working, setWorking] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        toast.error("Sign in to record voice notes");
        nav("/auth?redirect=/edtech/voice-notes", { replace: true });
        setAuthed(false);
        return;
      }
      setAuthed(true);
    });
  }, [nav]);

  const refresh = useCallback(async () => {
    const { data: lecs } = await supabase
      .from("voice_lectures")
      .select("id,title,subject,status,duration_sec,audio_path,transcript,error_message,created_at")
      .order("created_at", { ascending: false });
    setLectures((lecs ?? []) as Lecture[]);
    const ids = (lecs ?? []).map((l) => l.id);
    if (ids.length) {
      const { data: mats } = await supabase
        .from("voice_lecture_materials")
        .select("lecture_id, summary, key_concepts, flashcards, quiz")
        .in("lecture_id", ids);
      const map: Record<string, Material> = {};
      (mats ?? []).forEach((m) => {
        map[m.lecture_id as string] = m as unknown as Material;
      });
      setMaterials(map);
    } else {
      setMaterials({});
    }
  }, []);

  useEffect(() => {
    if (authed) void refresh();
  }, [authed, refresh]);

  // Poll while any lecture is mid-flight
  useEffect(() => {
    const pending = lectures.some((l) => l.status === "pending" || l.status === "transcribing");
    if (!pending) return;
    const id = window.setInterval(() => { void refresh(); }, 4000);
    return () => window.clearInterval(id);
  }, [lectures, refresh]);

  const startRecording = async () => {
    if (!title.trim()) {
      toast.error("Add a title first");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => stream.getTracks().forEach((t) => t.stop());
      rec.start(1000);
      recRef.current = rec;
      startedAtRef.current = Date.now();
      setElapsed(0);
      tickRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 500);
      setRecording(true);
    } catch (err) {
      toast.error("Microphone unavailable");
      console.error(err);
    }
  };

  const stopAndProcess = async () => {
    const rec = recRef.current;
    if (!rec) return;
    setRecording(false);
    if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null; }
    const stopped = new Promise<void>((resolve) => { rec.onstop = () => resolve(); });
    rec.stop();
    await stopped;
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    await uploadAndKickoff(blob, "record");
  };

  const onUpload = async (file: File) => {
    if (!title.trim()) {
      toast.error("Add a title first");
      return;
    }
    await uploadAndKickoff(file, "upload");
  };

  const uploadAndKickoff = async (blob: Blob, source: "record" | "upload") => {
    setWorking(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) throw new Error("No session");
      const ext = source === "upload" ? (((blob as File).name?.split(".").pop()) || "webm") : "webm";
      const lectureId = crypto.randomUUID();
      const path = `${uid}/${lectureId}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("voice-lectures").upload(path, blob, { contentType: blob.type || "audio/webm", upsert: false });
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("voice_lectures").insert({
        id: lectureId,
        user_id: uid,
        title: title.trim(),
        subject: subject.trim() || null,
        source,
        status: "pending",
        duration_sec: source === "record" ? elapsed || null : null,
        audio_path: path,
      });
      if (insErr) throw insErr;

      toast.success("Uploaded — transcribing…");
      setTitle(""); setSubject(""); setElapsed(0);
      await refresh();
      setActive(lectureId);
      // fire-and-forget; UI polls
      void supabase.functions.invoke("transcribe-lecture", { body: { lectureId } })
        .then(async (res) => {
          if (res.error) {
            toast.error("Transcription failed");
            await refresh();
            return;
          }
          await refresh();
          // Auto-extract study sheet once transcript is ready
          await supabase.functions.invoke("extract-study-sheet", { body: { lectureId } });
          await refresh();
        });
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message ?? "Upload failed");
    } finally {
      setWorking(false);
    }
  };

  const regenerate = async (lectureId: string) => {
    setWorking(true);
    try {
      const r = await supabase.functions.invoke("extract-study-sheet", { body: { lectureId } });
      if (r.error) throw r.error;
      toast.success("Study sheet refreshed");
      await refresh();
    } catch (err) {
      toast.error((err as Error).message ?? "Failed");
    } finally {
      setWorking(false);
    }
  };

  const remove = async (lec: Lecture) => {
    if (!confirm(`Delete "${lec.title}"?`)) return;
    if (lec.audio_path) {
      await supabase.storage.from("voice-lectures").remove([lec.audio_path]);
    }
    await supabase.from("voice_lectures").delete().eq("id", lec.id);
    if (active === lec.id) setActive(null);
    await refresh();
  };

  if (authed === null) {
    return (
      <EdtechShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </EdtechShell>
    );
  }

  const current = active ? lectures.find((l) => l.id === active) : null;
  const currentMat = current ? materials[current.id] : null;

  return (
    <EdtechShell>
      <EdtechPageHeader
        eyebrow="Voice → Study Sheet"
        title={<>Voice Notes <span className="edtech-text-gradient">+ AI</span></>}
        description="Record any lecture or voice note. Get an instant transcript plus a summary, key concepts, flashcards and a 5-question quiz — all private to your account."
        actions={
          <Link to="/edtech/teach/voice-studio" className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-card/80">
            Voice Studio <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[360px_1fr] lg:px-10">
        {/* Recorder + library */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5 edtech-shadow-panel">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Mic className="h-4 w-4 text-primary" /> New voice note
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="vn-title" className="text-xs">Title</Label>
                <Input id="vn-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Wednesday physics lecture" disabled={recording || working} />
              </div>
              <div>
                <Label htmlFor="vn-subj" className="text-xs">Subject (optional)</Label>
                <Input id="vn-subj" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Physics" disabled={recording || working} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!recording ? (
                  <Button onClick={startRecording} disabled={working} className="gap-1.5">
                    <Mic className="h-4 w-4" /> Record
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={stopAndProcess} className="gap-1.5">
                    <Square className="h-4 w-4" /> Stop ({fmt(elapsed)})
                  </Button>
                )}
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-card/80">
                  <Upload className="h-4 w-4" />
                  Upload
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    disabled={recording || working}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) void onUpload(f); e.target.value = ""; }}
                  />
                </label>
              </div>
              {recording && (
                <p className="text-xs text-muted-foreground">
                  <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-destructive" /> Recording — speak naturally.
                </p>
              )}
              {working && <p className="text-xs text-muted-foreground"><Loader2 className="mr-1 inline h-3 w-3 animate-spin" /> Uploading…</p>}
            </div>
          </section>

          <section>
            <div className="mb-2 px-1 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Library</div>
            {lectures.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
                No voice notes yet. Record your first one above.
              </div>
            ) : (
              <ul className="space-y-2">
                {lectures.map((l) => {
                  const isActive = active === l.id;
                  return (
                    <li key={l.id}>
                      <button
                        onClick={() => setActive(l.id)}
                        className={`group flex w-full items-start justify-between gap-3 rounded-xl border p-3 text-left transition ${
                          isActive ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-card/80"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-foreground">{l.title}</div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                            <StatusBadge status={l.status} />
                            {l.subject && <span>· {l.subject}</span>}
                            {l.duration_sec ? <span>· {fmt(l.duration_sec)}</span> : null}
                          </div>
                        </div>
                        <Trash2
                          onClick={(e) => { e.stopPropagation(); void remove(l); }}
                          className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>

        {/* Detail */}
        <main>
          {!current ? (
            <div className="grid min-h-[40vh] place-items-center rounded-3xl border border-dashed border-border bg-card/40 p-10 text-center">
              <div className="max-w-md">
                <Sparkles className="mx-auto h-8 w-8 text-primary" />
                <h2 className="mt-3 text-lg font-bold text-foreground">Pick a note to view its study sheet</h2>
                <p className="mt-2 text-sm text-muted-foreground">Every recording becomes a transcript, summary, flashcards and a quiz — generated by Gemini and stored privately.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{current.title}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <StatusBadge status={current.status} />
                    {current.subject && <span>· {current.subject}</span>}
                    {current.duration_sec ? <span>· {fmt(current.duration_sec)}</span> : null}
                  </div>
                  {current.error_message && (
                    <p className="mt-2 text-xs text-destructive">Error: {current.error_message}</p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => regenerate(current.id)} disabled={working || current.status !== "ready"} className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Regenerate
                </Button>
              </header>

              {current.status !== "ready" ? (
                <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin text-primary" />
                  {current.status === "transcribing" ? "Transcribing audio…" : current.status === "pending" ? "Waiting to start…" : "Processing failed. Try regenerating or re-uploading."}
                </div>
              ) : (
                <>
                  {currentMat?.summary && (
                    <Card icon={<BookOpen className="h-4 w-4" />} title="Summary">
                      <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{currentMat.summary}</p>
                    </Card>
                  )}
                  {currentMat?.key_concepts?.length ? (
                    <Card icon={<ListChecks className="h-4 w-4" />} title="Key concepts">
                      <ul className="space-y-2 text-sm">
                        {currentMat.key_concepts.map((k, i) => (
                          <li key={i} className="rounded-lg border border-border/60 bg-card/60 p-3">
                            <div className="font-semibold text-foreground">{k.term}</div>
                            <div className="mt-1 text-muted-foreground">{k.definition}</div>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ) : null}
                  {currentMat?.flashcards?.length ? (
                    <Card icon={<Brain className="h-4 w-4" />} title="Flashcards">
                      <div className="grid gap-2 sm:grid-cols-2">
                        {currentMat.flashcards.map((f, i) => <Flashcard key={i} q={f.q} a={f.a} />)}
                      </div>
                    </Card>
                  ) : null}
                  {currentMat?.quiz?.length ? (
                    <Card icon={<FileQuestion className="h-4 w-4" />} title="Quick quiz">
                      <Quiz items={currentMat.quiz} />
                    </Card>
                  ) : null}
                  <Card title="Transcript">
                    <Textarea value={current.transcript ?? ""} readOnly className="min-h-[200px] font-mono text-xs" />
                  </Card>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </EdtechShell>
  );
};

function Card({ icon, title, children }: { icon?: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 edtech-shadow-panel">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
        {icon && <span className="text-primary">{icon}</span>} {title}
      </div>
      {children}
    </section>
  );
}

function Flashcard({ q, a }: { q: string; a: string }) {
  const [flip, setFlip] = useState(false);
  return (
    <button
      onClick={() => setFlip((v) => !v)}
      className="min-h-[110px] rounded-xl border border-border bg-card/60 p-4 text-left text-sm transition hover:border-primary/40"
    >
      <div className="text-[10px] font-bold uppercase tracking-wider text-primary">{flip ? "Answer" : "Question"}</div>
      <div className="mt-1 text-foreground/90">{flip ? a : q}</div>
    </button>
  );
}

function Quiz({ items }: { items: Array<{ q: string; options: string[]; answerIndex: number }> }) {
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [reveal, setReveal] = useState(false);
  const score = items.reduce((n, q, i) => (picks[i] === q.answerIndex ? n + 1 : n), 0);
  return (
    <div className="space-y-4">
      {items.map((q, i) => (
        <div key={i}>
          <div className="text-sm font-semibold text-foreground">{i + 1}. {q.q}</div>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {q.options.map((opt, oi) => {
              const picked = picks[i] === oi;
              const correct = reveal && oi === q.answerIndex;
              const wrong = reveal && picked && oi !== q.answerIndex;
              return (
                <button
                  key={oi}
                  onClick={() => setPicks((p) => ({ ...p, [i]: oi }))}
                  className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                    correct ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                    : wrong ? "border-destructive bg-destructive/10 text-foreground"
                    : picked ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-card hover:bg-card/80 text-foreground/80"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <Button size="sm" variant={reveal ? "outline" : "default"} onClick={() => setReveal((v) => !v)}>
          {reveal ? "Hide answers" : "Check answers"}
        </Button>
        {reveal && <div className="text-sm font-semibold text-foreground">Score: {score} / {items.length}</div>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Lecture["status"] }) {
  const map: Record<Lecture["status"], { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-muted text-muted-foreground" },
    transcribing: { label: "Transcribing…", cls: "bg-primary/10 text-primary" },
    ready: { label: "Ready", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    failed: { label: "Failed", cls: "bg-destructive/10 text-destructive" },
  };
  const v = map[status];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${v.cls}`}>{v.label}</span>;
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default VoiceNotes;