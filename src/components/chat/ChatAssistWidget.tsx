import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send, Plus, Trash2, Bot, User, CalendarCheck, Loader2, CheckCircle2, CalendarClock, ArrowRight } from "lucide-react";
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
  | { id: string; role: "assistant"; content: string; kind: "lead-success" }
  | { id: string; role: "assistant"; content: string; kind: "booking-cta" }
  | { id: string; role: "assistant"; content: string; kind: "booking-success" };
type Thread = { id: string; title: string; messages: Message[]; createdAt: number };

const BOOKING_URL = "/project-lead";

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

  const showBookingCta = useCallback(
    (opts?: { intro?: string }) => {
      if (!active) return;
      if (active.messages.some((m) => m.kind === "booking-cta")) return;
      const intro: Message | null = opts?.intro
        ? { id: uid(), role: "assistant", kind: "text", content: opts.intro }
        : null;
      const cta: Message = {
        id: uid(),
        role: "assistant",
        kind: "booking-cta",
        content: "Book a free 20-min strategy call with the TrendFlux team.",
      };
      setThreads((prev) =>
        prev.map((t) =>
          t.id === active.id
            ? { ...t, messages: [...t.messages, ...(intro ? [intro] : []), cta] }
            : t,
        ),
      );
    },
    [active],
  );

  // After the assistant finishes replying, auto-offer a strategy call once
  // the conversation has warmed up (2+ user turns) and no CTA/form is present.
  useEffect(() => {
    if (!active || status !== "idle") return;
    const userTurns = active.messages.filter((m) => m.role === "user").length;
    const lastMsg = active.messages[active.messages.length - 1];
    if (
      userTurns >= 2 &&
      lastMsg?.role === "assistant" &&
      (!lastMsg.kind || lastMsg.kind === "text") &&
      lastMsg.content.trim().length > 0 &&
      !active.messages.some((m) => m.kind === "booking-cta" || m.kind === "lead-form" || m.kind === "lead-success")
    ) {
      showBookingCta({
        intro: "If it'd help, you can book a free strategy call to go deeper 👇",
      });
    }
  }, [active, status, showBookingCta]);

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

    const historyForApi = [...active.messages, userMsg]
      .filter((m) => !m.kind || m.kind === "text")
      .map(({ role, content }) => ({ role, content }));

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
          "fixed z-[70] inline-flex items-center gap-2 rounded-full px-4 py-3",
          "[bottom:max(2.5rem,calc(env(safe-area-inset-bottom)+2.5rem))] [right:max(2.5rem,calc(env(safe-area-inset-right)+2.5rem))]",
          "sm:[bottom:max(3rem,calc(env(safe-area-inset-bottom)+3rem))] sm:[right:max(3.5rem,calc(env(safe-area-inset-right)+3.5rem))]",
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
                    onClick={() => showBookingCta()}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold bg-primary text-primary-foreground hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                    Book a call
                  </button>
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
                        "Book a strategy call",
                        "Tell me about Kormoshikkha",
                        "Do you work with enterprise clients?",
                      ].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            if (s === "Book a strategy call") {
                              showBookingCta();
                            } else {
                              setInput(s);
                              requestAnimationFrame(() => inputRef.current?.focus());
                            }
                          }}
                          className="text-xs px-2.5 py-1.5 rounded-full border border-border bg-muted/50 hover:bg-accent text-foreground/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={showLeadForm}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                      <CalendarCheck className="h-3.5 w-3.5" aria-hidden />
                      Talk to the team
                    </button>
                  </div>
                )}

                {active?.messages.map((m) => {
                  if (m.kind === "lead-form") {
                    return <LeadFormCard key={m.id} formId={m.id} onSubmit={submitLead} />;
                  }
                  if (m.kind === "lead-success") {
                    return <LeadSuccessCard key={m.id} content={m.content} />;
                  }
                  if (m.kind === "booking-cta") {
                    return (
                      <BookingSchedulerCard
                        key={m.id}
                        cardId={m.id}
                        content={m.content}
                        onBooked={(id, msg) => {
                          setThreads((prev) =>
                            prev.map((t) =>
                              t.id === active?.id
                                ? {
                                    ...t,
                                    messages: t.messages.map((x) =>
                                      x.id === id
                                        ? ({ ...x, kind: "booking-success", content: msg } as Message)
                                        : x,
                                    ),
                                  }
                                : t,
                            ),
                          );
                        }}
                      />
                    );
                  }
                  if (m.kind === "booking-success") {
                    return <LeadSuccessCard key={m.id} content={m.content} />;
                  }
                  return (
                    <MessageBubble
                      key={m.id}
                      role={m.role}
                      content={m.content}
                      pending={status === "streaming" && m.role === "assistant" && m.content === ""}
                    />
                  );
                })}

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

