import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

type Method = "bkash" | "nagad" | "rocket";
const METHODS: { key: Method; label: string; settingKey: string }[] = [
  { key: "bkash", label: "bKash", settingKey: "receive_number_bkash" },
  { key: "nagad", label: "Nagad", settingKey: "receive_number_nagad" },
  { key: "rocket", label: "Rocket", settingKey: "receive_number_rocket" },
];

const BD_PHONE = /^01[3-9]\d{8}$/;

export default function ReceiveNumbersPanel() {
  const [values, setValues] = useState<Record<Method, string>>({
    bkash: "",
    nagad: "",
    rocket: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Method | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in(
          "key",
          METHODS.map((m) => m.settingKey),
        );
      if (error) {
        toast.error(error.message);
      } else {
        const next = { bkash: "", nagad: "", rocket: "" } as Record<Method, string>;
        for (const row of data ?? []) {
          const m = METHODS.find((x) => x.settingKey === row.key);
          if (m && typeof row.value === "string") next[m.key] = row.value;
        }
        setValues(next);
      }
      setLoading(false);
    })();
  }, []);

  const save = async (m: Method) => {
    const raw = values[m].trim();
    if (!BD_PHONE.test(raw)) {
      toast.error("Enter a valid 11-digit BD mobile number (e.g. 01756004037)");
      return;
    }
    setSaving(m);
    const settingKey = METHODS.find((x) => x.key === m)!.settingKey;
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: settingKey, value: raw }, { onConflict: "key" });
    setSaving(null);
    if (error) return toast.error(error.message);
    toast.success(`${m.toUpperCase()} receive number saved: ${raw}`);
  };

  return (
    <section className="rounded-xl glass p-5 space-y-4">
      <div>
        <h2 className="font-display text-lg font-bold">Payment Receive Numbers</h2>
        <p className="text-xs text-foreground/60">
          Numbers students Send Money to for tutor bookings. Changes apply immediately (no redeploy).
        </p>
      </div>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-gold" />
      ) : (
        <div className="space-y-3">
          {METHODS.map((m) => (
            <div key={m.key} className="flex flex-wrap items-end gap-3 rounded-lg border border-border/40 px-3 py-3">
              <div className="flex-1 min-w-[180px]">
                <Label htmlFor={`recv-${m.key}`}>{m.label}</Label>
                <Input
                  id={`recv-${m.key}`}
                  inputMode="numeric"
                  placeholder="01XXXXXXXXX"
                  value={values[m.key]}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [m.key]: e.target.value.replace(/\D/g, "").slice(0, 11) }))
                  }
                />
              </div>
              <Button size="sm" onClick={() => save(m.key)} disabled={saving === m.key}>
                {saving === m.key ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Save
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}