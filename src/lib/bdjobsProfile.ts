import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import {
  BDJOBS_PROFILE_SLUG,
  DEFAULT_BDJOBS_PROFILE,
  type BdjobsProfileData,
} from "@/data/bdjobsProfileDefault";
import { assertValidBdjobsProfile } from "@/lib/bdjobsProfileSchema";

/**
 * Load the live Bdjobs profile from `site_profile_data`. Falls back to the
 * bundled default when the row is missing or the request errors — the public
 * page must always render.
 */
export async function fetchBdjobsProfile(): Promise<{
  data: BdjobsProfileData;
  updatedAt: string | null;
  isRemote: boolean;
  validationError?: string[];
}> {
  // The bundled default MUST always be valid — fail loudly in dev if not.
  const validatedDefault = assertValidBdjobsProfile(DEFAULT_BDJOBS_PROFILE);
  try {
    const { data, error } = await supabase
      .from("site_profile_data")
      .select("data, updated_at")
      .eq("slug", BDJOBS_PROFILE_SLUG)
      .maybeSingle();

    if (error || !data) {
      return {
        data: validatedDefault,
        updatedAt: null,
        isRemote: false,
      };
    }

    try {
      const validated = assertValidBdjobsProfile(data.data);
      return {
        data: validated,
        updatedAt: data.updated_at,
        isRemote: true,
      };
    } catch (e) {
      const issues =
        e && typeof e === "object" && "issues" in e
          ? ((e as { issues: string[] }).issues ?? [])
          : [String(e)];
      // Fail fast: return the safe default and the issues so the UI can flag it.
      return {
        data: validatedDefault,
        updatedAt: data.updated_at,
        isRemote: false,
        validationError: issues,
      };
    }
  } catch {
    return {
      data: validatedDefault,
      updatedAt: null,
      isRemote: false,
    };
  }
}

/**
 * Persist the edited Bdjobs profile. RLS enforces the admin gate; this call
 * will error for non-admin sessions. Returns the new `updated_at`.
 */
export async function saveBdjobsProfile(payload: BdjobsProfileData): Promise<string> {
  // Fail fast BEFORE writing so admins can't publish an invalid profile.
  assertValidBdjobsProfile(payload);
  const { data, error } = await supabase
    .from("site_profile_data")
    .upsert(
      {
        slug: BDJOBS_PROFILE_SLUG,
        // `data` is stored as JSONB; cast to the generated Json type.
        data: payload as unknown as Json,
      },
      { onConflict: "slug" },
    )
    .select("updated_at")
    .single();

  if (error) throw error;
  return data.updated_at;
}
