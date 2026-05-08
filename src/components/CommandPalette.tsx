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

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
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

  const go = (path: string) => {
    setOpen(false);
    // Defer navigation so the dialog can restore focus cleanly first
    requestAnimationFrame(() => navigate(path));
  };

  const groups = useMemo(() => {
    const order: PageType[] = ["Main", "Brand", "Admin", "Account"];
    const map = new Map<PageType, typeof navigablePages>();
    for (const p of navigablePages) {
      const list = map.get(p.type) ?? [];
      list.push(p);
      map.set(p.type, list);
    }
    return order
      .filter((t) => map.has(t))
      .map((t) => ({ type: t, items: map.get(t)! }));
  }, []);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      aria-label="Command palette: jump to a page"
    >
      <CommandInput
        placeholder="Jump to page… (type a name or section)"
        aria-label="Search pages"
      />
      <CommandList aria-label="Available pages">
        <CommandEmpty>No pages found.</CommandEmpty>
        {groups.map((g, i) => (
          <div key={g.type}>
            {i > 0 && <CommandSeparator />}
            <CommandGroup heading={g.type}>
              {g.items.map((p) => (
                <CommandItem
                  key={p.path}
                  value={`${p.label} ${p.path} ${p.type} ${p.keywords ?? ""}`}
                  onSelect={() => go(p.path)}
                  onMouseEnter={() => preloadRoute(p.path)}
                  onFocus={() => preloadRoute(p.path)}
                  aria-label={`${p.label} — ${p.type} page at ${p.path}`}
                >
                  <span className="flex-1">{p.label}</span>
                  <CommandShortcut>{p.path}</CommandShortcut>
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