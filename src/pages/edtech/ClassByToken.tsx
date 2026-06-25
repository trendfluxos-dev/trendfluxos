import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SeoHead } from "@/hooks/useSeo";

/**
 * No-account student join surface (`/class/:token`).
 *
 * The teacher hands out a `live_classes.share_token`-bearing URL; the
 * student opens it and sees ONLY what `live_state.is_live_visible` says
 * is currently published. No login, no profile, no chat — minimal UI
 * per the EISH lock spec.
 *
 * All data is fetched through the `get_class_by_share_token` RPC, which
 * is the only public read path that can join `live_classes` + `live_state`
 * without auth. Realtime updates come over the same `class:<id>`
 * broadcast channel the studio uses.
 */
type TokenClass = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  status: string;
  active_source_type: "none" | "material" | "whiteboard" | "web" | "video";
  payload: Record<string, unknown>;
  is_live_visible: boolean;
  whiteboard_snapshot: Record<string, unknown> | null;
};

export default function ClassByToken() {
  const { token = "" } = useParams<{ token: string }>();
  const [data, setData] = useState<TokenClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!token) return;

    const load = async () => {
      const { data: rows, error } = await supabase.rpc("get_class_by_share_token", { _token: token });
      if (cancelled) return;
      if (error) {
        setError("এই লিঙ্কটি বৈধ নয়। শিক্ষকের কাছ থেকে নতুন লিঙ্ক নিন।");
        setLoading(false);
        return;
      }
      const row = Array.isArray(rows) ? rows[0] : rows;
      if (!row) {
        setError("ক্লাস পাওয়া যায়নি।");
        setLoading(false);
        return;
      }
      setData(row as TokenClass);
      setLoading(false);
    };

    void load();

    return () => { cancelled = true; };
  }, [token]);

  // Subscribe to live_changed via the class id we discovered.
  useEffect(() => {
    if (!data?.id) return;
    const channel = supabase
      .channel(`class:${data.id}`, { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "live_changed" }, async () => {
        const { data: rows } = await supabase.rpc("get_class_by_share_token", { _token: token });
        const row = Array.isArray(rows) ? rows[0] : rows;
        if (row) setData(row as TokenClass);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [data?.id, token]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-6 text-center text-foreground">
        <div className="max-w-md space-y-3">
          <h1 className="text-2xl font-semibold">ক্লাসে যোগ দেওয়া যায়নি</h1>
          <p className="text-muted-foreground">{error ?? "লিঙ্কটি পরীক্ষা করুন।"}</p>
        </div>
      </div>
    );
  }

  const live = data.is_live_visible && data.active_source_type !== "none";

  return (
    <div className="min-h-dvh bg-background text-foreground" lang="bn">
      <SeoHead title={`${data.title} — Live Class`} description={data.description ?? "Live class"} />
      <header className="border-b border-border/60 bg-card/40 px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              TrendFlux EdTech · Live
            </p>
            <h1 className="text-base font-semibold">{data.title}</h1>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              live
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {live ? "LIVE" : "WAITING"}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="aspect-video w-full overflow-hidden rounded-xl border border-border/60 bg-black/80">
          {live ? (
            <LiveSurface data={data} />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
              শিক্ষক এখনো কোনো content live-এ পাঠাননি। যখন তিনি "Send to Live" press করবেন,
              এই উইন্ডোতেই সাথে সাথে দেখা যাবে।
            </div>
          )}
        </div>

        {data.description && (
          <p className="mt-4 text-sm text-muted-foreground">{data.description}</p>
        )}
      </main>
    </div>
  );
}

function LiveSurface({ data }: { data: TokenClass }) {
  const payload = data.payload ?? {};
  switch (data.active_source_type) {
    case "web": {
      const url = typeof payload.url === "string" ? payload.url : "";
      if (!url) return <Placeholder text="Web tab loading…" />;
      return (
        <iframe
          title="Live web view"
          src={url}
          className="h-full w-full"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      );
    }
    case "video": {
      const url = typeof payload.url === "string" ? payload.url : "";
      if (!url) return <Placeholder text="Video loading…" />;
      return (
        <video
          src={url}
          controls
          autoPlay
          playsInline
          className="h-full w-full bg-black"
        />
      );
    }
    case "material": {
      const url = typeof payload.signed_url === "string" ? payload.signed_url : "";
      if (!url) return <Placeholder text="Material loading…" />;
      return <iframe title="Live material" src={url} className="h-full w-full bg-white" />;
    }
    case "whiteboard":
      return <Placeholder text="Whiteboard live — শীঘ্রই full canvas আসছে" />;
    default:
      return <Placeholder text="Waiting…" />;
  }
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}