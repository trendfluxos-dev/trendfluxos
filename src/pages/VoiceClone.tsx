import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, Wand2, Download, Play, Star, Trash2, Plus, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";

/**
 * Personal AI Voice — Founder-only standalone studio (Phase 2A).
 * Voice library: multiple named voices, default selection, delete.
 * Generate: pick an active voice → type text → audio.
 */
type VoiceAsset = {
  id: string;
  name: string;
  vps_path: string;
  is_default: boolean;
  sample_size_bytes: number | null;
  created_at: string;
};

const VoiceClone = () => {
  useSeo({
    title: "Personal AI Voice Studio — TrendFlux",
    description: "Founder-only voice cloning studio. Upload a sample, type any text, get audio in your voice.",
  });

  // Library
  const [voices, setVoices] = useState<VoiceAsset[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [activeVoiceId, setActiveVoiceId] = useState<string>("");

  // Upload
  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const [newVoiceName, setNewVoiceName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Generate
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<"en" | "bn">("bn");
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/xtts-proxy`;

  async function authHeaders(): Promise<Record<string, string>> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("Sign in required");
    return { Authorization: `Bearer ${token}` };
  }

  const loadLibrary = async () => {
    setLoadingLibrary(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${fnUrl}?action=list`, { headers });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `Load failed (${res.status})`);
      const list: VoiceAsset[] = json.voices ?? [];
      setVoices(list);
      setActiveVoiceId((prev) => {
        if (prev && list.some((v) => v.id === prev)) return prev;
        return list.find((v) => v.is_default)?.id ?? list[0]?.id ?? "";
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load voice library");
    } finally {
      setLoadingLibrary(false);
    }
  };

  useEffect(() => {
    loadLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async () => {
    if (!sampleFile) {
      toast.error("Please choose a voice sample (.wav or .mp3, 1–2 min)");
      return;
    }
    setUploading(true);
    try {
      const headers = await authHeaders();
      const fd = new FormData();
      fd.append("file", sampleFile);
      if (newVoiceName.trim()) fd.append("name", newVoiceName.trim());
      const res = await fetch(`${fnUrl}?action=upload`, {
        method: "POST",
        headers,
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `Upload failed (${res.status})`);
      toast.success(`Voice "${json.voice?.name ?? "saved"}" added to library`);
      setSampleFile(null);
      setNewVoiceName("");
      setShowUpload(false);
      await loadLibrary();
      if (json.voice?.id) setActiveVoiceId(json.voice.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${fnUrl}?action=set_default`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `Failed (${res.status})`);
      toast.success("Default voice updated");
      await loadLibrary();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not set default");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete voice "${name}"? This removes it from your library (file stays on the VPS).`)) return;
    try {
      const headers = await authHeaders();
      const res = await fetch(`${fnUrl}?action=delete`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `Failed (${res.status})`);
      toast.success("Voice removed");
      if (activeVoiceId === id) setActiveVoiceId("");
      await loadLibrary();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleGenerate = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error("Type some text first");
      return;
    }
    setGenerating(true);
    setAudioUrl(null);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${fnUrl}?action=generate`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          language,
          ...(activeVoiceId ? { voice_id: activeVoiceId } : {}),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as Record<string, unknown>));
        throw new Error((err as { error?: string }).error ?? `Generate failed (${res.status})`);
      }
      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        const json = await res.json();
        toast.message("Audio ready on VPS", { description: JSON.stringify(json).slice(0, 200) });
      } else {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setTimeout(() => audioRef.current?.play().catch(() => {}), 100);
        toast.success("Voice generated");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generate failed");
    } finally {
      setGenerating(false);
    }
  };

  const activeVoice = voices.find((v) => v.id === activeVoiceId);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <header className="mb-8 space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Founder-only · Personal AI Voice
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            🎤 Voice Clone Studio
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Manage a library of cloned voices. Pick one as active, type any
            Bangla or English text, and download the result. Runs on your
            self-hosted XTTS-v2 server.
          </p>
        </header>

        {/* STEP 1 — Voice library */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">1. Voice library</h2>
              <p className="text-sm text-muted-foreground">
                Select an active voice or add a new one.
              </p>
            </div>
            <Button size="sm" variant={showUpload ? "secondary" : "default"} onClick={() => setShowUpload((v) => !v)}>
              <Plus className="mr-1 h-4 w-4" /> {showUpload ? "Close" : "Add voice"}
            </Button>
          </div>

          {loadingLibrary ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading library…
            </div>
          ) : voices.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              <Mic2 className="mx-auto mb-2 h-6 w-6 opacity-60" />
              No voices yet. Click <strong className="text-foreground">Add voice</strong> to upload your first sample.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {voices.map((v) => {
                const isActive = v.id === activeVoiceId;
                return (
                  <div
                    key={v.id}
                    className={`group relative rounded-xl border p-3 transition ${
                      isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveVoiceId(v.id)}
                      className="block w-full text-left"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">{v.name}</span>
                        {v.is_default && (
                          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="mt-1 truncate text-[11px] text-muted-foreground">
                        {v.vps_path}
                      </div>
                    </button>
                    <div className="mt-2 flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleSetDefault(v.id)}
                        disabled={v.is_default}
                      >
                        <Star className="mr-1 h-3.5 w-3.5" /> Default
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={() => handleDelete(v.id, v.name)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {showUpload && (
            <div className="mt-5 space-y-3 rounded-xl border border-dashed border-border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">
                Clean 1–2 min recording (WAV or MP3). Quiet room, single speaker, no music.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="voice-name" className="text-xs">Voice name</Label>
                  <Input
                    id="voice-name"
                    value={newVoiceName}
                    onChange={(e) => setNewVoiceName(e.target.value)}
                    placeholder="e.g. My Voice, Podcast Voice"
                  />
                </div>
                <div>
                  <Label htmlFor="voice-sample" className="text-xs">Audio file</Label>
                  <Input
                    id="voice-sample"
                    type="file"
                    accept="audio/wav,audio/mpeg,audio/mp3,.wav,.mp3"
                    onChange={(e) => setSampleFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
              {sampleFile && (
                <p className="text-xs text-muted-foreground">
                  Selected: {sampleFile.name} · {(sampleFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
              <Button onClick={handleUpload} disabled={!sampleFile || uploading}>
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload to library
              </Button>
            </div>
          )}
        </section>

        {/* STEP 2 — Generate */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold">2. Type text → generate audio</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Up to 5,000 characters. Active voice:{" "}
            <strong className="text-foreground">
              {activeVoice ? activeVoice.name : voices.length === 0 ? "none (VPS fallback)" : "—"}
            </strong>
          </p>

          <div className="mb-3 flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={language === "bn" ? "default" : "outline"}
              onClick={() => setLanguage("bn")}
            >
              বাংলা
            </Button>
            <Button
              type="button"
              size="sm"
              variant={language === "en" ? "default" : "outline"}
              onClick={() => setLanguage("en")}
            >
              English
            </Button>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder={language === "bn" ? "এখানে লিখুন... এই text-টা আপনার voice-এ generate হবে।" : "Type here... this text will be spoken in your voice."}
            className="mb-3"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleGenerate} disabled={generating || !text.trim()}>
              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generate voice
            </Button>
            <span className="text-xs text-muted-foreground">
              {text.length} / 5000
            </span>
          </div>
        </section>

        {/* STEP 3 — Output */}
        {audioUrl && (
          <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">3. Output</h2>
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              className="w-full"
              preload="auto"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={audioUrl} download={`voice-${Date.now()}.wav`}>
                  <Download className="mr-2 h-4 w-4" /> Download .wav
                </a>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => audioRef.current?.play()}>
                <Play className="mr-2 h-4 w-4" /> Play again
              </Button>
            </div>
          </section>
        )}

        <footer className="mt-10 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
          <strong className="text-foreground">Engine:</strong> XTTS-v2 self-hosted ·{" "}
          <strong className="text-foreground">Access:</strong> Founder only ·{" "}
          <strong className="text-foreground">Cost:</strong> ~৳1,000–1,500/mo VPS.
          <br />
          Server endpoint configured via <code>XTTS_ENDPOINT_URL</code> secret.
          Add an optional <code>XTTS_API_TOKEN</code> secret to protect the VPS.
        </footer>
      </div>
    </div>
  );
};

export default VoiceClone;