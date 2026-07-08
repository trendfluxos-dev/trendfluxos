import { useEffect, useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Save, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSeo } from "@/hooks/useSeo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { fetchBdjobsProfile, saveBdjobsProfile } from "@/lib/bdjobsProfile";
import {
  DEFAULT_BDJOBS_PROFILE,
  type BdjobsAccomplishment,
  type BdjobsCertificationRow,
  type BdjobsDetailRow,
  type BdjobsEducationRow,
  type BdjobsExperienceRole,
  type BdjobsLanguageRow,
  type BdjobsProfileData,
  type BdjobsReference,
  type BdjobsTrainingRow,
} from "@/data/bdjobsProfileDefault";

/**
 * Admin-only editor for the Bdjobs profile. Structured to mirror the Bdjobs
 * CV pattern one-to-one so admins can update any section. Save persists to
 * `site_profile_data` (RLS-gated to admin) and the public page rehydrates.
 */

const SectionCard = ({
  title,
  children,
  onAdd,
  addLabel,
}: {
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
}) => (
  <Card className="p-5">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {onAdd && (
        <Button size="sm" variant="outline" onClick={onAdd} type="button">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> {addLabel ?? "Add"}
        </Button>
      )}
    </div>
    <div className="space-y-4">{children}</div>
  </Card>
);

const DeleteBtn = ({ onClick }: { onClick: () => void }) => (
  <Button size="sm" variant="ghost" onClick={onClick} type="button">
    <Trash2 className="h-3.5 w-3.5 text-destructive" />
  </Button>
);

