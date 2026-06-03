import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PressItem = {
  id?: string;
  outlet: string;
  headline: string;
  href: string;
  context: string;
  sort_order?: number;
  published?: boolean;
  created_at?: string;
};

export function usePressItems(includeUnpublished = false) {
  const [items, setItems] = useState<PressItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    let q = supabase.from("press_items").select("*").order("sort_order", { ascending: true });
    if (!includeUnpublished) q = q.eq("published", true);
    const { data } = await q;
    if (data) setItems(data as PressItem[]);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [includeUnpublished]);

  return { items, loading, refresh };
}
