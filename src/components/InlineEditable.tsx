import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { Pencil, Check, RotateCcw } from "lucide-react";

/**
 * Lightweight on-page inline text editor.
 *
 * - Wrap a region in <InlineEditProvider scope="..."> and drop a
 *   <InlineEditToggle /> somewhere to flip into edit mode.
 * - Replace plain text nodes with <EditableText id="..." defaultText="..." />.
 * - Edits are persisted in localStorage under `inline-edit:<scope>:<id>`,
 *   so wording can be tweaked without touching code or redeploying.
 */

type Ctx = {
  scope: string;
  editing: boolean;
  setEditing: (v: boolean) => void;
  get: (id: string, fallback: string) => string;
  set: (id: string, value: string) => void;
  reset: (id: string) => void;
  resetAll: () => void;
  version: number;
};

const InlineEditCtx = createContext<Ctx | null>(null);

const storageKey = (scope: string, id: string) => `inline-edit:${scope}:${id}`;

export function InlineEditProvider({
  scope,
  children,
}: {
  scope: string;
  children: ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [version, setVersion] = useState(0);

  const get = useCallback(
    (id: string, fallback: string) => {
      try {
        const v = localStorage.getItem(storageKey(scope, id));
        return v ?? fallback;
      } catch {
        return fallback;
      }
    },
    [scope],
  );

  const set = useCallback(
    (id: string, value: string) => {
      try {
        localStorage.setItem(storageKey(scope, id), value);
      } catch {
        /* noop */
      }
      setVersion((v) => v + 1);
    },
    [scope],
  );

  const reset = useCallback(
    (id: string) => {
      try {
        localStorage.removeItem(storageKey(scope, id));
      } catch {
        /* noop */
      }
      setVersion((v) => v + 1);
    },
    [scope],
  );

  const resetAll = useCallback(() => {
    try {
      const toDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(`inline-edit:${scope}:`)) toDelete.push(k);
      }
      toDelete.forEach((k) => localStorage.removeItem(k));
    } catch {
      /* noop */
    }
    setVersion((v) => v + 1);
  }, [scope]);

  return (
    <InlineEditCtx.Provider
      value={{ scope, editing, setEditing, get, set, reset, resetAll, version }}
    >
      {children}
    </InlineEditCtx.Provider>
  );
}

export function useInlineEdit() {
  const ctx = useContext(InlineEditCtx);
  if (!ctx)
    throw new Error("useInlineEdit must be used inside <InlineEditProvider>");
  return ctx;
}

type EditableTextProps = {
  id: string;
  defaultText: string;
  as?: ElementType;
  className?: string;
  lang?: string;
  multiline?: boolean;
  /** Optional wrapper that receives the rendered text node (e.g. quote marks). */
  wrap?: (text: string) => ReactNode;
};

export function EditableText({
  id,
  defaultText,
  as,
  className,
  lang,
  multiline = false,
  wrap,
}: EditableTextProps) {
  const Tag = (as ?? "span") as ElementType;
  const { editing, get, set, version } = useInlineEdit();
  const value = get(id, defaultText);
  const ref = useRef<HTMLElement>(null);

  // Keep DOM in sync when value changes externally (reset, etc.)
  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value, version, editing]);

  const handleBlur = () => {
    const next = ref.current?.innerText?.replace(/\u00a0/g, " ").trim() ?? "";
    if (next && next !== value) set(id, next);
    else if (!next) {
      // Empty: restore current value
      if (ref.current) ref.current.innerText = value;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
    if (e.key === "Escape") {
      if (ref.current) ref.current.innerText = value;
      (e.target as HTMLElement).blur();
    }
  };

  if (editing) {
    return (
      <Tag
        ref={ref as React.Ref<HTMLElement>}
        className={`${className ?? ""} outline-none ring-1 ring-amber-400/70 ring-offset-2 ring-offset-black/60 rounded-sm cursor-text`}
        lang={lang}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        data-inline-edit-id={id}
      >
        {value}
      </Tag>
    );
  }

  return (
    <Tag className={className} lang={lang}>
      {wrap ? wrap(value) : value}
    </Tag>
  );
}

/** Floating control to toggle edit mode and reset overrides. */
export function InlineEditToggle({
  className = "",
  label = "Edit text",
}: {
  className?: string;
  label?: string;
}) {
  const { editing, setEditing, resetAll } = useInlineEdit();

  return (
    <div
      className={`pointer-events-auto z-20 flex items-center gap-2 ${className}`}
    >
      <button
        type="button"
        onClick={() => setEditing(!editing)}
        className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-serif text-[10px] uppercase tracking-[0.28em] backdrop-blur transition ${
          editing
            ? "border-amber-400/80 bg-amber-400/90 text-black"
            : "border-amber-400/40 bg-black/60 text-amber-200/90 hover:bg-amber-400/15"
        }`}
        aria-pressed={editing}
        title={editing ? "Click to save & exit edit mode" : label}
      >
        {editing ? <Check className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
        {editing ? "Done" : label}
      </button>
      {editing && (
        <button
          type="button"
          onClick={() => {
            if (confirm("Reset all edited text in this section to defaults?"))
              resetAll();
          }}
          className="inline-flex items-center gap-1.5 rounded-sm border border-white/20 bg-black/60 px-2.5 py-1 font-serif text-[10px] uppercase tracking-[0.28em] text-white/80 backdrop-blur transition hover:bg-white/10"
          title="Reset to defaults"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      )}
    </div>
  );
}
