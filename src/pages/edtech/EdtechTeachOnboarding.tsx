import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Circle, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import EdtechPageHeader from "@/components/edtech/EdtechPageHeader";
import { EDTECH } from "@/config/edtech";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";

type Profile = {
  user_id: string;
  calendar_connected_at: string | null;
  drive_folder_url: string | null;
  share_link_copied_at: string | null;
  onboarded_at: string | null;
};

type StepDef = {
  key: string;
  title: string;
  body: string;
  cta: string;
  done: (p: Profile, counts: Counts) => boolean;
  action: (ctx: { update: (patch: Partial<Profile>) => Promise<void>; profile: Profile }) => Promise<void> | void;
};

type Counts = { classes: number; materials: number };

const EdtechTeachOnboarding = () => {
  useSeo({ title: "Teacher onboarding — TrendFlux EdTech", noindex: true });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [counts, setCounts] = useState<Counts>({ classes: 0, materials: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const uid = s.session?.user.id;
      if (!uid) {
        setLoading(false);
        return;
      }
      // Ensure a row exists
      await supabase
        .from("teacher_profiles")
        .upsert({ user_id: uid }, { onConflict: "user_id" });
      const [{ data: prof }, { count: classCount }] = await Promise.all([
        supabase.from("teacher_profiles").select("*").eq("user_id", uid).maybeSingle(),
        supabase.from("live_classes").select("id", { count: "exact", head: true }).eq("created_by", uid),
      ]);
      setProfile(prof as Profile);
      setCounts({ classes: classCount ?? 0, materials: 0 });
      setLoading(false);
    })();
  }, []);

  const update = async (patch: Partial<Profile>) => {
    if (!profile) return;
    const { data, error } = await supabase
      .from("teacher_profiles")
      .update(patch)
      .eq("user_id", profile.user_id)
      .select()
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    setProfile(data as Profile);
  };

  const steps: StepDef[] = [
    {
      key: "calendar",
      title: "Google Calendar connect করো",
      body: "ক্লাস schedule send করতে Calendar OAuth লাগবে। আপাতত manual mark করো; full OAuth wiring পরবর্তী phase-এ।",
      cta: "Connected হিসেবে mark করো",
      done: (p) => !!p.calendar_connected_at,
      action: ({ update }) => update({ calendar_connected_at: new Date().toISOString() }),
    },
    {
      key: "drive",
      title: "Google Drive / asset folder",
      body: "Class materials এর জন্য একটি public Drive folder তৈরি করে URL paste করো।",
      cta: "Folder URL save করো",
      done: (p) => !!p.drive_folder_url,
      action: async ({ update }) => {
        const url = window.prompt("Drive folder URL");
        if (url) await update({ drive_folder_url: url });
      },
    },
    {
      key: "first-class",
      title: "প্রথম class তৈরি করো",
      body: "একটি live class create না করা পর্যন্ত এই step complete হবে না।",
      cta: "My Classes-এ যাও",
      done: (_p, c) => c.classes > 0,
      action: () => { window.location.href = EDTECH.routes.teachClasses; },
    },
    {
      key: "material",
      title: "প্রথম material upload করো",
      body: "Slides / handout / PDF — যেকোনো একটি asset যোগ করো।",
      cta: "ম্যানুয়ালি mark করো",
      done: () => false,
      action: () => toast.message("Materials uploader phase-2 এ আসছে।"),
    },
    {
      key: "share",
      title: "Student join link copy করো",
      body: "আপনার class link share করার জন্য প্রস্তুত করুন।",
      cta: "Link copy & mark",
      done: (p) => !!p.share_link_copied_at,
      action: async ({ update }) => {
        await navigator.clipboard.writeText(window.location.origin + EDTECH.routes.live);
        toast.success("Live page link copied.");
        await update({ share_link_copied_at: new Date().toISOString() });
      },
    },
    {
      key: "schedule",
      title: "Calendar-এ schedule করো",
      body: "প্রথম class এর calendar event তৈরি করো (manual আপাতত)।",
      cta: "Done হিসেবে mark করো",
      done: () => false,
      action: () => toast.message("Calendar OAuth phase-2 এ।"),
    },
    {
      key: "go-live",
      title: "প্রথম live class start করো",
      body: "Studio থেকে window pick করে Go Live press করো।",
      cta: "Studio এ যাও",
      done: () => false,
      action: () => { window.location.href = EDTECH.routes.teachClasses; },
    },
  ];

  const completed = profile ? steps.filter((s) => s.done(profile, counts)).length : 0;

  // Auto-mark onboarded when 7/7
  useEffect(() => {
    if (profile && completed === steps.length && !profile.onboarded_at) {
      void update({ onboarded_at: new Date().toISOString() });
      toast.success("Onboarding complete — welcome aboard!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed, profile?.onboarded_at]);

  return (
    <EdtechShell>
      <EdtechHeader />
      <EdtechPageHeader
        eyebrow="Teacher onboarding"
        title={<>Welcome — <span className="edtech-text-gradient">7 steps</span> to your first class</>}
        description="প্রতিটি step ছোট। complete করলে আপনি students দের কাছে publicly listed হয়ে যাবেন।"
        actions={
          <span className="rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm font-semibold">
            {completed}/{steps.length} ✓
          </span>
        }
      />
      <main className="mx-auto max-w-3xl px-6 py-10 lg:px-10">
        {loading || !profile ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <ol className="space-y-3">
            {steps.map((s, i) => {
              const done = s.done(profile, counts);
              return (
                <li
                  key={s.key}
                  className={[
                    "rounded-2xl border p-5 transition-colors",
                    done ? "border-primary/40 bg-primary/[0.04]" : "border-border/60 bg-card/40",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={[
                        "mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold",
                        done ? "bg-primary text-primary-foreground" : "border border-border bg-background text-foreground/70",
                      ].join(" ")}
                    >
                      {done ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-display text-[15px] font-semibold text-foreground">
                          {s.title}
                        </h3>
                        {done ? (
                          <span className="text-[11px] uppercase tracking-[0.2em] text-primary">Done</span>
                        ) : (
                          <Circle className="h-4 w-4 text-foreground/30" />
                        )}
                      </div>
                      <p className="mt-1 text-[13px] leading-[1.7] text-foreground/65">{s.body}</p>
                      {!done && (
                        <button
                          type="button"
                          onClick={() => void s.action({ update, profile })}
                          className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90"
                        >
                          {s.cta}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        <div className="mt-8 flex items-center justify-between text-[12px] text-foreground/60">
          <Link to={EDTECH.routes.teachClasses} className="inline-flex items-center gap-1 hover:text-foreground">
            My classes <ExternalLink className="h-3 w-3" />
          </Link>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(window.location.href);
              toast.success("URL copied");
            }}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <Copy className="h-3 w-3" /> Copy page link
          </button>
        </div>
      </main>
    </EdtechShell>
  );
};

export default EdtechTeachOnboarding;