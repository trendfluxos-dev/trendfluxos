import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { PressItem } from "@/hooks/usePressItems";

export default function PressDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<PressItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data } = await supabase
        .from("press_items")
        .select("*")
        .eq("id", id)
        .eq("published", true)
        .maybeSingle();
      if (!data) setNotFound(true);
      else setItem(data as PressItem);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-4 rounded-2xl glass p-8">
          <h1 className="font-display text-2xl font-bold">Article not found</h1>
          <p className="text-sm text-foreground/60">
            This press item is unavailable or unpublished.
          </p>
          <Button onClick={() => navigate("/#story")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-1" />Back to story
          </Button>
        </div>
      </div>
    );
  }

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
            <p className="mt-8 text-base leading-relaxed text-foreground/75">
              {item.context}
            </p>
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

          <p className="mt-8 text-[11px] text-foreground/40 break-all">
            Source URL: {item.href}
          </p>
        </div>
      </main>
    </div>
  );
}
