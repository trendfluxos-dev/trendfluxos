import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type EdtechRole = "student" | "teacher" | "tutor" | "admin" | "finance";

/**
 * Resolve the signed-in user's edtech roles via `current_user_has_role`.
 * Returns a flat array; `null` while loading; `[]` if signed-out.
 */
export function useCurrentRoles(): EdtechRole[] | null {
  const [roles, setRoles] = useState<EdtechRole[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) {
        if (!cancelled) setRoles([]);
        return;
      }
      const probe: EdtechRole[] = ["admin", "teacher", "tutor", "student", "finance"];
      const found: EdtechRole[] = [];
      for (const r of probe) {
        const { data } = await supabase.rpc("current_user_has_role", {
          _role: r as never,
        });
        if (data === true) found.push(r);
      }
      if (!cancelled) setRoles(found);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return roles;
}

export function hasAny(roles: EdtechRole[] | null, want: EdtechRole[]) {
  if (!roles) return false;
  return want.some((r) => roles.includes(r));
}