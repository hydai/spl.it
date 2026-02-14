import type { Suggestion, TLDData } from "../types";
import { normalizeInput } from "../scoring";
import { POPULAR_TLDS } from "../tld";
import combiningWords from "@/data/combining-words.json";

const combiners = combiningWords as string[];

function scoreWordPlay(
  combo: string,
  tld: string,
  isAlliterative: boolean,
  isRhyming: boolean
): number {
  let score = 35;
  if (isAlliterative) score += 10;
  if (isRhyming) score += 5;
  if (POPULAR_TLDS.has(tld)) score += 5;
  // Shorter combos are more memorable
  if (combo.length <= 8) score += 5;
  else if (combo.length <= 12) score += 2;
  return Math.min(score, 100);
}

function getEndSound(word: string): string {
  // Simple heuristic: last 2-3 chars for rhyme detection
  if (word.length >= 3) return word.slice(-3);
  if (word.length >= 2) return word.slice(-2);
  return word;
}

function rhymes(a: string, b: string): boolean {
  if (a === b) return false;
  const endA = getEndSound(a);
  const endB = getEndSound(b);
  return endA === endB;
}

export function findWordPlaySuggestions(
  input: string,
  tldData: TLDData
): Suggestion[] {
  const word = normalizeInput(input);
  if (word.length === 0) return [];

  const firstChar = word[0];
  const popularTldList = Array.from(POPULAR_TLDS);
  const results: Suggestion[] = [];

  // Pre-classify combiners
  const alliterativeCombos: string[] = [];
  const rhymingCombos: string[] = [];
  const regularCombos: string[] = [];

  for (const c of combiners) {
    if (c === word) continue;
    if (c[0] === firstChar) {
      alliterativeCombos.push(c);
    } else if (rhymes(word, c)) {
      rhymingCombos.push(c);
    } else {
      regularCombos.push(c);
    }
  }

  // Helper to add suggestions for a combo + tld
  function addSuggestion(
    prefix: string,
    tld: string,
    isAlliterative: boolean,
    isRhyming: boolean
  ) {
    const score = scoreWordPlay(prefix, tld, isAlliterative, isRhyming);
    results.push({
      domain: `${prefix}.${tld}`,
      tld,
      prefix,
      strategy: "wordPlay",
      score,
    });
  }

  // Generate combos: {input}{combiner} and {combiner}{input}
  function generateForCombiners(
    combinerList: string[],
    isAlliterative: boolean,
    isRhyming: boolean,
    maxPerDirection: number
  ) {
    let countFwd = 0;
    let countRev = 0;

    for (const c of combinerList) {
      const fwd = `${word}${c}`;
      const rev = `${c}${word}`;

      if (countFwd < maxPerDirection) {
        for (const tld of popularTldList) {
          addSuggestion(fwd, tld, isAlliterative, isRhyming);
        }
        countFwd++;
      }

      if (countRev < maxPerDirection) {
        for (const tld of popularTldList) {
          addSuggestion(rev, tld, isAlliterative, isRhyming);
        }
        countRev++;
      }
    }
  }

  // Alliterative combos get priority — all of them (typically few)
  generateForCombiners(alliterativeCombos, true, false, 50);

  // Rhyming combos
  generateForCombiners(rhymingCombos, false, true, 30);

  // Regular combos — pick shorter ones first for better names
  const sortedRegular = regularCombos
    .slice()
    .sort((a, b) => a.length - b.length);
  generateForCombiners(sortedRegular, false, false, 20);

  // Sort by score descending and cap
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 100);
}
