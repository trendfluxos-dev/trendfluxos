import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic, Play, Plus, Save, Trash2, Volume2, Upload } from "lucide-react";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechPageHeader from "@/components/edtech/EdtechPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";

type Profile = {
  id: string;
  name: string;
  gender: "Male" | "Female" | "Non-binary";
  language: string;
  stability: number;
  similarity: number;
  pitch: number;
  sample_path: string | null;
  sample_filename: string | null;
  preview_text: string | null;
};

const DEFAULT_PREVIEW =
  "Welcome to my class. Today we'll explore how systems are built, why they sometimes fail, and how to keep them simple.";

const VoiceStudio = () => {
  useSeo({
    title: "Voice Studio — TrendFlux EdTech",
    description: "Manage teacher voice profiles with reference samples and tone controls.",
  });
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [draft, setDraft] = useState<Partial<Profile>>({});
  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("voice_profiles")
      .select("id,name,gender,language,stability,similarity,pitch,sample_path,sample_filename,preview_text")
      .order("created_at", { ascending: false });
    setProfiles((data ?? []) as Profile[]);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const openNew = () => {
    setEditing(null);
    setDraft({
      name: "",
      gender: "Non-binary",
      language: "Bangla & English",
      stability: 55,
      similarity: 75,
      pitch: 0,
      preview_text: DEFAULT_PREVIEW,
    });
    setSampleFile(null);
    setPreviewUrl(null);
  };

  const openEdit = async (p: Profile) => {
    setEditing(p);
    setDraft({ ...p });
    setSampleFile(null);
    if (p.sample_path) {
      const { data } = await supabase.storage.from("voice-samples").createSignedUrl(p.sample_path, 600);
      setPreviewUrl(data?.signedUrl ?? null);
    } else {
      setPreviewUrl(null);
    }
  };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `sample-${Date.now()}.webm`, { type: "audio/webm" });
        setSampleFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch (err) {
      toast.error("Microphone unavailable");
      console.error(err);
    }
  };

  const stopRec = () => {
    recRef.current?.stop();
    setRecording(false);
  };

  const save = async () => {
    if (!draft.name?.trim()) { toast.error("Name is required"); return; }
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) throw new Error("Sign in required");
      let samplePath = editing?.sample_path ?? null;
      let sampleFilename = editing?.sample_filename ?? null;
      if (sampleFile) {
        const ext = sampleFile.name.split(".").pop() || "webm";
        const path = `${uid}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("voice-samples").upload(path, sampleFile, { contentType: sampleFile.type || "audio/webm", upsert: false });
        if (upErr) throw upErr;
        // remove old sample
        if (editing?.sample_path) {
          await supabase.storage.from("voice-samples").remove([editing.sample_path]);
        }
        samplePath = path;
        sampleFilename = sampleFile.name;
      }
      const payload = {
        user_id: uid,
        name: draft.name!.trim(),
        gender: (draft.gender as Profile["gender"]) ?? "Non-binary",
        language: draft.language ?? "Bangla & English",
        stability: draft.stability ?? 55,
        similarity: draft.similarity ?? 75,
        pitch: draft.pitch ?? 0,
        sample_path: samplePath,
        sample_filename: sampleFilename,
        preview_text: draft.preview_text ?? DEFAULT_PREVIEW,
      };
      if (editing) {
        const { error } = await supabase.from("voice_profiles").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Profile updated");
      } else {
        const { error } = await supabase.from("voice_profiles").insert(payload);
        if (error) throw error;
        toast.success("Profile saved");
      }
      setEditing(null); setDraft({}); setSampleFile(null); setPreviewUrl(null);
      await refresh();
    } catch (err) {
      toast.error((err as Error).message ?? "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p: Profile) => {
    if (!confirm(`Delete voice profile "${p.name}"?`)) return;
    if (p.sample_path) await supabase.storage.from("voice-samples").remove([p.sample_path]);
    await supabase.from("voice_profiles").delete().eq("id", p.id);
    if (editing?.id === p.id) { setEditing(null); setDraft({}); }
    await refresh();
  };

  return (
    <EdtechShell>
      <EdtechPageHeader
        eyebrow="Teacher · Voice Studio"
        title={<>Voice <span className="edtech-text-gradient">Studio</span></>}
        description="Save reference voice profiles for your classes. Upload or record 1–5 minutes of clean speech, then tune stability, similarity and pitch."
        actions={<Button onClick={openNew} className="gap-1.5"><Plus className="h-4 w-4" /> New profile</Button>}
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[320px_1fr] lg:px-10">
        {/* Profile list */}
        <aside>
          {profiles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
              No voice profiles yet. Create your first one.
            </div>
          ) : (
            <ul className="space-y-2">
              {profiles.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => openEdit(p)}
                    className={`group flex w-full items-start justify-between gap-3 rounded-xl border p-3 text-left transition ${
                      editing?.id === p.id ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-card/80"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-foreground">{p.name}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{p.gender} · {p.language}</div>
                    </div>
                    <Trash2
                      onClick={(e) => { e.stopPropagation(); void remove(p); }}
                      className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Editor */}
        <main>
          {!draft.name && !editing ? (
            <div className="grid min-h-[40vh] place-items-center rounded-3xl border border-dashed border-border bg-card/40 p-10 text-center">
              <div className="max-w-md">
                <Volume2 className="mx-auto h-8 w-8 text-primary" />
                <h2 className="mt-3 text-lg font-bold text-foreground">Pick or create a voice profile</h2>
                <p className="mt-2 text-sm text-muted-foreground">Profiles store your reference audio plus tone parameters. They're scoped to your account only.</p>
              </div>
            </div>
          ) : (
            <section className="space-y-6 rounded-2xl border border-border bg-card p-6 edtech-shadow-panel">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <h2 className="text-lg font-bold text-foreground">{editing ? "Edit voice profile" : "New voice profile"}</h2>
                <div className="flex items-center gap-2">
                  {editing && (
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(null); setDraft({}); setPreviewUrl(null); setSampleFile(null); }}>Cancel</Button>
                  )}
                  <Button onClick={save} disabled={busy} className="gap-1.5">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
                  </Button>
                </div>
              </header>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Name">
                  <Input value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Spoken English — Tanvir" />
                </Field>
                <Field label="Gender">
                  <select
                    value={draft.gender ?? "Non-binary"}
                    onChange={(e) => setDraft({ ...draft, gender: e.target.value as Profile["gender"] })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option>Male</option><option>Female</option><option>Non-binary</option>
                  </select>
                </Field>
                <Field label="Language" className="md:col-span-2">
                  <Input value={draft.language ?? ""} onChange={(e) => setDraft({ ...draft, language: e.target.value })} placeholder="Bangla & English" />
                </Field>

                <RangeField label="Stability" hint="0 = expressive, 100 = steady" value={draft.stability ?? 55} min={0} max={100} step={1} onChange={(v) => setDraft({ ...draft, stability: v })} />
                <RangeField label="Similarity" hint="0 = creative, 100 = mimic" value={draft.similarity ?? 75} min={0} max={100} step={1} onChange={(v) => setDraft({ ...draft, similarity: v })} />
                <RangeField label="Pitch" hint="-50 lower · +50 higher" value={draft.pitch ?? 0} min={-50} max={50} step={1} onChange={(v) => setDraft({ ...draft, pitch: v })} />

                <Field label="Preview script" className="md:col-span-2">
                  <Textarea
                    value={draft.preview_text ?? DEFAULT_PREVIEW}
                    onChange={(e) => setDraft({ ...draft, preview_text: e.target.value })}
                    rows={3}
                    placeholder={DEFAULT_PREVIEW}
                  />
                </Field>
              </div>

              <div className="rounded-xl border border-border bg-card/60 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Mic className="h-4 w-4 text-primary" /> Reference sample
                </div>
                <p className="text-xs text-muted-foreground">Record or upload 1–5 minutes of clean speech to anchor the voice.</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {!recording ? (
                    <Button size="sm" variant="outline" onClick={startRec} className="gap-1.5"><Mic className="h-4 w-4" /> Record</Button>
                  ) : (
                    <Button size="sm" variant="destructive" onClick={stopRec} className="gap-1.5">Stop</Button>
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-card/80">
                    <Upload className="h-4 w-4" /> Upload
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) { setSampleFile(f); setPreviewUrl(URL.createObjectURL(f)); }
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {sampleFile && <span className="text-xs text-muted-foreground">{sampleFile.name} · {(sampleFile.size / 1024).toFixed(0)} KB</span>}
                  {!sampleFile && draft.sample_filename && (
                    <span className="text-xs text-muted-foreground">Current: {draft.sample_filename}</span>
                  )}
                </div>
                {previewUrl && (
                  <div className="mt-3 flex items-center gap-2">
                    <Play className="h-4 w-4 text-primary" />
                    <audio src={previewUrl} controls className="w-full" />
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </EdtechShell>
  );
};

function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs">{label}</Label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function RangeField({ label, hint, value, min, max, step, onChange }: {
  label: string; hint?: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={`${label}: ${value}`} hint={hint}>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0] ?? value)} />
    </Field>
  );
}

export default VoiceStudio;