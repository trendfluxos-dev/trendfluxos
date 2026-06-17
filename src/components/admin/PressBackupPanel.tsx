import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Upload, Loader2, Archive } from "lucide-react";
import type { PressItem } from "@/hooks/usePressItems";

type BackupRow = Pick<
  PressItem,
  "outlet" | "headline" | "href" | "context" | "sort_order" | "published"
>;

type BackupFile = {
  kind: "trendflux.press_items.backup";
  version: 1;
  exported_at: string;
  count: number;
  items: BackupRow[];
};

const FIELDS: (keyof BackupRow)[] = [
  "outlet",
  "headline",
  "href",
  "context",
  "sort_order",
  "published",
];

function sanitize(raw: unknown): BackupRow[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as BackupFile)?.items)
      ? (raw as BackupFile).items
      : [];
  return list
    .map((r) => {
      const row = r as Record<string, unknown>;
      const out: Partial<BackupRow> = {};
      for (const f of FIELDS) (out as Record<string, unknown>)[f] = row[f];
      return out as BackupRow;
    })
    .filter((r) => r.outlet && r.headline && r.href);
}

export default function PressBackupPanel({ onChanged }: { onChanged?: () => void }) {
  const [busy, setBusy] = useState<"idle" | "export" | "import">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = async () => {
    setBusy("export");
    try {
      const { data, error } = await supabase
        .from("press_items")
        .select("outlet, headline, href, context, sort_order, published")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      const items = (data ?? []) as BackupRow[];
      const payload: BackupFile = {
        kind: "trendflux.press_items.backup",
        version: 1,
        exported_at: new Date().toISOString(),
        count: items.length,
        items,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      a.href = url;
      a.download = `press-items-backup-${ts}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${items.length} item(s)`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy("idle");
    }
  };

  const handleFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    mode: "merge" | "replace",
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy("import");
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const rows = sanitize(parsed);
      if (rows.length === 0) {
        toast.error("No valid press items found in file");
        return;
      }
      const confirmMsg =
        mode === "replace"
          ? `Replace all current press items with ${rows.length} from backup? This deletes existing rows.`
          : `Import ${rows.length} item(s)? Existing rows with the same URL will be updated.`;
      if (!confirm(confirmMsg)) return;

      if (mode === "replace") {
        const { error: delErr } = await supabase
          .from("press_items")
          .delete()
          .not("id", "is", null);
        if (delErr) throw delErr;
        const { error: insErr } = await supabase.from("press_items").insert(rows);
        if (insErr) throw insErr;
      } else {
        const { error: upErr } = await supabase
          .from("press_items")
          .upsert(rows, { onConflict: "href" });
        if (upErr) throw upErr;
      }
      toast.success(
        mode === "replace"
          ? `Replaced with ${rows.length} item(s)`
          : `Imported ${rows.length} item(s)`,
      );
      onChanged?.();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy("idle");
    }
  };

  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");

  return (
    <section className="rounded-xl glass p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-foreground/5 p-2">
            <Archive className="h-4 w-4 text-foreground/70" />
          </div>
          <div>
            <h2 className="font-display text-sm font-semibold tracking-tight">
              Backup &amp; Restore
            </h2>
            <p className="mt-0.5 text-xs text-foreground/60">
              Download all press items as JSON, or restore from a previous backup file.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-border p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setImportMode("merge")}
              className={`rounded px-2 py-1 transition ${
                importMode === "merge"
                  ? "bg-foreground/10 text-foreground"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Merge
            </button>
            <button
              type="button"
              onClick={() => setImportMode("replace")}
              className={`rounded px-2 py-1 transition ${
                importMode === "replace"
                  ? "bg-foreground/10 text-foreground"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Replace all
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={busy !== "idle"}
          >
            {busy === "import" ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-1" />
            )}
            Import
          </Button>

          <Button size="sm" onClick={doExport} disabled={busy !== "idle"}>
            {busy === "export" ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            Export JSON
          </Button>

          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => handleFile(e, importMode)}
          />
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-foreground/50">
        <span className="font-medium text-foreground/70">Merge</span> updates rows that share the same URL and inserts new ones — existing items are preserved.
        <span className="ml-2 font-medium text-foreground/70">Replace all</span> deletes every current row first, then inserts the backup.
      </p>
    </section>
  );
}