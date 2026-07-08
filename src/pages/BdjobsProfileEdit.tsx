import { useEffect, useState } from "react";
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
  type BdjobsProfileData,
  type BdjobsCompetency,
  type BdjobsVenture,
  type BdjobsRole,
  type BdjobsEducation,
  type BdjobsAchievement,
  type BdjobsLanguage,
  type BdjobsDetailRow,
  type BdjobsReference,
} from "@/data/bdjobsProfileDefault";

/**
 * Bdjobs profile editor. Admin-gated via `RequireRole` at the route level;
 * RLS on `site_profile_data` re-enforces at the DB. Persisted edits hydrate
 * `/bdjobs-profile` on next load — the "Save & resync" button confirms.
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
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> {addLabel ?? "Add"}
        </Button>
      )}
    </div>
    <div className="space-y-4">{children}</div>
  </Card>
);

const RowActions = ({ onRemove }: { onRemove: () => void }) => (
  <Button size="sm" variant="ghost" onClick={onRemove} type="button">
    <Trash2 className="h-3.5 w-3.5 text-destructive" />
  </Button>
);

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
        <Textarea
          value={b}
          onChange={(e) => {
            const next = [...bullets];
            next[i] = e.target.value;
            onChange(next);
          }}
          rows={2}
          className="text-sm"
        />
        <RowActions onRemove={() => onChange(bullets.filter((_, idx) => idx !== i))} />
      </div>
    ))}
    <Button
      size="sm"
      variant="ghost"
      type="button"
      onClick={() => onChange([...bullets, ""])}
    >
      <Plus className="mr-1.5 h-3.5 w-3.5" /> Add bullet
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
      setData(res.data);
      setLoading(false);
    });
  }, []);

  const patch = <K extends keyof BdjobsProfileData>(key: K, value: BdjobsProfileData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const patchContact = (key: keyof BdjobsProfileData["contact"], value: string) =>
    setData((prev) => ({ ...prev, contact: { ...prev.contact, [key]: value } }));

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
      <main className="mx-auto max-w-4xl px-5 pb-24 pt-28 sm:px-8">
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
              {saving ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-3.5 w-3.5" />
              )}
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
                <Label>Headline</Label>
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
                <Label>Emails (comma-separated)</Label>
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

          <SectionCard title="Career summary">
            <Textarea
              value={data.summary}
              onChange={(e) => patch("summary", e.target.value)}
              rows={6}
            />
          </SectionCard>

          <SectionCard
            title="Core competencies"
            onAdd={() =>
              patch("competencies", [
                ...data.competencies,
                { title: "", description: "" } as BdjobsCompetency,
              ])
            }
          >
            {data.competencies.map((c, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <Label>Competency #{i + 1}</Label>
                  <RowActions
                    onRemove={() =>
                      patch("competencies", data.competencies.filter((_, idx) => idx !== i))
                    }
                  />
                </div>
                <Input
                  className="mt-2"
                  placeholder="Title"
                  value={c.title}
                  onChange={(e) => {
                    const next = [...data.competencies];
                    next[i] = { ...c, title: e.target.value };
                    patch("competencies", next);
                  }}
                />
                <Textarea
                  className="mt-2"
                  placeholder="Description"
                  rows={3}
                  value={c.description}
                  onChange={(e) => {
                    const next = [...data.competencies];
                    next[i] = { ...c, description: e.target.value };
                    patch("competencies", next);
                  }}
                />
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="Ventures & projects"
            onAdd={() =>
              patch("ventures", [...data.ventures, { title: "", bullets: [""] } as BdjobsVenture])
            }
          >
            {data.ventures.map((v, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <Label>Venture #{i + 1}</Label>
                  <RowActions
                    onRemove={() =>
                      patch("ventures", data.ventures.filter((_, idx) => idx !== i))
                    }
                  />
                </div>
                <Input
                  className="mt-2"
                  placeholder="Title"
                  value={v.title}
                  onChange={(e) => {
                    const next = [...data.ventures];
                    next[i] = { ...v, title: e.target.value };
                    patch("ventures", next);
                  }}
                />
                <div className="mt-3">
                  <Label className="mb-1 block text-xs">Bullets</Label>
                  <BulletsEditor
                    bullets={v.bullets}
                    onChange={(bullets) => {
                      const next = [...data.ventures];
                      next[i] = { ...v, bullets };
                      patch("ventures", next);
                    }}
                  />
                </div>
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="Professional experience"
            onAdd={() =>
              patch("experience", [
                ...data.experience,
                { org: "", role: "", period: "", bullets: [""] } as BdjobsRole,
              ])
            }
          >
            {data.experience.map((r, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <Label>Role #{i + 1}</Label>
                  <RowActions
                    onRemove={() =>
                      patch("experience", data.experience.filter((_, idx) => idx !== i))
                    }
                  />
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <Input
                    placeholder="Organization"
                    value={r.org}
                    onChange={(e) => {
                      const next = [...data.experience];
                      next[i] = { ...r, org: e.target.value };
                      patch("experience", next);
                    }}
                  />
                  <Input
                    placeholder="Role"
                    value={r.role}
                    onChange={(e) => {
                      const next = [...data.experience];
                      next[i] = { ...r, role: e.target.value };
                      patch("experience", next);
                    }}
                  />
                  <Input
                    placeholder="Period"
                    value={r.period}
                    onChange={(e) => {
                      const next = [...data.experience];
                      next[i] = { ...r, period: e.target.value };
                      patch("experience", next);
                    }}
                  />
                </div>
                <div className="mt-3">
                  <Label className="mb-1 block text-xs">Bullets</Label>
                  <BulletsEditor
                    bullets={r.bullets}
                    onChange={(bullets) => {
                      const next = [...data.experience];
                      next[i] = { ...r, bullets };
                      patch("experience", next);
                    }}
                  />
                </div>
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="Education"
            onAdd={() =>
              patch("education", [
                ...data.education,
                { title: "", bullets: [""] } as BdjobsEducation,
              ])
            }
          >
            {data.education.map((e, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <Label>Entry #{i + 1}</Label>
                  <RowActions
                    onRemove={() =>
                      patch("education", data.education.filter((_, idx) => idx !== i))
                    }
                  />
                </div>
                <Input
                  className="mt-2"
                  placeholder="Title"
                  value={e.title}
                  onChange={(ev) => {
                    const next = [...data.education];
                    next[i] = { ...e, title: ev.target.value };
                    patch("education", next);
                  }}
                />
                <div className="mt-3">
                  <Label className="mb-1 block text-xs">Bullets</Label>
                  <BulletsEditor
                    bullets={e.bullets}
                    onChange={(bullets) => {
                      const next = [...data.education];
                      next[i] = { ...e, bullets };
                      patch("education", next);
                    }}
                  />
                </div>
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="Achievements"
            onAdd={() =>
              patch("achievements", [
                ...data.achievements,
                { title: "", description: "" } as BdjobsAchievement,
              ])
            }
          >
            {data.achievements.map((a, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <Label>Achievement #{i + 1}</Label>
                  <RowActions
                    onRemove={() =>
                      patch("achievements", data.achievements.filter((_, idx) => idx !== i))
                    }
                  />
                </div>
                <Input
                  className="mt-2"
                  placeholder="Title"
                  value={a.title}
                  onChange={(e) => {
                    const next = [...data.achievements];
                    next[i] = { ...a, title: e.target.value };
                    patch("achievements", next);
                  }}
                />
                <Textarea
                  className="mt-2"
                  rows={3}
                  placeholder="Description"
                  value={a.description}
                  onChange={(e) => {
                    const next = [...data.achievements];
                    next[i] = { ...a, description: e.target.value };
                    patch("achievements", next);
                  }}
                />
              </div>
            ))}
          </SectionCard>

          <SectionCard title="Awards & training">
            <div>
              <Label className="mb-1 block text-xs">Awards (bulleted)</Label>
              <BulletsEditor bullets={data.awards} onChange={(v) => patch("awards", v)} />
            </div>
            <div>
              <Label>Training & certifications (single paragraph)</Label>
              <Textarea
                rows={3}
                value={data.training}
                onChange={(e) => patch("training", e.target.value)}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Languages"
            onAdd={() =>
              patch("languages", [...data.languages, { name: "", level: "" } as BdjobsLanguage])
            }
          >
            {data.languages.map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="Language"
                  value={l.name}
                  onChange={(e) => {
                    const next = [...data.languages];
                    next[i] = { ...l, name: e.target.value };
                    patch("languages", next);
                  }}
                />
                <Input
                  placeholder="Level"
                  value={l.level}
                  onChange={(e) => {
                    const next = [...data.languages];
                    next[i] = { ...l, level: e.target.value };
                    patch("languages", next);
                  }}
                />
                <RowActions
                  onRemove={() =>
                    patch("languages", data.languages.filter((_, idx) => idx !== i))
                  }
                />
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="Personal details"
            onAdd={() =>
              patch("personalDetails", [
                ...data.personalDetails,
                { label: "", value: "" } as BdjobsDetailRow,
              ])
            }
          >
            {data.personalDetails.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="Label"
                  value={row.label}
                  onChange={(e) => {
                    const next = [...data.personalDetails];
                    next[i] = { ...row, label: e.target.value };
                    patch("personalDetails", next);
                  }}
                />
                <Input
                  placeholder="Value"
                  value={row.value}
                  onChange={(e) => {
                    const next = [...data.personalDetails];
                    next[i] = { ...row, value: e.target.value };
                    patch("personalDetails", next);
                  }}
                />
                <RowActions
                  onRemove={() =>
                    patch(
                      "personalDetails",
                      data.personalDetails.filter((_, idx) => idx !== i),
                    )
                  }
                />
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="References"
            onAdd={() =>
              patch("references", [
                ...data.references,
                { name: "", rows: [{ label: "", value: "" }] } as BdjobsReference,
              ])
            }
          >
            {data.references.map((ref, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <Label>Reference #{i + 1}</Label>
                  <RowActions
                    onRemove={() =>
                      patch("references", data.references.filter((_, idx) => idx !== i))
                    }
                  />
                </div>
                <Input
                  className="mt-2"
                  placeholder="Name"
                  value={ref.name}
                  onChange={(e) => {
                    const next = [...data.references];
                    next[i] = { ...ref, name: e.target.value };
                    patch("references", next);
                  }}
                />
                <div className="mt-3 space-y-2">
                  {ref.rows.map((row, ri) => (
                    <div key={ri} className="flex items-center gap-2">
                      <Input
                        placeholder="Label"
                        value={row.label}
                        onChange={(e) => {
                          const nextRows = [...ref.rows];
                          nextRows[ri] = { ...row, label: e.target.value };
                          const next = [...data.references];
                          next[i] = { ...ref, rows: nextRows };
                          patch("references", next);
                        }}
                      />
                      <Input
                        placeholder="Value"
                        value={row.value}
                        onChange={(e) => {
                          const nextRows = [...ref.rows];
                          nextRows[ri] = { ...row, value: e.target.value };
                          const next = [...data.references];
                          next[i] = { ...ref, rows: nextRows };
                          patch("references", next);
                        }}
                      />
                      <RowActions
                        onRemove={() => {
                          const nextRows = ref.rows.filter((_, idx) => idx !== ri);
                          const next = [...data.references];
                          next[i] = { ...ref, rows: nextRows };
                          patch("references", next);
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      const next = [...data.references];
                      next[i] = { ...ref, rows: [...ref.rows, { label: "", value: "" }] };
                      patch("references", next);
                    }}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Add row
                  </Button>
                </div>
              </div>
            ))}
          </SectionCard>

          <div className="sticky bottom-4 flex justify-end">
            <Button size="lg" onClick={onSave} disabled={saving} className="shadow-lg">
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
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
