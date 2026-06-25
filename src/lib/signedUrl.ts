import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SignedBucket = "voice-lectures" | "lesson-pdfs";

/**
 * Mint a short-lived signed URL via the `get-signed-url` edge function.
 * Authorization is enforced server-side (owner folder for voice-lectures,
 * confirmed enrollment for lesson-pdfs, admins always allowed).
 */
export async function getSignedUrl(
  bucket: SignedBucket,
  path: string,
  expiresIn = 300,
): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ signedUrl: string }>(
    "get-signed-url",
    { body: { bucket, path, expiresIn } },
  );
  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Failed to sign URL");
  }
  return data.signedUrl;
}

/**
 * React hook variant — refreshes the URL ~30s before it expires so long
 * viewing sessions never break.
 */
export function useSignedUrl(
  bucket: SignedBucket,
  path: string | null | undefined,
  expiresIn = 300,
) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const refresh = async () => {
      try {
        const signed = await getSignedUrl(bucket, path, expiresIn);
        if (cancelled) return;
        setUrl(signed);
        setError(null);
        timer = setTimeout(refresh, Math.max((expiresIn - 30) * 1000, 15_000));
      } catch (e) {
        if (!cancelled) setError(e as Error);
      }
    };
    refresh();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [bucket, path, expiresIn]);

  return { url, error };
}