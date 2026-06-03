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
import { rankWeights } from "@/lib/commandPaletteConfig";
import { onOpenCommandPalette } from "@/lib/commandPalette";

const EXAMPLE_QUERIES = [
  "dashboard",
  "admin",
  "CRM",
  "login",
  "wedding",
  "talent",
  "lva",
  "brand",
];

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
    const offEvent = onOpenCommandPalette(() => setOpen(true));
    return () => {
      window.removeEventListener("keydown", onKey);
      offEvent();
    };
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
      const matched = [labelM, pathM, kwM, typeM].some(Boolean);
      if (query && !matched) continue;
      const w = rankWeights;
      // Weighted sum so a strong label hit + supporting keyword hit
      // ranks higher than a single field match.
      const score =
        (labelM ? labelM.score * w.label : 0) +
        (kwM ? kwM.score * w.keywords : 0) +
        (typeM ? typeM.score * w.section : 0) +
        (pathM ? pathM.score * w.path : 0);
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
      <div
        className="flex flex-wrap items-center gap-1.5 border-b px-3 py-2"
        role="group"
        aria-label="Example queries"
      >
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1">
          Try
        </span>
        {EXAMPLE_QUERIES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setQuery(ex)}
            aria-label={`Fill query with ${ex}`}
            className={`rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
              query === ex
                ? "border-primary/60 bg-primary/15 text-primary"
                : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {ex}
          </button>
        ))}
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="ml-auto text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
          >
            Clear
          </button>
        )}
      </div>
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
