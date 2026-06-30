import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TfSection } from "@/components/tf/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSeo } from "@/hooks/useSeo";
import { Calendar, Send, Trash2, Sparkles, Loader2 } from "lucide-react";

type Status = "draft" | "queued" | "published" | "failed";
type ContentType = "post" | "reel" | "email" | "lesson" | "thread" | "newsletter";
type Channel = "instagram" | "facebook" | "linkedin" | "x" | "youtube" | "email" | "edtech" | "blog";

interface ContentItem {
  id: string;
  owner_id: string;
  title: string;
  body: string | null;
  content_type: ContentType;
  channel: Channel;
  status: Status;
  asset_url: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  n8n_pushed: boolean;
  created_at: string;
}

const STATUS_TONE: Record<Status, string> = {
  draft:     "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  queued:    "bg-amber-500/15 text-amber-300 border-amber-500/30",
  published: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  failed:    "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

const CONTENT_TYPES: ContentType[] = ["post", "reel", "email", "lesson", "thread", "newsletter"];
const CHANNELS: Channel[] = ["instagram", "facebook", "linkedin", "x", "youtube", "email", "edtech", "blog"];

export default function CreatorStudio() {
  useSeo({
    title: "Creator Studio — TrendFlux Digital",
    description: "Plan, queue, and publish content across every TrendFlux channel via n8n.",
  });

  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Composer state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [contentType, setContentType] = useState<ContentType>("post");
  const [channel, setChannel] = useState<Channel>("instagram");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [assetUrl, setAssetUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("creator_content")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load queue", { description: error.message });
    setItems((data ?? []) as ContentItem[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => ({
    draft:     items.filter(i => i.status === "draft"),
    queued:    items.filter(i => i.status === "queued"),
    published: items.filter(i => i.status === "published"),
    failed:    items.filter(i => i.status === "failed"),
  }), [items]);

  const resetComposer = () => {
    setTitle(""); setBody(""); setContentType("post");
    setChannel("instagram"); setScheduledAt(""); setAssetUrl("");
  };

  const createDraft = async () => {
    if (!title.trim()) {
      toast.error("Title required");
      return;
    }
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      toast.error("Sign in required");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("creator_content").insert({
      owner_id: auth.user.id,
      title: title.trim().slice(0, 200),
      body: body.trim() || null,
      content_type: contentType,
      channel,
      asset_url: assetUrl.trim() || null,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      status: "draft",
    });
    setSaving(false);
    if (error) {
      toast.error("Save failed", { description: error.message });
      return;
    }
    toast.success("Draft saved");
    resetComposer();
    load();
  };

  const pushTo = async (item: ContentItem, mode: "queue" | "publish") => {
    setBusyId(item.id);
    const { data, error } = await supabase.functions.invoke("creator-publish", {
      body: { id: item.id, mode },
    });
    setBusyId(null);
    if (error) {
      toast.error(`${mode === "publish" ? "Publish" : "Queue"} failed`, { description: error.message });
      return;
    }
    const cfg = (data as { webhook_configured?: boolean })?.webhook_configured;
    toast.success(
      mode === "publish" ? "Published" : "Queued for n8n",
      { description: cfg ? "Forwarded to n8n webhook." : "n8n webhook not configured — set N8N_WEBHOOK_URL to enable forwarding." },
    );
    load();
  };

  const remove = async (item: ContentItem) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    const { error } = await supabase.from("creator_content").delete().eq("id", item.id);
    if (error) {
      toast.error("Delete failed", { description: error.message });
      return;
    }
    toast.success("Deleted");
    load();
  };

  const aiAssist = () => {
    if (!title.trim()) {
      toast.error("Add a title first to seed the outline");
      return;
    }
    const outline = [
      `Hook: ${title.trim()} — open with a question or contrarian claim.`,
      "Insight: one specific data point or builder lesson.",
      "Story: 2–3 sentences from a real TrendFlux engagement.",
      "Proof: a metric, screenshot, or testimonial.",
      "CTA: invite to /growth-os, /edtech, or DM Zahid.",
    ].join("\n\n");
    setBody(prev => prev ? `${prev}\n\n---\n\n${outline}` : outline);
    toast.success("Outline inserted");
  };

  return (
    <main className="min-h-dvh bg-background">
      <TfSection>
        <div className="mx-auto max-w-7xl px-4 py-10">
          <header className="mb-8">
            <Badge className="mb-3 border-amber-500/30 bg-amber-500/10 text-amber-300">Creator Studio</Badge>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Content queue & publishing hub</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Draft, schedule, and push content across every TrendFlux channel. Items marked
              <em className="px-1">Queue</em> or <em className="px-1">Publish</em> are forwarded
              to your n8n workflow for actual distribution.
            </p>
          </header>

          {/* KPI strip */}
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {(["draft","queued","published","failed"] as Status[]).map(s => (
              <Card key={s}>
                <CardContent className="p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{s}</div>
                  <div className="mt-1 text-2xl font-semibold">{grouped[s].length}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            {/* Composer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  New content
                  <Button size="sm" variant="ghost" onClick={aiAssist}>
                    <Sparkles className="mr-1.5 h-4 w-4" />
                    AI outline
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Title (internal)"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={200}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={contentType} onValueChange={v => setContentType(v as ContentType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={channel} onValueChange={v => setChannel(v as Channel)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CHANNELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  rows={8}
                  placeholder="Body / caption / lesson outline…"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                />
                <Input
                  placeholder="Asset URL (image, video, PDF) — optional"
                  value={assetUrl}
                  onChange={e => setAssetUrl(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={createDraft} disabled={saving} className="flex-1">
                    {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                    Save draft
                  </Button>
                  <Button variant="outline" onClick={resetComposer} disabled={saving}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Queue */}
            <Card>
              <CardHeader>
                <CardTitle>Queue</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex h-40 items-center justify-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No content yet. Draft something on the left.</p>
                ) : (
                  <ul className="space-y-3">
                    {items.map(item => (
                      <li key={item.id} className="rounded-lg border border-border/60 bg-card/50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="truncate font-medium">{item.title}</span>
                              <Badge variant="outline" className={STATUS_TONE[item.status]}>{item.status}</Badge>
                              <Badge variant="outline">{item.content_type}</Badge>
                              <Badge variant="outline">{item.channel}</Badge>
                              {item.n8n_pushed && <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-300">n8n ✓</Badge>}
                            </div>
                            {item.body && (
                              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.body}</p>
                            )}
                            <div className="mt-1 text-xs text-muted-foreground">
                              {item.scheduled_at ? `Scheduled ${new Date(item.scheduled_at).toLocaleString()}` : "Unscheduled"}
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => pushTo(item, "queue")}
                              disabled={busyId === item.id || item.status === "published"}
                            >
                              Queue
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => pushTo(item, "publish")}
                              disabled={busyId === item.id || item.status === "published"}
                            >
                              {busyId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => remove(item)}
                              disabled={busyId === item.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </TfSection>
    </main>
  );
}