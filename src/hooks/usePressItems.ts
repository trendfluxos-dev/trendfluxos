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

// Hard upper bound so the table can't accidentally ship hundreds of rows to
// every page that mounts this hook. If we ever exceed this, switch to
// cursor-based pagination — surfacing more than 200 press mentions in a
// single render is itself a UX bug.
const PRESS_LIMIT = 200;

export function usePressItems(includeUnpublished = false) {
  const [items, setItems] = useState<PressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    // Explicit column list: keeps the payload small (the table may grow new
    // internal columns later that the UI doesn't need) and documents the
    // contract this hook depends on.
    let q = supabase
      .from("press_items")
      .select("id, outlet, headline, href, context, sort_order, published, created_at")
      .order("sort_order", { ascending: true })
      .limit(PRESS_LIMIT);
    if (!includeUnpublished) q = q.eq("published", true);
    const { data, error: err } = await q;
    if (err) {
      setError(err.message);
    } else if (data) {
      setItems(data as PressItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [includeUnpublished]);

  return { items, loading, error, refresh };
}
