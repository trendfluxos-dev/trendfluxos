import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  CONSENT_KEY_LIVE,
  CONSENT_KEY_PREVIEW,
} from "@/hooks/useConsentBannerEnabled";

type Settings = Record<string, boolean>;
const KEYS = [CONSENT_KEY_PREVIEW, CONSENT_KEY_LIVE] as const;
const LABELS: Record<string, string> = {
  [CONSENT_KEY_PREVIEW]: "Preview (lovable.app / localhost)",
  [CONSENT_KEY_LIVE]: "Live (custom domain)",
};

export default function SiteSettingsPanel() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", KEYS as unknown as string[]);
      if (error) {
        toast.error(error.message);
      } else {
        const map: Settings = {};
        for (const row of data ?? []) map[row.key] = row.value === true;
        setSettings(map);
      }
      setLoading(false);
    })();
  }, []);

  const toggle = async (key: string, next: boolean) => {
    setSaving(key);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value: next }, { onConflict: "key" });
    setSaving(null);
    if (error) return toast.error(error.message);
    setSettings((s) => ({ ...s, [key]: next }));
    toast.success(`${LABELS[key]} consent banner ${next ? "enabled" : "disabled"}`);
  };

  return (
    <section className="rounded-xl glass p-5 space-y-4">
      <div>
        <h2 className="font-display text-lg font-bold">Cookie Consent Banner</h2>
        <p className="text-xs text-foreground/60">
          Enable or disable the banner per environment without redeploying.
        </p>
      </div>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-gold" />
      ) : (
        <div className="space-y-3">
          {KEYS.map((key) => (
            <div key={key} className="flex items-center justify-between gap-4 rounded-lg border border-border/40 px-3 py-2">
              <span className="text-sm">{LABELS[key]}</span>
              <div className="flex items-center gap-2">
                {saving === key && <Loader2 className="h-3 w-3 animate-spin text-foreground/50" />}
                <Switch
                  checked={!!settings[key]}
                  onCheckedChange={(v) => toggle(key, v)}
                  disabled={saving === key}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
