import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, LogOut, Save, Eye } from "lucide-react";
import { usePressItems, type PressItem } from "@/hooks/usePressItems";
import { PressItemPreview } from "@/components/PressItemPreview";

type Row = PressItem & { _dirty?: boolean; _new?: boolean };

export default function Admin() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { items, loading, refresh } = usePressItems(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      const ok = roles?.some((r) => r.role === "admin" || r.role === "editor") ?? false;
      setHasAccess(ok);
      setAuthChecked(true);
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) navigate("/auth");
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    setRows(items as Row[]);
  }, [items]);

  const update = (i: number, patch: Partial<Row>) => {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch, _dirty: true } : r)));
  };

  const addRow = () => {
    setRows((rs) => [
      ...rs,
      {
        outlet: "",
        headline: "",
        href: "",
        context: "",
        sort_order: (rs[rs.length - 1]?.sort_order ?? 0) + 10,
        published: true,
        _new: true,
        _dirty: true,
      },
    ]);
  };

  const saveRow = async (i: number) => {
    const r = rows[i];
    if (!r.outlet || !r.headline || !r.href) {
      toast.error("Outlet, headline, and URL are required");
      return;
    }
    const payload = {
      outlet: r.outlet,
      headline: r.headline,
      href: r.href,
      context: r.context ?? "",
      sort_order: r.sort_order ?? 0,
      published: r.published ?? true,
    };
    const op = r._new || !r.id
      ? supabase.from("press_items").insert(payload).select().single()
      : supabase.from("press_items").update(payload).eq("id", r.id).select().single();
    const { data, error } = await op;
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setRows((rs) => rs.map((row, idx) => (idx === i ? { ...(data as Row) } : row)));
  };

  const deleteRow = async (i: number) => {
    const r = rows[i];
    if (!r.id) {
      setRows((rs) => rs.filter((_, idx) => idx !== i));
      return;
    }
    if (!confirm(`Delete "${r.outlet}"?`)) return;
    const { error } = await supabase.from("press_items").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    setRows((rs) => rs.filter((_, idx) => idx !== i));
    toast.success("Deleted");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-4 rounded-2xl glass p-8">
          <h1 className="font-display text-2xl font-bold">No access</h1>
          <p className="text-sm text-foreground/60">
            Your account is signed in but does not have admin or editor role yet. Ask the project owner to grant access.
          </p>
          <p className="text-xs text-foreground/40 break-all">User ID: {userId}</p>
          <Button onClick={signOut} variant="outline">Sign out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div>
            <h1 className="font-display text-xl font-bold">Press Coverage Editor</h1>
            <p className="text-xs text-foreground/60">Edit outlet headlines, URLs, and ordering.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={addRow} size="sm"><Plus className="h-4 w-4 mr-1" />Add</Button>
            <Button onClick={signOut} size="sm" variant="outline"><LogOut className="h-4 w-4 mr-1" />Sign out</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 space-y-4">
        {loading && <Loader2 className="h-5 w-5 animate-spin text-gold" />}
        {rows.map((r, i) => (
          <div key={r.id ?? `new-${i}`} className="rounded-xl glass p-5 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Outlet</Label>
                <Input value={r.outlet} onChange={(e) => update(i, { outlet: e.target.value })} />
              </div>
              <div>
                <Label>Article URL</Label>
                <Input value={r.href} onChange={(e) => update(i, { href: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Headline</Label>
              <Input value={r.headline} onChange={(e) => update(i, { headline: e.target.value })} />
            </div>
            <div>
              <Label>Context</Label>
              <Textarea rows={2} value={r.context ?? ""} onChange={(e) => update(i, { context: e.target.value })} />
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-end gap-4">
                <div>
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    className="w-24"
                    value={r.sort_order ?? 0}
                    onChange={(e) => update(i, { sort_order: parseInt(e.target.value || "0", 10) })}
                  />
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <Switch checked={r.published ?? true} onCheckedChange={(v) => update(i, { published: v })} />
                  <span className="text-xs text-foreground/60">Published</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setPreviewIndex(i)}>
                  <Eye className="h-4 w-4 mr-1" />Preview
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteRow(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={() => saveRow(i)} disabled={!r._dirty}>
                  <Save className="h-4 w-4 mr-1" />Save
                </Button>
              </div>
            </div>
          </div>
        ))}
        <Button onClick={refresh} variant="outline" size="sm">Refresh</Button>
      </main>
    </div>
  );
}
