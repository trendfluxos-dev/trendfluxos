import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { addLinkMaterial, uploadMaterial, type MaterialKind } from "@/lib/classMaterials";

export function AddMaterialDialog({ classId, onAdded }: { classId: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<MaterialKind>("pdf");
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Sign in required");
      if (kind === "link") {
        if (!linkUrl) throw new Error("URL required");
        await addLinkMaterial({ classId, teacherId: u.user.id, title: title || linkUrl, url: linkUrl });
      } else {
        if (!file) throw new Error("Pick a file");
        await uploadMaterial({ classId, teacherId: u.user.id, file, kind, title: title || file.name });
      }
      toast.success("Material added");
      setOpen(false); setTitle(""); setLinkUrl(""); setFile(null);
      onAdded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" title="Add material" className="rounded-md border border-border/60 bg-background/60 p-1 text-foreground/70 hover:text-foreground">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add material</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as MaterialKind)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="slide">Slides</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="doc">Document</SelectItem>
                <SelectItem value="link">Web link</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="optional" />
          </div>
          {kind === "link" ? (
            <div className="space-y-1.5">
              <Label>URL</Label>
              <Input type="url" required value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…" />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>File</Label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground hover:bg-accent">
                <Upload className="h-4 w-4" /> {file ? file.name : "Click to choose a file"}
                <input type="file" required className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          )}
          <DialogFooter>
            <Button disabled={busy} type="submit">{busy ? "Uploading…" : "Add to library"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}