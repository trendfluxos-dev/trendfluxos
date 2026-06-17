import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
  Sparkles,
  Copy,
  ExternalLink,
  Loader2,
} from "lucide-react";

export type SharePayload = {
  title: string;
  summary: string;
  url: string;
  category?: string;
  tags?: string[];
  videoUrl?: string; // unlocks YouTube tab
};

type Platform = "facebook" | "linkedin" | "youtube" | "twitter";

const TAB_META: Record<Platform, { label: string; icon: typeof Facebook; brand: string }> = {
  facebook: { label: "Facebook", icon: Facebook, brand: "text-[#1877F2]" },
  linkedin: { label: "LinkedIn", icon: Linkedin, brand: "text-[#0A66C2]" },
  youtube: { label: "YouTube", icon: Youtube, brand: "text-[#FF0000]" },
  twitter: { label: "X", icon: Twitter, brand: "text-foreground" },
};

const buildShareUrl = (platform: Platform, payload: SharePayload, caption: string): string | null => {
  const url = encodeURIComponent(payload.url);
  const text = encodeURIComponent(caption.slice(0, 1000));
  switch (platform) {
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    case "youtube":
      // YouTube has no native share-intent URL — open Studio upload page
      return payload.videoUrl ?? "https://studio.youtube.com/";
  }
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: SharePayload | null;
};

const ShareDialog = ({ open, onOpenChange, payload }: Props) => {
  const [platform, setPlatform] = useState<Platform>("facebook");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const hasVideo = !!payload?.videoUrl;

  const generate = async (p: Platform, payloadArg: SharePayload) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-share-caption", {
        body: {
          platform: p,
          title: payloadArg.title,
          summary: payloadArg.summary,
          url: payloadArg.url,
          category: payloadArg.category,
          tags: payloadArg.tags,
        },
      });
      if (error) throw error;
      const text = (data as { caption?: string })?.caption ?? "";
      setCaption(text);
      setTouched(false);
    } catch (err) {
      toast.error("AI couldn't generate. Edit manually below.");
      // Provide a basic fallback so user isn't stuck
      setCaption(
        `${payloadArg.title}\n\n${payloadArg.summary}\n\n${payloadArg.url}`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate on open / platform change (unless user has edited)
  useEffect(() => {
    if (!open || !payload) return;
    if (touched) return;
    generate(platform, payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, platform, payload?.url]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setCaption("");
      setTouched(false);
      setPlatform("facebook");
    }
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      toast.success(`Copied — ready to paste on ${TAB_META[platform].label}`);
    } catch {
      toast.error("Copy failed");
    }
  };

  const openShare = () => {
    if (!payload) return;
    const u = buildShareUrl(platform, payload, caption);
    if (!u) return;
    // Copy caption first so user can paste on platforms that don't accept text via URL
    navigator.clipboard.writeText(caption).catch(() => {});
    window.open(u, "_blank", "noopener,noreferrer,width=720,height=720");
    toast.success(
      platform === "linkedin" || platform === "youtube"
        ? "Caption copied. Paste into the opened window."
        : `${TAB_META[platform].label} share opened`,
    );
  };

  if (!payload) return null;

  const platforms: Platform[] = ["facebook", "linkedin", "twitter", "youtube"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Share — {payload.title}
          </DialogTitle>
          <DialogDescription>
            Pick a platform. AI rewrites the caption for it. Copy or open the share window.
          </DialogDescription>
        </DialogHeader>

        {/* Platform tabs */}
        <div className="flex flex-wrap gap-2">
          {platforms.map((p) => {
            const Icon = TAB_META[p].icon;
            const active = platform === p;
            const disabled = p === "youtube" && !hasVideo;
            return (
              <button
                key={p}
                type="button"
                disabled={disabled}
                onClick={() => setPlatform(p)}
                title={disabled ? "Add a videoUrl to this item to enable YouTube share" : undefined}
                className={[
                  "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all",
                  active
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border/50 bg-background/30 text-foreground/65 hover:text-foreground hover:border-foreground/30",
                  disabled ? "opacity-40 cursor-not-allowed" : "",
                ].join(" ")}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? TAB_META[p].brand : ""}`} />
                {TAB_META[p].label}
              </button>
            );
          })}
        </div>

        {/* Caption editor */}
        <div className="relative">
          <Textarea
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
              setTouched(true);
            }}
            rows={10}
            placeholder={loading ? "AI is writing…" : "Caption will appear here"}
            className="resize-none font-sans text-sm leading-relaxed"
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-md">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}
          <div className="flex items-center justify-between mt-2 text-[11px] text-foreground/50">
            <span>{caption.length} chars</span>
            <button
              type="button"
              onClick={() => payload && generate(platform, payload)}
              disabled={loading}
              className="inline-flex items-center gap-1 text-primary hover:underline disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3" />
              Regenerate
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 justify-end pt-2">
          <Button variant="outline" onClick={copy} disabled={!caption}>
            <Copy />
            Copy
          </Button>
          <Button variant="hero" onClick={openShare} disabled={!caption}>
            <ExternalLink />
            Open {TAB_META[platform].label}
          </Button>
        </div>

        {platform === "youtube" && !hasVideo && (
          <p className="text-[11px] text-foreground/55">
            YouTube doesn't accept share-via-URL for text posts. Copy the description and paste it into your video upload — Studio opens on click.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;