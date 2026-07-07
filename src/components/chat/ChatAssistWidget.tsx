import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send, Plus, Trash2, Bot, User, CalendarCheck, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// TrendFlux visitor chat assistant.
// - Threaded conversations (in-memory only — resets on refresh)
// - Streams from the `chat-assist` Supabase Edge Function via SSE
// - Floating launcher, expandable panel with sidebar of threads

type Role = "user" | "assistant";
type Message =
  | { id: string; role: Role; content: string; kind?: "text" }
  | { id: string; role: "assistant"; content: string; kind: "lead-form" }
  | { id: string; role: "assistant"; content: string; kind: "lead-success" };
type Thread = { id: string; title: string; messages: Message[]; createdAt: number };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assist`;
const AUTH = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;

const GROWTH_SYSTEMS = [
  "AI Business Automation",
  "Meta Ads & Lead Generation",
  "Funnel & Landing Page Design",
  "CRM & WhatsApp Automation",
  "Content Strategy & Brand Storytelling",
  "Website & Digital Ecosystem Design",
  "Growth Analytics & Reporting",
  "Not sure yet — help me choose",
] as const;

const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  email: z.string().trim().email("Enter a valid email").max(200),
  growthSystem: z.string().min(1, "Pick what you need help with").max(200),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

const uid = () =>
  (globalThis.crypto?.randomUUID?.() ?? `id-${Math.random().toString(36).slice(2)}-${Date.now()}`);

function newThread(): Thread {
  return { id: uid(), title: "New chat", messages: [], createdAt: Date.now() };
}

function titleFromFirstMessage(text: string) {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > 40 ? `${t.slice(0, 40)}…` : t || "New chat";
}

export default function ChatAssistWidget() {
  const [open, setOpen] = useState(false);
  const [threads, setThreads] = useState<Thread[]>(() => [newThread()]);
  const [activeId, setActiveId] = useState<string>(() => "");
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "streaming">("idle");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelId = useId();

  // Init the first active thread
  useEffect(() => {
    setActiveId((prev) => prev || threads[0]?.id || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = useMemo(
    () => threads.find((t) => t.id === activeId) ?? threads[0],
    [threads, activeId],
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active?.messages, status, open]);

  // Focus composer when opened / thread switched
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, activeId]);

  const updateActive = useCallback(
    (updater: (t: Thread) => Thread) => {
      setThreads((prev) => prev.map((t) => (t.id === activeId ? updater(t) : t)));
    },
    [activeId],
  );

  const createThread = () => {
    abortRef.current?.abort();
    const t = newThread();
    setThreads((prev) => [t, ...prev]);
    setActiveId(t.id);
    setInput("");
    setError(null);
    setStatus("idle");
  };

  const showLeadForm = useCallback(() => {
    if (!active) return;
    // Avoid stacking multiple open forms
    if (active.messages.some((m) => m.kind === "lead-form")) return;
    const intro: Message = {
      id: uid(),
      role: "assistant",
      kind: "text",
      content:
        "Great — share a few details and the TrendFlux team will reach out. This takes ~30 seconds.",
    };
    const form: Message = {
      id: uid(),
      role: "assistant",
      kind: "lead-form",
      content: "",
    };
    setThreads((prev) =>
      prev.map((t) =>
        t.id === active.id ? { ...t, messages: [...t.messages, intro, form] } : t,
      ),
    );
  }, [active]);

  const submitLead = useCallback(
    async (
      formId: string,
      values: { name: string; email: string; growthSystem: string; notes?: string },
    ) => {
      if (!active) return { ok: false as const, error: "No active chat." };
      const { error: dbError } = await supabase.from("growth_leads").insert({
        name: values.name,
        email: values.email,
        source: "trendflux-contact",
        message: `[Chatbot] Needs: ${values.growthSystem}${values.notes ? `\n\nNotes: ${values.notes}` : ""}`,
      });
      if (dbError) return { ok: false as const, error: dbError.message };

      // Replace form with a success card + a follow-up assistant note
      setThreads((prev) =>
        prev.map((t) =>
          t.id === active.id
            ? {
                ...t,
                messages: [
                  ...t.messages.map((m) =>
                    m.id === formId
                      ? ({
                          ...m,
                          kind: "lead-success",
                          content: `Thanks, ${values.name}! The TrendFlux team will reach out to ${values.email} shortly about **${values.growthSystem}**. In the meantime you can [book a strategy call](/project-lead) directly.`,
                        } as Message)
                      : m,
                  ),
                ],
              }
            : t,
        ),
      );
      return { ok: true as const };
    },
    [active],
  );

  const deleteThread = (id: string) => {
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (next.length === 0) {
        const fresh = newThread();
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  const send = async () => {
    const text = input.trim();
    if (!text || status !== "idle" || !active) return;
    setError(null);

    const userMsg: Message = { id: uid(), role: "user", content: text };
    const assistantMsg: Message = { id: uid(), role: "assistant", content: "" };

    // Optimistic: push user + empty assistant, update title if first message
    setThreads((prev) =>
      prev.map((t) =>
        t.id === active.id
          ? {
              ...t,
              title: t.messages.length === 0 ? titleFromFirstMessage(text) : t.title,
              messages: [...t.messages, userMsg, assistantMsg],
            }
          : t,
      ),
    );
    setInput("");
    setStatus("sending");

    const historyForApi = [...active.messages, userMsg].map(({ role, content }) => ({ role, content }));

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: AUTH,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages: historyForApi }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        let msg = "The assistant is unavailable right now.";
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch { /* noop */ }
        throw new Error(msg);
      }
      if (!res.body) throw new Error("No response body");

      setStatus("streaming");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      // Parse OpenAI-style SSE: lines beginning with "data: {json}"
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n");
        buffer = parts.pop() ?? "";
        for (const raw of parts) {
          const line = raw.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta: string | undefined = json?.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              const snapshot = assistantText;
              setThreads((prev) =>
                prev.map((t) =>
                  t.id === active.id
                    ? {
                        ...t,
                        messages: t.messages.map((m) =>
                          m.id === assistantMsg.id ? { ...m, content: snapshot } : m,
                        ),
                      }
                    : t,
                ),
              );
            }
          } catch { /* ignore partial */ }
        }
      }

      if (!assistantText) {
        setThreads((prev) =>
          prev.map((t) =>
            t.id === active.id
              ? {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: "I couldn't produce a reply. Please try again." }
                      : m,
                  ),
                }
              : t,
          ),
        );
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      // Remove the empty assistant placeholder on failure
      setThreads((prev) =>
        prev.map((t) =>
          t.id === active.id
            ? { ...t, messages: t.messages.filter((m) => m.id !== assistantMsg.id) }
            : t,
        ),
      );
    } finally {
      setStatus("idle");
      abortRef.current = null;
      // Refocus composer after send
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        aria-label={open ? "Close TrendFlux assistant" : "Open TrendFlux assistant"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-5 right-5 z-[70] inline-flex items-center gap-2 rounded-full px-4 py-3",
          "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
          "hover:brightness-110 active:scale-95 transition",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <MessageCircle className="h-5 w-5" aria-hidden />}
        <span className="text-sm font-semibold hidden sm:inline">
          {open ? "Close" : "Ask TrendFlux"}
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="TrendFlux assistant"
          className={cn(
            "fixed z-[69] bg-background border border-border/70 shadow-2xl overflow-hidden",
            // Mobile: near full-screen sheet from bottom
            "inset-x-3 bottom-20 top-16 rounded-2xl",
            // Desktop: floating panel bottom-right
            "sm:inset-auto sm:right-5 sm:bottom-20 sm:top-auto sm:left-auto sm:w-[720px] sm:h-[560px] sm:rounded-2xl",
          )}
        >
          <div className="flex h-full">
            {/* Threads sidebar */}
            <aside className="hidden sm:flex flex-col w-52 border-r border-border/60 bg-muted/30">
              <div className="p-3 border-b border-border/60 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Chats</span>
                <button
                  type="button"
                  onClick={createThread}
                  aria-label="New chat"
                  className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <ul className="flex-1 overflow-y-auto p-2 space-y-1">
                {threads.map((t) => {
                  const isActive = t.id === activeId;
                  return (
                    <li key={t.id} className="group">
                      <div
                        className={cn(
                          "flex items-center gap-1 rounded-md text-sm",
                          isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/60 text-foreground/80",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveId(t.id)}
                          className="flex-1 min-w-0 text-left px-2 py-1.5 truncate focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-md"
                          title={t.title}
                        >
                          {t.title || "New chat"}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteThread(t.id)}
                          aria-label={`Delete chat ${t.title}`}
                          className="opacity-0 group-hover:opacity-100 p-1 mr-1 rounded text-muted-foreground hover:text-destructive focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="p-2 text-[10px] text-muted-foreground/70 border-t border-border/60">
                Chats reset when you refresh.
              </p>
            </aside>

            {/* Conversation */}
            <section className="flex-1 min-w-0 flex flex-col">
              <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Bot className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-foreground truncate">TrendFlux Assistant</h2>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Ask about brands, services, or how to work with us.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={showLeadForm}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold bg-primary/15 text-primary hover:bg-primary/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    <CalendarCheck className="h-3.5 w-3.5" aria-hidden />
                    Talk to us
                  </button>
                  <button
                    type="button"
                    onClick={createThread}
                    className="sm:hidden inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs bg-accent/60 hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    aria-label="New chat"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden /> New
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </header>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
                aria-live="polite"
              >
                {active && active.messages.length === 0 && (
                  <div className="mt-2 space-y-3">
                    <p className="text-sm text-foreground/80">
                      Hi 👋 I'm the TrendFlux assistant. Ask me anything about the ecosystem, the brands, or how to
                      collaborate with the team.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "What brands are in the TrendFlux ecosystem?",
                        "How do I book a strategy call?",
                        "Tell me about Kormoshikkha",
                        "Do you work with enterprise clients?",
                      ].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setInput(s);
                            requestAnimationFrame(() => inputRef.current?.focus());
                          }}
                          className="text-xs px-2.5 py-1.5 rounded-full border border-border bg-muted/50 hover:bg-accent text-foreground/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {active?.messages.map((m) => (
                  <MessageBubble key={m.id} role={m.role} content={m.content} pending={status === "streaming" && m.role === "assistant" && m.content === ""} />
                ))}

                {status === "sending" && (
                  <p className="text-xs text-muted-foreground italic">Thinking…</p>
                )}
                {error && (
                  <p className="text-xs text-destructive" role="alert">{error}</p>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void send();
                }}
                className="p-3 border-t border-border/60 bg-background"
              >
                <div className="flex items-end gap-2 rounded-xl border border-border bg-muted/40 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 px-3 py-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={1}
                    placeholder="Ask about brands, services, partnerships…"
                    className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none max-h-32"
                    disabled={status !== "idle"}
                    aria-label="Message TrendFlux assistant"
                  />
                  <button
                    type="submit"
                    disabled={status !== "idle" || input.trim().length === 0}
                    aria-label="Send message"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    <Send className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground/70">
                  Responses are AI-generated. Verify important details before acting.
                </p>
              </form>
            </section>
          </div>
        </div>
      )}
    </>
  );
}

function MessageBubble({ role, content, pending }: { role: Role; content: string; pending?: boolean }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Bot className="h-3.5 w-3.5" aria-hidden />
        </span>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted/60 text-foreground rounded-bl-sm",
        )}
      >
        {pending ? <span className="opacity-70">…</span> : renderInline(content)}
      </div>
      {isUser && (
        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
          <User className="h-3.5 w-3.5" aria-hidden />
        </span>
      )}
    </div>
  );
}

// Minimal markdown-lite: turn [text](url) links into anchors, keep the rest as text.
function renderInline(text: string) {
  const nodes: (string | JSX.Element)[] = [];
  const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const external = /^https?:/.test(m[2]);
    nodes.push(
      <a
        key={`l-${i++}`}
        href={m[2]}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="underline underline-offset-2 hover:text-primary"
      >
        {m[1]}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}