import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { navigablePages, preloadRoute, type PageType } from "@/lib/routes";
import { fuzzyMatch, highlight } from "@/lib/fuzzy";

type Scored = {
  page: (typeof navigablePages)[number];
  score: number;
  labelHits: number[];
  pathHits: number[];
};

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    requestAnimationFrame(() => navigate(path));
  };

  const grouped = useMemo(() => {
    const order: PageType[] = ["Main", "Brand", "Admin", "Account"];
    const scored: Scored[] = [];
    for (const page of navigablePages) {
      const labelM = fuzzyMatch(page.label, query);
      const pathM = fuzzyMatch(page.path, query);
      const kwM = fuzzyMatch(page.keywords ?? "", query);
      const typeM = fuzzyMatch(page.type, query);
      const best = [labelM, pathM, kwM, typeM].filter(Boolean) as {
        score: number;
        indices: number[];
      }[];
      if (query && best.length === 0) continue;
      const score =
        (labelM?.score ?? -Infinity) * 1.5 >
        Math.max(pathM?.score ?? -Infinity, kwM?.score ?? -Infinity, typeM?.score ?? -Infinity)
          ? (labelM?.score ?? 0) * 1.5
          : Math.max(
              pathM?.score ?? 0,
              kwM?.score ?? 0,
              typeM?.score ?? 0,
              labelM?.score ?? 0,
            );
      scored.push({
        page,
        score,
        labelHits: labelM?.indices ?? [],
        pathHits: pathM?.indices ?? [],
      });
    }
    if (query) scored.sort((a, b) => b.score - a.score);
    const map = new Map<PageType, Scored[]>();
    for (const s of scored) {
      const list = map.get(s.page.type) ?? [];
      list.push(s);
      map.set(s.page.type, list);
    }
    return order
      .filter((t) => map.has(t))
      .map((t) => ({ type: t, items: map.get(t)! }));
  }, [query]);

  const renderHighlighted = (text: string, hits: number[]) =>
    highlight(text, hits).map((p, i) =>
      p.hit ? (
        <mark
          key={i}
          className="bg-primary/25 text-primary rounded-[2px] px-0.5"
        >
          {p.text}
        </mark>
      ) : (
        <span key={i}>{p.text}</span>
      ),
    );

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      aria-label="Command palette: jump to a page"
      commandProps={{ shouldFilter: false, label: "Jump to page" }}
    >
      <CommandInput
        placeholder="Jump to page… (fuzzy: 'lva' → Luxe Veil Admin)"
        aria-label="Search pages"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList aria-label="Available pages">
        <CommandEmpty>No pages found.</CommandEmpty>
        {grouped.map((g, i) => (
          <div key={g.type}>
            {i > 0 && <CommandSeparator />}
            <CommandGroup heading={g.type}>
              {g.items.map(({ page, labelHits, pathHits }) => (
                <CommandItem
                  key={page.path}
                  value={page.path}
                  onSelect={() => go(page.path)}
                  onMouseEnter={() => preloadRoute(page.path)}
                  onFocus={() => preloadRoute(page.path)}
                  aria-label={`${page.label} — ${page.type} page at ${page.path}`}
                >
                  <span className="flex-1">
                    {renderHighlighted(page.label, labelHits)}
                  </span>
                  <CommandShortcut>
                    {renderHighlighted(page.path, pathHits)}
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
      <div
        className="border-t px-3 py-2 text-[11px] text-muted-foreground flex items-center justify-between"
        aria-hidden="true"
      >
        <span>
          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px]">↑</kbd>{" "}
          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px]">↓</kbd> navigate
          <span className="mx-2">·</span>
          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px]">↵</kbd> open
        </span>
        <span>
          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px]">Esc</kbd> close
        </span>
      </div>
    </CommandDialog>
  );
};

export default CommandPalette;
