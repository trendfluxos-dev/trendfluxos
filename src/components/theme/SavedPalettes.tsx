import { useCallback, useEffect, useState } from "react";
import { BookmarkPlus, Check, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  deleteSavedPalette,
  getFontPair,
  hslCss,
  onSavedPalettesChange,
  readSavedPalettes,
  renameSavedPalette,
  savePalette,
  type SavedPalette,
  type ThemeConfig,
} from "@/lib/themeStudio";

interface Props {
  config: ThemeConfig;
  onApply: (config: ThemeConfig) => void;
}

const sameTheme = (a: ThemeConfig, b: ThemeConfig) =>
  a.primary.h === b.primary.h &&
  a.primary.s === b.primary.s &&
  a.primary.l === b.primary.l &&
  a.radius === b.radius &&
  a.fontPairId === b.fontPairId &&
  a.mode === b.mode;

/**
 * Saved palettes library. Visitors can bookmark any generated or hand-tuned
 * theme and re-apply it later; everything stays in this browser.
 */
export default function SavedPalettes({ config, onApply }: Props) {
  const [items, setItems] = useState<SavedPalette[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    setItems(readSavedPalettes());
    return onSavedPalettesChange(() => setItems(readSavedPalettes()));
  }, []);

  const save = useCallback(() => {
    const label = name.trim() || `Palette ${items.length + 1}`;
    setItems(savePalette(label, config));
    setName("");
    toast.success(`"${label}" saved`);
  }, [config, items.length, name]);

  const commitRename = useCallback(
    (id: string) => {
      setItems(renameSavedPalette(id, editingName));
      setEditingId(null);
    },
    [editingName],
  );

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border/60 bg-card/40 p-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
          Save current theme
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="tfx-palette-name">
            Palette name
          </label>
          <input
            id="tfx-palette-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") save();
            }}
            maxLength={48}
            placeholder="Name this palette"
            className="min-w-0 flex-1 rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-[12px] text-foreground placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="button"
            onClick={save}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground transition-opacity hover:bg-primary/90"
          >
            <BookmarkPlus className="h-3.5 w-3.5" /> Save
          </button>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-foreground/60">
          Stores colour, typography, radius and mode together so you can switch looks any time.
        </p>
      </section>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/60 px-4 py-6 text-center text-[12px] text-foreground/55">
          No saved palettes yet. Generate one with AI or tune the sliders, then save it here.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const active = sameTheme(item.config, config);
            const pair = getFontPair(item.config.fontPairId);
            const isEditing = editingId === item.id;
            return (
              <li
                key={item.id}
                className={cn(
                  "rounded-2xl border transition-colors",
                  active ? "border-primary bg-primary/10" : "border-border/60 bg-card/40",
                )}
              >
                <div className="flex items-center gap-2 p-2 sm:p-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onApply(item.config);
                      toast.success(`${item.name} applied`);
                    }}
                    aria-pressed={active}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1.5 py-1 text-left"
                  >
                    <span
                      className="h-9 w-9 shrink-0 rounded-full ring-1 ring-inset ring-foreground/10"
                      style={{ background: hslCss(item.config.primary) }}
                    />
                    <span className="min-w-0">
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editingName}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => setEditingName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") commitRename(item.id);
                            if (event.key === "Escape") setEditingId(null);
                          }}
                          maxLength={48}
                          aria-label="Rename palette"
                          className="w-full rounded-lg border border-border/60 bg-background/70 px-2 py-1 text-[12px]"
                        />
                      ) : (
                        <span className="block truncate text-[12px] font-semibold">{item.name}</span>
                      )}
                      <span className="block truncate text-[10px] text-foreground/55">
                        {item.config.mode} · {pair.label} · {item.config.radius}rem
                      </span>
                    </span>
                    {active && !isEditing && (
                      <Check className="ml-auto h-4 w-4 shrink-0 text-primary" />
                    )}
                  </button>

                  <div className="flex shrink-0 items-center gap-1">
                    {isEditing ? (
                      <>
                        <IconButton label="Save name" onClick={() => commitRename(item.id)}>
                          <Check className="h-4 w-4" />
                        </IconButton>
                        <IconButton label="Cancel rename" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton
                          label={`Rename ${item.name}`}
                          onClick={() => {
                            setEditingId(item.id);
                            setEditingName(item.name);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          label={`Delete ${item.name}`}
                          onClick={() => {
                            setItems(deleteSavedPalette(item.id));
                            toast.success(`"${item.name}" removed`);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const IconButton = ({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/55 transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    {children}
  </button>
);
