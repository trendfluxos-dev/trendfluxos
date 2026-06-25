import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Star } from "lucide-react";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import EdtechPageHeader from "@/components/edtech/EdtechPageHeader";
import { EDTECH } from "@/config/edtech";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";

type TutorRow = {
  user_id: string;
  headline: string | null;
  bio: string | null;
  expertise: string[] | null;
  languages: string[] | null;
  hourly_rate: number | null;
  currency: string | null;
  avg_rating: number | null;
  verified_at: string | null;
};

const EdtechTutors = () => {
  useSeo({
    title: "Browse tutors — TrendFlux EdTech",
    description: "Verified tutors দের সাথে 1:1 live class book করুন। Subject, language, budget ফিল্টার করে instant booking।",
  });
  const [tutors, setTutors] = useState<TutorRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("teacher_profiles")
        .select("user_id,headline,bio,expertise,languages,hourly_rate,currency,avg_rating,verified_at")
        .not("verified_at", "is", null)
        .order("avg_rating", { ascending: false, nullsFirst: false });
      setTutors((data ?? []) as TutorRow[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return tutors;
    return tutors.filter((t) =>
      [t.headline, t.bio, (t.expertise ?? []).join(" "), (t.languages ?? []).join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [tutors, q]);

  return (
    <EdtechShell>
      <EdtechHeader />
      <EdtechPageHeader
        eyebrow="Marketplace · 1:1 Tutors"
        title={<>Find your <span className="edtech-text-gradient">verified tutor</span></>}
        description="Subject, language বা rate দিয়ে search করুন। Instant 1:1 live session book করুন।"
      />
      <main className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
        <div className="mb-6 flex items-center gap-3 rounded-full border border-border/60 bg-card/40 px-4 py-2">
          <Search className="h-4 w-4 text-foreground/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search subject, language, or skill…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/40"
          />
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-card/40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <li key={t.user_id}>
                <Link
                  to={EDTECH.routes.tutorProfile(t.user_id)}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-border/60 bg-card/40 p-5 transition-all hover:border-primary/40 hover:bg-card/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-base font-semibold">
                        {t.headline ?? "Verified tutor"}
                      </h3>
                      <p className="mt-0.5 line-clamp-2 text-[12px] leading-[1.6] text-foreground/60">
                        {t.bio ?? "Bio coming soon."}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold text-amber-500">
                      <Star className="h-3 w-3 fill-current" />
                      {t.avg_rating?.toFixed(1) ?? "—"}
                    </span>
                  </div>
                  {(t.expertise ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(t.expertise ?? []).slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-border/50 bg-background/60 px-2 py-0.5 text-[10px] text-foreground/70"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto flex items-center justify-between text-[12px]">
                    <span className="text-foreground/60">
                      {(t.languages ?? []).slice(0, 2).join(" · ") || "Languages —"}
                    </span>
                    <span className="font-semibold">
                      {t.hourly_rate ? `${t.currency ?? "BDT"} ${t.hourly_rate}/hr` : "Negotiable"}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </EdtechShell>
  );
};

const EmptyState = () => (
  <div className="rounded-3xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
    <p className="font-display text-lg">এখনো verified tutor publicly listed হয়নি।</p>
    <p className="mt-1 text-sm text-foreground/60">
      আপনি teacher হতে চাইলে onboarding সম্পন্ন করুন।
    </p>
    <Link
      to={EDTECH.routes.teachOnboarding}
      className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
    >
      Become a tutor
    </Link>
  </div>
);

export default EdtechTutors;