// Tunable ranking weights for the command palette fuzzy search.
// Higher weight = that field contributes more to the final score,
// so matches there float to the top faster.
//
// Tip: bump `label` if you want exact page-name matches to dominate,
// or bump `keywords` to prioritize intent words (e.g. "login" → Sign In).
export type RankWeights = {
  label: number;
  keywords: number;
  section: number; // page "type" / group
  path: number;
};

export const DEFAULT_RANK_WEIGHTS: RankWeights = {
  label: 1.6,
  keywords: 1.1,
  section: 0.7,
  path: 0.5,
};

// Mutable runtime override — change these at runtime to retune without a rebuild.
export const rankWeights: RankWeights = { ...DEFAULT_RANK_WEIGHTS };

export function setRankWeights(partial: Partial<RankWeights>) {
  Object.assign(rankWeights, partial);
}