import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Preset = "explain" | "examples" | "quiz" | "summary" | "answer";

const PRESETS: { id: Preset; label: string }[] = [
  { id: "explain", label: "Explain" },
  { id: "examples", label: "Examples" },
  { id: "quiz", label: "Quiz" },
  { id: "summary", label: "Summary" },
  { id: "answer", label: "Answer" },
];

/**
 * Teacher-only AI helper. Output stays local — never broadcast to viewers.
 */
const StudioAiPanel = () => {
  const [tab, setTab] = useState<"notes" | "ai" | "web">("notes");
  const [preset, setPreset] = useState<Preset>("explain");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState("");

  const run = async () => {
    if (!input.trim()) return;
    setBusy(true);
    setOutput("");
    try {
      const { data, error } = await supabase.functions.invoke("studio-ai", {
        body: { preset, input },
      });
      if (error) throw error;
      const text = (data as { text?: string; error?: string })?.text;
      if (!text) throw new Error((data as { error?: string })?.error ?? "No response");
      setOutput(text);
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message ?? "AI request failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border/60 bg-card/40 p-5">
      <div className="mb-3 grid grid-cols-3 gap-1 rounded-full border border-border/60 bg-background/60 p-1 text-[11px]">
        {(["notes", "ai", "web"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              "rounded-full px-2 py-1.5 font-semibold transition-colors",
              tab === t ? "bg-primary text-primary-foreground" : "text-foreground/65 hover:text-foreground",
            ].join(" ")}
          >
            {t === "notes" ? "Private notes" : t === "ai" ? "AI assistant" : "Quick search"}
          </button>
        ))}
      </div>

      {tab === "ai" && (
        <>
          <div className="mb-2 flex flex-wrap gap-1">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                className={[
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                  preset === p.id
                    ? "bg-primary/15 text-primary"
                    : "border border-border/60 bg-background/60 text-foreground/65 hover:text-foreground",
                ].join(" ")}
              >
                {p.label}
              </button>
            ))}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            placeholder="Topic বা student question লিখুন…"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px]"
          />
          <button
            type="button"
            onClick={run}
            disabled={busy || !input.trim()}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" /> Generate
              </>
            )}
          </button>
          {output && (
            <div className="mt-3 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border/60 bg-background/60 p-3 text-[12.5px] leading-[1.65]">
              {output}
            </div>
          )}
          <p className="mt-2 text-[10px] text-foreground/50">
            🔒 Output is private to you — never broadcast to viewers.
          </p>
        </>
      )}

      {tab === "notes" && (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={10}
          placeholder="Private notes…"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px]"
        />
      )}

      {tab === "web" && (
        <p className="text-[12px] text-foreground/60">
          Web search panel coming in Phase 2.
        </p>
      )}
    </div>
  );
};

export default StudioAiPanel;