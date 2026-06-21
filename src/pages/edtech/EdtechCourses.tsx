import { useMemo, useState } from "react";
import EdtechShell from "@/components/edtech/EdtechShell";
import EdtechHeader from "@/components/edtech/EdtechHeader";
import CourseCard from "@/components/edtech/CourseCard";
import { EDTECH_COURSES, EDTECH_CATEGORIES, EDTECH_LEVELS } from "@/data/edtechCourses";
import { useSeo } from "@/hooks/useSeo";
import { BRAND } from "@/config/brand";

const EdtechCourses = () => {
  useSeo({
    title: "Courses — KormoShikkha",
    description:
      "Browse every cohort and self-paced course on KormoShikkha — AI, growth operator, brand and career skills.",
    canonical: `${BRAND.url}/edtech/courses`,
  });

  const [category, setCategory] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      EDTECH_COURSES.filter(
        (c) =>
          (!category || c.category === category) && (!level || c.level === level),
      ),
    [category, level],
  );

  const Pill = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1.5 text-[12px] transition-colors",
        active
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-border/60 bg-background/40 text-foreground/65 hover:bg-accent hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );

  return (
    <EdtechShell>
      <EdtechHeader />
      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              All courses
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
              Filter by category or level to find the one that fits where you
              are right now.
            </p>
          </div>

          <div className="mb-8 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Pill active={category === null} onClick={() => setCategory(null)}>
                All categories
              </Pill>
              {EDTECH_CATEGORIES.map((c) => (
                <Pill key={c} active={category === c} onClick={() => setCategory(c)}>
                  {c}
                </Pill>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill active={level === null} onClick={() => setLevel(null)}>
                Any level
              </Pill>
              {EDTECH_LEVELS.map((l) => (
                <Pill key={l} active={level === l} onClick={() => setLevel(l)}>
                  {l}
                </Pill>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-border/60 bg-card/30 p-8 text-center text-sm text-muted-foreground">
              No courses match these filters yet. Try clearing them.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <CourseCard key={c.slug} course={c} />
              ))}
            </div>
          )}
        </div>
      </section>
    </EdtechShell>
  );
};

export default EdtechCourses;