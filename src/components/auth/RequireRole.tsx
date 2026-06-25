import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Role-gated route wrapper.
 *
 * Renders `children` only when the current session belongs to a user that
 * holds *any* of the provided `roles`. Authorization is checked via the
 * `current_user_has_role` RPC (SECURITY DEFINER, scoped to `auth.uid()`),
 * so the gate cannot be bypassed by tampering with client state.
 *
 * The RPC check is a UX/redirect layer — the authoritative protection for
 * data is RLS on the underlying tables. This component just keeps the UI
 * coherent and avoids flashing admin chrome to unauthorized users.
 *
 * @param roles    Allowed role names (e.g. ["admin", "editor"]).
 * @param children The protected view.
 * @param fallback Optional custom redirect (defaults to "/auth").
 */
export type AppRole =
  | "admin"
  | "editor"
  | "user"
  | "student"
  | "teacher"
  | "tutor"
  | "finance";

interface RequireRoleProps {
  roles: AppRole[];
  children: ReactNode;
  fallback?: string;
}

export default function RequireRole({ roles, children, fallback = "/auth" }: RequireRoleProps) {
  const navigate = useNavigate();
  const [state, setState] = useState<"checking" | "allowed" | "denied">("checking");

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (!cancelled) navigate(fallback, { replace: true });
        return;
      }

      // Probe each role via the security-definer RPC. Any match grants access.
      for (const role of roles) {
        const { data, error } = await supabase.rpc(
          "current_user_has_role",
          { _role: role as never },
        );
        if (!error && data === true) {
          if (!cancelled) setState("allowed");
          return;
        }
      }

      if (!cancelled) {
        setState("denied");
        navigate("/", { replace: true });
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, [roles, navigate, fallback]);

  if (state !== "allowed") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}