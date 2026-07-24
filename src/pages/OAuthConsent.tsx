import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type AuthorizationDetails = {
  client?: { name?: string; client_id?: string };
  redirect_uri?: string;
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};

// The @supabase/supabase-js `auth.oauth` namespace is still beta and not in
// the public type surface. Type-cast locally so we can call the three helpers
// without patching the SDK.
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?redirect=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  if (error) {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-xl font-semibold mb-2">Authorization error</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
      </main>
    );
  }
  if (!details) {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <p className="text-sm text-muted-foreground">Loading authorization request…</p>
      </main>
    );
  }

  const clientName = details.client?.name ?? "an app";
  const scopes = (details.scope ?? "").split(/\s+/).filter(Boolean);

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Connect {clientName} to TrendFlux Digital
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {clientName} will be able to call this app's enabled tools while you are signed in.
        </p>

        {details.redirect_uri && (
          <p className="mt-3 text-xs text-muted-foreground break-all">
            Redirect: <code>{details.redirect_uri}</code>
          </p>
        )}

        {scopes.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-medium text-foreground/70 mb-1">Requested access</div>
            <ul className="text-sm list-disc pl-5 space-y-1">
              {scopes.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          This does not bypass this app's permissions or backend policies.
        </p>

        <div className="mt-6 flex gap-3">
          <Button onClick={() => decide(true)} disabled={busy} className="flex-1">
            Approve
          </Button>
          <Button
            onClick={() => decide(false)}
            disabled={busy}
            variant="outline"
            className="flex-1"
          >
            Cancel connection
          </Button>
        </div>
      </div>
    </main>
  );
}