// Compact reusable row editor for object arrays. `fields` is a list of
// [key, label, "input" | "textarea"] tuples.
type FieldSpec<T> = [keyof T, string, ("input" | "textarea")?];
function RowsEditor<T extends Record<string, unknown>>({
  rows,
  fields,
  onChange,
  onAddDefault,
}: {
  rows: T[];
  fields: FieldSpec<T>[];
  onChange: (next: T[]) => void;
  onAddDefault: () => T;
}) {
  const update = (idx: number, key: keyof T, value: string) => {
    const next = rows.map((r, i) => (i === idx ? { ...r, [key]: value } : r));
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="rounded-lg border border-border p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Row {i + 1}
            </Label>
            <DeleteBtn onClick={() => onChange(rows.filter((_, idx) => idx !== i))} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {fields.map(([key, label, kind]) => {
              const value = (row[key] as string | undefined) ?? "";
              const handler = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                update(i, key, e.target.value);
              if (kind === "textarea") {
                return (
                  <div key={String(key)} className="sm:col-span-2">
                    <Label className="text-xs">{label}</Label>
                    <Textarea rows={3} value={value} onChange={handler} />
                  </div>
                );
              }
              return (
                <div key={String(key)}>
                  <Label className="text-xs">{label}</Label>
                  <Input value={value} onChange={handler} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <Button size="sm" variant="ghost" type="button" onClick={() => onChange([...rows, onAddDefault()])}>
        <Plus className="mr-1.5 h-3.5 w-3.5" /> Add row
      </Button>
    </div>
  );
}

const BulletsEditor = ({
  bullets,
  onChange,
}: {
  bullets: string[];
  onChange: (next: string[]) => void;
}) => (
  <div className="space-y-2">
    {bullets.map((b, i) => (
      <div key={i} className="flex items-start gap-2">
        <Input
          value={b}
          onChange={(e) => {
            const next = [...bullets];
            next[i] = e.target.value;
            onChange(next);
          }}
        />
        <DeleteBtn onClick={() => onChange(bullets.filter((_, idx) => idx !== i))} />
      </div>
    ))}
    <Button size="sm" variant="ghost" type="button" onClick={() => onChange([...bullets, ""])}>
      <Plus className="mr-1.5 h-3.5 w-3.5" /> Add
    </Button>
  </div>
);

const BdjobsProfileEdit = () => {
  useSeo({
    title: "Edit Bdjobs Profile · Admin | Trendflux",
    description: "Admin-only editor for the live Bdjobs profile mirror.",
    noindex: true,
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<BdjobsProfileData>(DEFAULT_BDJOBS_PROFILE);

  useEffect(() => {
    fetchBdjobsProfile().then((res) => {
      // Migrate/backfill any missing new-schema keys against the default so
      // older DB rows continue to render + edit without runtime errors.
      setData({ ...DEFAULT_BDJOBS_PROFILE, ...res.data,
        accomplishments: {
          ...DEFAULT_BDJOBS_PROFILE.accomplishments,
          ...(res.data.accomplishments ?? {}),
        },
        contact: { ...DEFAULT_BDJOBS_PROFILE.contact, ...(res.data.contact ?? {}) },
      });
      setLoading(false);
    });
  }, []);

  const patch = <K extends keyof BdjobsProfileData>(key: K, value: BdjobsProfileData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const patchContact = (key: keyof BdjobsProfileData["contact"], value: string) =>
    setData((prev) => ({ ...prev, contact: { ...prev.contact, [key]: value } }));

  const patchAccGroup = (
    key: keyof BdjobsProfileData["accomplishments"],
    value: BdjobsAccomplishment[],
  ) =>
    setData((prev) => ({
      ...prev,
      accomplishments: { ...prev.accomplishments, [key]: value },
    }));

  const onSave = async () => {
    setSaving(true);
    try {
      await saveBdjobsProfile(data);
      toast.success("Profile saved & resynced");
      navigate("/bdjobs-profile");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (confirm("Reset all fields to the bundled defaults? Unsaved edits will be lost.")) {
      setData(DEFAULT_BDJOBS_PROFILE);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-4xl px-5 pb-32 pt-28 sm:px-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            to="/bdjobs-profile"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to profile
          </Link>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={resetToDefaults}>
              Reset defaults
            </Button>
            <Button size="sm" onClick={onSave} disabled={saving}>
              {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
              Save &amp; resync
            </Button>
          </div>
        </div>

        <h1 className="mb-6 font-display text-3xl font-semibold">Edit Bdjobs Profile</h1>

        <div className="space-y-6">
          <SectionCard title="Header">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Full name</Label>
                <Input value={data.fullName} onChange={(e) => patch("fullName", e.target.value)} />
              </div>
              <div>
                <Label>Headline (internal / SEO)</Label>
                <Input value={data.headline} onChange={(e) => patch("headline", e.target.value)} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Contact">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Location</Label>
                <Input value={data.contact.location} onChange={(e) => patchContact("location", e.target.value)} />
              </div>
              <div>
                <Label>Phones</Label>
                <Input value={data.contact.phones} onChange={(e) => patchContact("phones", e.target.value)} />
              </div>
              <div>
                <Label>Emails</Label>
                <Input value={data.contact.emails} onChange={(e) => patchContact("emails", e.target.value)} />
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                <Input value={data.contact.linkedin} onChange={(e) => patchContact("linkedin", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label>GitHub URL</Label>
                <Input value={data.contact.github} onChange={(e) => patchContact("github", e.target.value)} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Career objective">
            <Textarea rows={3} value={data.careerObjective} onChange={(e) => patch("careerObjective", e.target.value)} />
          </SectionCard>

          <SectionCard title="Career summary">
            <Textarea rows={5} value={data.careerSummary} onChange={(e) => patch("careerSummary", e.target.value)} />
          </SectionCard>

          <SectionCard title="Special qualification">
            <Textarea rows={4} value={data.specialQualification} onChange={(e) => patch("specialQualification", e.target.value)} />
          </SectionCard>

          <SectionCard title="Experience">
            <div>
              <Label>Total years of experience</Label>
              <Input value={data.totalExperience} onChange={(e) => patch("totalExperience", e.target.value)} />
            </div>
            <div className="space-y-3">
              {data.experience.map((r, i) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Label>Role #{i + 1}</Label>
                    <DeleteBtn onClick={() => patch("experience", data.experience.filter((_, idx) => idx !== i))} />
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <Input placeholder="Title" value={r.title} onChange={(e) => {
                      const next = [...data.experience]; next[i] = { ...r, title: e.target.value }; patch("experience", next);
                    }} />
                    <Input placeholder="Period" value={r.period} onChange={(e) => {
                      const next = [...data.experience]; next[i] = { ...r, period: e.target.value }; patch("experience", next);
                    }} />
                    <Input placeholder="Organization" value={r.org} onChange={(e) => {
                      const next = [...data.experience]; next[i] = { ...r, org: e.target.value }; patch("experience", next);
                    }} />
                    <Input placeholder="Location" value={r.location} onChange={(e) => {
                      const next = [...data.experience]; next[i] = { ...r, location: e.target.value }; patch("experience", next);
                    }} />
                  </div>
                  <div className="mt-3">
                    <Label className="text-xs">Area of expertise</Label>
                    <BulletsEditor bullets={r.areasOfExpertise} onChange={(bullets) => {
                      const next = [...data.experience]; next[i] = { ...r, areasOfExpertise: bullets }; patch("experience", next);
                    }} />
                  </div>
                  <div className="mt-3">
                    <Label className="text-xs">Duties / responsibilities</Label>
                    <Textarea rows={4} value={r.duties} onChange={(e) => {
                      const next = [...data.experience]; next[i] = { ...r, duties: e.target.value }; patch("experience", next);
                    }} />
                  </div>
                </div>
              ))}
              <Button size="sm" variant="ghost" type="button" onClick={() => patch("experience", [
                ...data.experience,
                { title: "", period: "", org: "", location: "", areasOfExpertise: [], duties: "" } as BdjobsExperienceRole,
              ])}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add role
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Academic / Education">
            <RowsEditor<BdjobsEducationRow>
              rows={data.education}
              onChange={(next) => patch("education", next)}
              fields={[
                ["exam", "Exam"],
                ["concentration", "Concentration / Major"],
                ["institute", "Institute"],
                ["result", "Result"],
                ["year", "Passing Year"],
                ["duration", "Duration"],
                ["achievement", "Achievement", "textarea"],
              ]}
              onAddDefault={() => ({ exam: "", concentration: "", institute: "", result: "", year: "", duration: "", achievement: "" })}
            />
          </SectionCard>

          <SectionCard title="Training">
            <RowsEditor<BdjobsTrainingRow>
              rows={data.training}
              onChange={(next) => patch("training", next)}
              fields={[
                ["title", "Title"],
                ["topic", "Topic", "textarea"],
                ["institute", "Institute"],
                ["country", "Country"],
                ["location", "Location"],
                ["year", "Year"],
                ["duration", "Duration"],
              ]}
              onAddDefault={() => ({ title: "", topic: "", institute: "", country: "", location: "", year: "", duration: "" })}
            />
          </SectionCard>

          <SectionCard title="Professional qualification (certifications)">
            <RowsEditor<BdjobsCertificationRow>
              rows={data.certifications}
              onChange={(next) => patch("certifications", next)}
              fields={[
                ["name", "Certification"],
                ["institute", "Institute"],
                ["location", "Location"],
                ["from", "From"],
                ["to", "To"],
              ]}
              onAddDefault={() => ({ name: "", institute: "", location: "", from: "", to: "" })}
            />
          </SectionCard>

          <SectionCard title="Career and application information">
            <RowsEditor<BdjobsDetailRow>
              rows={data.careerInfo}
              onChange={(next) => patch("careerInfo", next)}
              fields={[["label", "Label"], ["value", "Value", "textarea"]]}
              onAddDefault={() => ({ label: "", value: "" })}
            />
          </SectionCard>

          <SectionCard title="Skills">
            <div>
              <Label className="text-xs">Skill list</Label>
              <BulletsEditor bullets={data.skills} onChange={(v) => patch("skills", v)} />
            </div>
            <div>
              <Label className="text-xs">Skill description</Label>
              <Textarea rows={4} value={data.skillDescription} onChange={(e) => patch("skillDescription", e.target.value)} />
            </div>
          </SectionCard>

          {(["portfolio", "awards", "projects", "others"] as const).map((group) => (
            <SectionCard key={group} title={`Accomplishments — ${group.charAt(0).toUpperCase()}${group.slice(1)}`}>
              <RowsEditor<BdjobsAccomplishment>
                rows={data.accomplishments[group]}
                onChange={(next) => patchAccGroup(group, next)}
                fields={[
                  ["title", "Title"],
                  ["url", "URL (optional)"],
                  ["description", "Description", "textarea"],
                ]}
                onAddDefault={() => ({ title: "", url: "", description: "" })}
              />
            </SectionCard>
          ))}

          <SectionCard title="Extra curricular activities">
            <RowsEditor<BdjobsDetailRow>
              rows={data.extraCurricular}
              onChange={(next) => patch("extraCurricular", next)}
              fields={[["label", "Category"], ["value", "Description", "textarea"]]}
              onAddDefault={() => ({ label: "", value: "" })}
            />
          </SectionCard>

          <SectionCard title="Language proficiency">
            <RowsEditor<BdjobsLanguageRow>
              rows={data.languages}
              onChange={(next) => patch("languages", next)}
              fields={[
                ["name", "Language"],
                ["reading", "Reading"],
                ["writing", "Writing"],
                ["speaking", "Speaking"],
              ]}
              onAddDefault={() => ({ name: "", reading: "", writing: "", speaking: "" })}
            />
          </SectionCard>

          <SectionCard title="Personal details">
            <RowsEditor<BdjobsDetailRow>
              rows={data.personalDetails}
              onChange={(next) => patch("personalDetails", next)}
              fields={[["label", "Label"], ["value", "Value"]]}
              onAddDefault={() => ({ label: "", value: "" })}
            />
          </SectionCard>

          <SectionCard title="References">
            <RowsEditor<BdjobsReference>
              rows={data.references}
              onChange={(next) => patch("references", next)}
              fields={[
                ["name", "Name"],
                ["organization", "Organization"],
                ["designation", "Designation"],
                ["address", "Address", "textarea"],
                ["phoneOffice", "Phone (Office)"],
                ["mobile", "Mobile (optional)"],
                ["email", "Email"],
                ["relation", "Relation"],
              ]}
              onAddDefault={() => ({
                name: "", organization: "", designation: "", address: "",
                phoneOffice: "", mobile: "", email: "", relation: "",
              })}
            />
          </SectionCard>

          <div className="sticky bottom-4 flex justify-end">
            <Button size="lg" onClick={onSave} disabled={saving} className="shadow-lg">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save &amp; resync
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BdjobsProfileEdit;
