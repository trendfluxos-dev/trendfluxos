// Lightweight subsequence fuzzy matcher with score + match indices.
// Higher score = better match. Returns null when query doesn't match.
export type FuzzyMatch = { score: number; indices: number[] };

export function fuzzyMatch(text: string, query: string): FuzzyMatch | null {
  if (!query) return { score: 0, indices: [] };
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  const indices: number[] = [];
  let ti = 0;
  let qi = 0;
  let score = 0;
  let prevMatch = -2;
  let consecutive = 0;

  while (ti < t.length && qi < q.length) {
    if (t[ti] === q[qi]) {
      indices.push(ti);
      // Bonuses
      if (ti === 0 || /[\s\-_/.]/.test(t[ti - 1])) score += 8; // word start
      if (ti === prevMatch + 1) {
        consecutive += 1;
        score += 5 + consecutive * 2; // consecutive run
      } else {
        consecutive = 0;
      }
      score += 2; // base hit
      prevMatch = ti;
      qi += 1;
    } else {
      score -= 1; // gap penalty
    }
    ti += 1;
  }
  if (qi < q.length) return null;
  // Reward shorter strings
  score += Math.max(0, 20 - text.length);
  return { score, indices };
}

export function highlight(text: string, indices: number[]) {
  if (!indices.length) return [{ text, hit: false }];
  const set = new Set(indices);
  const parts: { text: string; hit: boolean }[] = [];
  let buf = "";
  let bufHit = false;
  for (let i = 0; i < text.length; i++) {
    const hit = set.has(i);
    if (i === 0) {
      buf = text[i];
      bufHit = hit;
      continue;
    }
    if (hit === bufHit) buf += text[i];
    else {
      parts.push({ text: buf, hit: bufHit });
      buf = text[i];
      bufHit = hit;
    }
  }
  parts.push({ text: buf, hit: bufHit });
  return parts;
}
