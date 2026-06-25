import { useRef, useState } from "react";
import { Loader2, Upload, Wand2, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";

/**
 * Personal AI Voice — Founder-only standalone studio.
 * Flow:
 *   1. Upload 1–2 min voice sample → proxied to self-hosted XTTS-v2 /upload
 *   2. Type text (Bangla / English) → /generate
 *   3. Play + download the resulting audio
 */
const VoiceClone = () => {
  useSeo({
    title: "Personal AI Voice Studio — TrendFlux",
    description: "Founder-only voice cloning studio. Upload a sample, type any text, get audio in your voice.",
  });

  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const [sampleSaved, setSampleSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [voicePath, setVoicePath] = useState<string>("");

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
      const res = await fetch(`${fnUrl}?action=upload`, {
        method: "POST",
        headers,
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `Upload failed (${res.status})`);
      setSampleSaved(true);
      if (json.voice_path) setVoicePath(String(json.voice_path));
      toast.success("Voice sample saved on your XTTS server");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
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
          // Optional — if omitted, VPS falls back to latest file in voices/.
          ...(voicePath ? { voice_path: voicePath } : {}),
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
            Upload your voice once → type anything in Bangla or English → download
            audio in your own voice. Runs on your self-hosted XTTS-v2 server.
          </p>
        </header>

        {/* STEP 1 — Upload sample */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold">1. Upload voice sample</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Clean 1–2 minute recording (WAV or MP3). Quiet room, single speaker, no music.
          </p>
          <div className="space-y-3">
            <Label htmlFor="voice-sample" className="sr-only">Voice sample</Label>
            <Input
              id="voice-sample"
              type="file"
              accept="audio/wav,audio/mpeg,audio/mp3,.wav,.mp3"
              onChange={(e) => {
                setSampleFile(e.target.files?.[0] ?? null);
                setSampleSaved(false);
              }}
            />
            {sampleFile && (
              <p className="text-xs text-muted-foreground">
                Selected: {sampleFile.name} · {(sampleFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
            <Button onClick={handleUpload} disabled={!sampleFile || uploading}>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {sampleSaved ? "Replace voice sample" : "Save voice sample"}
            </Button>
            {sampleSaved && (
              <p className="text-xs text-emerald-600">✓ Saved on your XTTS server</p>
            )}
          </div>
        </section>

        {/* STEP 2 — Generate */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold">2. Type text → generate audio</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Up to 5,000 characters per generation.
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