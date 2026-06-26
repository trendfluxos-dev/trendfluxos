import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import {
  publishRecordingPublic, uploadAndSaveRecording,
  type RecordingVisibility, type ClassRecording,
} from "@/lib/classRecordings";

type ModuleRow = { id: string; title: string; module_index: number };

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  classId: string | null;
  teacherId: string;
  defaultTitle: string;
  blob: Blob | null;
  mimeType: string;
  durationSec?: number;
  onSaved?: (rec: ClassRecording, publicUrl?: string) => void;
  onDiscard?: () => void;
};

export function SaveRecordingDialog(props: Props) {
  const { open, onOpenChange, classId, teacherId, defaultTitle, blob, mimeType, durationSec } = props;
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<RecordingVisibility>("attendees");
  const [moduleId, setModuleId] = useState<string>("");
  const [lessonIndex, setLessonIndex] = useState<string>("");
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) setTitle(defaultTitle); }, [defaultTitle, open]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await supabase
        .from("course_modules")
        .select("id, title, module_index")
        .order("module_index", { ascending: true });
      setModules((data ?? []) as ModuleRow[]);
    })();
  }, [open]);

  const sizeMb = useMemo(() => blob ? (blob.size / (1024 * 1024)).toFixed(1) : "0", [blob]);

  const handleSave = async () => {
    if (!blob) return;
    if (!title.trim()) { toast.error("Title দিন"); return; }
    setSaving(true);
    try {
      const rec = await uploadAndSaveRecording({
        classId, teacherId,
        title: title.trim(),
        description: description.trim() || undefined,
        visibility,
        attachedModuleId: moduleId || null,
        attachedLessonIndex: lessonIndex ? Number(lessonIndex) : null,
        blob, mimeType, durationSec,
      });
      let publicUrl: string | undefined;
      if (visibility === "public") {
        const token = await publishRecordingPublic(rec.id);
        publicUrl = `${window.location.origin}/class-recording/${token}`;
        await navigator.clipboard.writeText(publicUrl).catch(() => {});
        toast.success("Public link কপি হয়েছে");
      } else {
        toast.success("Recording সংরক্ষণ হয়েছে");
      }
      props.onSaved?.(rec, publicUrl);
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Class recording সংরক্ষণ করুন</DialogTitle>
          <DialogDescription>
            ফাইল সাইজ: {sizeMb} MB · {durationSec ? `${Math.round(durationSec / 60)} min` : "duration unknown"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rec-title">Title</Label>
            <Input id="rec-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rec-desc">Description (optional)</Label>
            <Textarea id="rec-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>কে দেখতে পারবে?</Label>
            <div className="grid grid-cols-3 gap-2">
              {([
                ["private", "শুধু আমি"],
                ["attendees", "যারা join করেছিল"],
                ["public", "Public link"],
              ] as const).map(([v, label]) => (
                <button key={v} type="button"
                  onClick={() => setVisibility(v)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    visibility === v ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-background/60 text-foreground/70"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rec-mod">Attach to module (optional)</Label>
              <select id="rec-mod" value={moduleId} onChange={(e) => setModuleId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">— None —</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>#{m.module_index} · {m.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rec-lesson">Lesson # (optional)</Label>
              <Input id="rec-lesson" type="number" min={1} value={lessonIndex}
                onChange={(e) => setLessonIndex(e.target.value)} disabled={!moduleId} />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" type="button" disabled={saving}
            onClick={() => { props.onDiscard?.(); onOpenChange(false); }}>
            <Trash2 className="mr-1.5 h-4 w-4" /> Discard
          </Button>
          <Button type="button" disabled={saving || !blob} onClick={handleSave}>
            {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
            Save recording
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}