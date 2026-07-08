import { supabase } from "@/integrations/supabase/client";
import {
  BDJOBS_PROFILE_SLUG,
  DEFAULT_BDJOBS_PROFILE,
  type BdjobsProfileData,
} from "@/data/bdjobsProfileDefault";

/**
 * Load the live Bdjobs profile from `site_profile_data`. Falls back to the
 * bundled default when the row is missing or the request errors — the public
 * page must always render.
 */
export async function fetchBdjobsProfile(): Promise<{
  data: BdjobsProfileData;
  updatedAt: string | null;
  isRemote: boolean;
}> {
  try {
    const { data, error } = await supabase
      .from("site_profile_data")
      .select("data, updated_at")
      .eq("slug", BDJOBS_PROFILE_SLUG)
      .maybeSingle();

    if (error || !data) {
      return {
        data: DEFAULT_BDJOBS_PROFILE,
        updatedAt: null,
        isRemote: false,
      };
    }

    return {
      data: data.data as unknown as BdjobsProfileData,
      updatedAt: data.updated_at,
      isRemote: true,
    };
  } catch {
    return {
      data: DEFAULT_BDJOBS_PROFILE,
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
  const { data, error } = await supabase
    .from("site_profile_data")
    .upsert(
      {
        slug: BDJOBS_PROFILE_SLUG,
        // `data` is stored as JSONB; cast for the generated Insert type.
        data: payload as unknown as Record<string, unknown>,
      },
      { onConflict: "slug" },
    )
    .select("updated_at")
    .single();

  if (error) throw error;
  return data.updated_at;
}
