import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Loader2, EyeOff, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { PressItem } from "@/hooks/usePressItems";
import { useSeo } from "@/hooks/useSeo";

type Status = "loading" | "published" | "unpublished-preview" | "unpublished-blocked" | "missing";

export default function PressDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<PressItem | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  useSeo({
    title: item?.title ? `${item.title} — Press | TrendFlux Ecosystem` : "Press Coverage — TrendFlux Ecosystem",
    description: item?.title
      ? `${item.title} — independently verified press coverage from TrendFlux Ecosystem.`
      : "Press coverage and media features from TrendFlux Ecosystem.",
    type: "article",
    noindex: status !== "published",
  });

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setStatus("missing");
        return;
      }

      // First try the public read (RLS allows only published).
      const { data: published } = await supabase
        .from("press_items")
        .select("*")
        .eq("id", id)
        .eq("published", true)
        .maybeSingle();

      if (published) {
        setItem(published as PressItem);
        setStatus("published");
        return;
      }

      // Not visible publicly — see if the viewer is an admin/editor and can preview.
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (session) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);
        const canPreview = roles?.some((r) => r.role === "admin" || r.role === "editor");
        if (canPreview) {
          const { data: draft } = await supabase
            .from("press_items")
            .select("*")
            .eq("id", id)
            .maybeSingle();
          if (draft) {
            setItem(draft as PressItem);
            setStatus("unpublished-preview");
            return;
          }
          setStatus("missing");
          return;
        }
      }

      // Either no session, or no role — check if the row exists at all by asking the
      // RPC-less way: we can't due to RLS, so we just show "unpublished" if no public match.
      // Distinguishing "exists but hidden" vs "missing" without elevated access isn't safe,
      // so we present a single friendly "not available" state.
      setStatus("unpublished-blocked");
    };
    load();
  }, [id]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (status === "missing") {
    return (
      <FriendlyState
        icon={<Lock className="h-6 w-6 text-gold" />}
        title="Article not found"
        body="This press item doesn't exist or has been removed. It may have been replaced with newer coverage."
        onBack={() => navigate("/#story")}
      />
    );
  }

  if (status === "unpublished-blocked") {
    return (
      <FriendlyState
        icon={<EyeOff className="h-6 w-6 text-gold" />}
        title="Coverage not yet public"
        body="This press item is being verified and isn't published yet. Check back soon — in the meantime, explore the rest of the public record."
        onBack={() => navigate("/#story")}
      />
    );
  }

  if (!item) return null;

  const isPreview = status === "unpublished-preview";

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <main className="mx-auto max-w-3xl px-6 py-16 md:px-10 md:py-24">
        <Link
          to="/#story"
          className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-foreground/50 hover:text-gold transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Public Record
        </Link>

        {isPreview && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-gold/40 bg-gold/5 p-4">
            <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <div className="text-sm">
              <p className="font-semibold text-gold">Editor preview · Not public</p>
              <p className="mt-1 text-foreground/70">
                This item is currently unpublished. Visitors who open this link will see a
                friendly "not yet public" message instead of this page.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 rounded-2xl glass p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            {item.outlet}
          </p>
          <h1 className="font-display mt-4 text-3xl font-bold leading-snug md:text-4xl">
            {item.headline}
          </h1>

          <div className="mt-6 flex flex-wrap gap-2">
            {["Bangladesh", "National Press", "2023–2024 coverage"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-foreground/[0.04] px-3 py-1 text-[11px] uppercase tracking-wider text-foreground/60"
              >
                {tag}
              </span>
            ))}
          </div>

          {item.context && (
            <p className="mt-8 text-base leading-relaxed text-foreground/75">{item.context}</p>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <Button variant="gold" asChild size="lg">
              <a href={item.href} target="_blank" rel="noreferrer noopener">
                Read on {item.outlet}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link to="/#story">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>

          <p className="mt-8 text-[11px] text-foreground/40 break-all">Source URL: {item.href}</p>
        </div>
      </main>
    </div>
  );
}

function FriendlyState({
  icon,
  title,
  body,
  onBack,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md text-center space-y-5 rounded-2xl glass p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 ring-1 ring-gold/30">
          {icon}
        </div>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="text-sm text-foreground/65 leading-relaxed">{body}</p>
        <div className="flex justify-center gap-2 pt-2">
          <Button onClick={onBack} variant="gold">
            <ArrowLeft className="h-4 w-4" />
            Back to story
          </Button>
          <Button asChild variant="outline">
            <Link to="/#story">Explore Public Record</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