type LeadValues = { name: string; email: string; growthSystem: string; notes?: string };

function LeadFormCard({
  formId,
  onSubmit,
}: {
  formId: string;
  onSubmit: (id: string, v: LeadValues) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [values, setValues] = useState<LeadValues>({ name: "", email: "", growthSystem: "", notes: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof LeadValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (k: keyof LeadValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const parsed = leadSchema.safeParse(values);
    if (!parsed.success) {
      const fe: Partial<Record<keyof LeadValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof LeadValues;
        if (!fe[k]) fe[k] = issue.message;
      }
      setErrors(fe);
      return;
    }
    setSubmitting(true);
    const res = await onSubmit(formId, parsed.data as LeadValues);
    setSubmitting(false);
    if (!res.ok) setServerError(("error" in res && res.error) || "Couldn't submit. Please try again.");
  };

  return (
    <div className="flex gap-2 justify-start">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Bot className="h-3.5 w-3.5" aria-hidden />
      </span>
      <form
        onSubmit={submit}
        className="max-w-[85%] w-full rounded-2xl rounded-bl-sm border border-primary/25 bg-muted/60 p-3.5 space-y-3"
        aria-label="Lead capture form"
      >
        <div className="space-y-1">
          <label htmlFor={`${formId}-name`} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your name
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            required
            maxLength={120}
            autoComplete="name"
            value={values.name}
            onChange={set("name")}
            className="w-full rounded-md border border-border bg-background/80 px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            placeholder="Jane Doe"
            disabled={submitting}
          />
          {errors.name && <p className="text-[11px] text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor={`${formId}-email`} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Email
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            value={values.email}
            onChange={set("email")}
            className="w-full rounded-md border border-border bg-background/80 px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            placeholder="jane@company.com"
            disabled={submitting}
          />
          {errors.email && <p className="text-[11px] text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor={`${formId}-system`} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            What growth system do you need?
          </label>
          <select
            id={`${formId}-system`}
            required
            value={values.growthSystem}
            onChange={set("growthSystem")}
            className="w-full rounded-md border border-border bg-background/80 px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            disabled={submitting}
          >
            <option value="">Select an option…</option>
            {GROWTH_SYSTEMS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.growthSystem && <p className="text-[11px] text-destructive">{errors.growthSystem}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor={`${formId}-notes`} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Anything else? <span className="text-muted-foreground/60 normal-case">(optional)</span>
          </label>
          <textarea
            id={`${formId}-notes`}
            rows={2}
            maxLength={1000}
            value={values.notes}
            onChange={set("notes")}
            className="w-full resize-none rounded-md border border-border bg-background/80 px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            placeholder="Context, timeline, monthly revenue…"
            disabled={submitting}
          />
        </div>

        {serverError && (
          <p className="text-[11px] text-destructive" role="alert">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <CalendarCheck className="h-3.5 w-3.5" aria-hidden />}
          {submitting ? "Sending…" : "Send to the team"}
        </button>
        <p className="text-[10px] text-muted-foreground/70">
          We'll only use your email to reply about your inquiry.
        </p>
      </form>
    </div>
  );
}

function LeadSuccessCard({ content }: { content: string }) {
  return (
    <div className="flex gap-2 justify-start">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
      </span>
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-sm leading-relaxed text-foreground">
        {renderInline(content)}
      </div>
    </div>
  );
}

// Generate the next 5 weekday dates (skip Sat/Sun) starting tomorrow.
function nextWeekdays(count: number): Date[] {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  while (out.length < count) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) out.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

const TIME_SLOTS = ["10:00", "12:00", "14:00", "16:00", "18:00"];

function BookingSchedulerCard({
  cardId,
  content,
  onBooked,
}: {
  cardId: string;
  content: string;
  onBooked: (id: string, successMessage: string) => void;
}) {
  const dates = useMemo(() => nextWeekdays(5), []);
  const [dateIdx, setDateIdx] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!slot) return setErr("Pick a time slot.");
    if (name.trim().length < 1) return setErr("Enter your name.");
    const emailOk = z.string().email().safeParse(email.trim()).success;
    if (!emailOk) return setErr("Enter a valid email.");

    const chosen = new Date(dates[dateIdx]);
    const [hh, mm] = slot.split(":").map(Number);
    chosen.setHours(hh, mm, 0, 0);
    const iso = chosen.toISOString();
    const pretty = chosen.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    setSubmitting(true);
    const { error: dbError } = await supabase.from("growth_leads").insert({
      name: name.trim(),
      email: email.trim(),
      source: "chatbot-scheduler",
      message: `[Chatbot Strategy Call] Requested slot: ${pretty} (${iso})`,
    });
    setSubmitting(false);
    if (dbError) {
      setErr(dbError.message);
      return;
    }
    onBooked(
      cardId,
      `You're booked, ${name.trim()}! We'll email **${email.trim()}** to confirm your strategy call for **${pretty}**. Need to reschedule? [Manage it here](${BOOKING_URL}).`,
    );
  };

  return (
    <div className="flex gap-2 justify-start">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <CalendarClock className="h-3.5 w-3.5" aria-hidden />
      </span>
      <form
        onSubmit={submit}
        className="max-w-[92%] w-full rounded-2xl rounded-bl-sm border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-3.5 space-y-3"
        aria-label="Schedule a strategy call"
      >
        <p className="text-sm text-foreground leading-relaxed">{renderInline(content)}</p>
        <ul className="text-[11px] text-muted-foreground space-y-0.5">
          <li>• 20 minutes, no obligation</li>
          <li>• Tailored growth plan for your business</li>
        </ul>

        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pick a date</p>
          <div className="flex flex-wrap gap-1.5">
            {dates.map((d, i) => {
              const isSel = i === dateIdx;
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => setDateIdx(i)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    isSel
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background/70 text-foreground/80 hover:border-primary/50",
                  )}
                >
                  <div className="text-[9px] uppercase opacity-70">
                    {d.toLocaleDateString(undefined, { weekday: "short" })}
                  </div>
                  <div>{d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pick a time</p>
          <div className="flex flex-wrap gap-1.5">
            {TIME_SLOTS.map((t) => {
              const isSel = t === slot;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSlot(t)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    isSel
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background/70 text-foreground/80 hover:border-primary/50",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            required
            maxLength={120}
            placeholder="Your name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            className="rounded-md border border-border bg-background/80 px-2.5 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          />
          <input
            type="email"
            required
            maxLength={200}
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            className="rounded-md border border-border bg-background/80 px-2.5 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          />
        </div>

        {err && <p className="text-[11px] text-destructive" role="alert">{err}</p>}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <CalendarClock className="h-3.5 w-3.5" aria-hidden />
            )}
            {submitting ? "Booking…" : "Confirm strategy call"}
          </button>
          <a
            href={BOOKING_URL}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
          >
            Prefer a full form? <ArrowRight className="h-3 w-3" aria-hidden />
          </a>
        </div>
      </form>
    </div>
  );
}