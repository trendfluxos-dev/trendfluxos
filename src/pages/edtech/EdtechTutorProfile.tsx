import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Calendar, Globe, Star } from "lucide-react";
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

type Slot = { id: string; weekday: number; start_time: string; end_time: string };

const WEEK = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];

const EdtechTutorProfile = () => {
  const { id = "" } = useParams<{ id: string }>();
  const [tutor, setTutor] = useState<TutorRow | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  useSeo({
    title: tutor?.headline
      ? `${tutor.headline} — TrendFlux Tutor`
      : "Tutor profile — TrendFlux EdTech",
  });

  useEffect(() => {
    (async () => {
      const [{ data: t }, { data: a }] = await Promise.all([
        supabase
          .from("teacher_profiles_public" as never)
          .select("user_id,headline,bio,expertise,languages,hourly_rate,currency,avg_rating,response_sla_minutes,verified_at")
          .eq("user_id", id)
          .maybeSingle(),
        supabase.from("tutor_availability").select("id,weekday,start_time,end_time").eq("tutor_id", id),
      ]);
      setTutor(t as TutorRow);
      setSlots((a ?? []) as Slot[]);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <EdtechShell>
        <EdtechHeader />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </EdtechShell>
    );
  }

  if (!tutor) {
    return (
      <EdtechShell>
        <EdtechHeader />
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <h1 className="font-display text-2xl font-semibold">Tutor not found</h1>
          <Link to={EDTECH.routes.tutors} className="mt-4 inline-flex text-primary">
            ← All tutors
          </Link>
        </div>
      </EdtechShell>
    );
  }

  return (
    <EdtechShell>
      <EdtechHeader />
      <EdtechPageHeader
        eyebrow="Verified tutor"
        title={tutor.headline ?? "TrendFlux verified tutor"}
        description={tutor.bio ?? "Bio coming soon."}
        actions={
          <Link
            to={EDTECH.routes.tutorBook(tutor.user_id)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Book a session <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <main className="mx-auto grid max-w-5xl gap-6 px-6 py-10 lg:grid-cols-[2fr_1fr] lg:px-10">
        <div className="space-y-6">
          <section className="rounded-3xl border border-border/60 bg-card/40 p-6">
            <h2 className="font-display text-lg font-semibold">Expertise</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(tutor.expertise ?? []).map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[12px]"
                >
                  {s}
                </span>
              ))}
              {(tutor.expertise ?? []).length === 0 && (
                <span className="text-sm text-foreground/50">No tags yet.</span>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-border/60 bg-card/40 p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Calendar className="h-4 w-4 text-primary" /> Weekly availability
            </h2>
            {slots.length === 0 ? (
              <p className="mt-3 text-sm text-foreground/60">এখনো availability set হয়নি।</p>
            ) : (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {slots.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-[13px]"
                  >
                    <span className="font-semibold">{WEEK[s.weekday]}</span>
                    <span className="text-foreground/70">
                      {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border/60 bg-card/40 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
              Rate
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">
              {tutor.hourly_rate ? `${tutor.currency ?? "BDT"} ${tutor.hourly_rate}` : "Negotiable"}
              <span className="ml-1 text-sm text-foreground/60">/hr</span>
            </p>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card/40 p-5">
            <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
              <Star className="h-3 w-3" /> Rating
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">
              {tutor.avg_rating?.toFixed(1) ?? "—"}
            </p>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card/40 p-5">
            <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/60">
              <Globe className="h-3 w-3" /> Languages
            </p>
            <p className="mt-1 text-sm">{(tutor.languages ?? []).join(" · ") || "—"}</p>
          </div>
        </aside>
      </main>
    </EdtechShell>
  );
};

export default EdtechTutorProfile;