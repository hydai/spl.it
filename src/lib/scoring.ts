import type { Suggestion } from "./types";

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

export function normalizeInput(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function hasVowel(str: string): boolean {
  return [...str].some((ch) => VOWELS.has(ch));
}

export function isCleanBoundary(prefix: string, tld: string, full: string): boolean {
  if (prefix.length === 0) return false;
  const lastPrefixChar = prefix[prefix.length - 1];
  const firstTldChar = tld[0];
  // Clean boundary: not the same char repeated, or a natural syllable break
  if (lastPrefixChar === firstTldChar) return false;
  // Consonant-vowel or vowel-consonant transitions are clean
  const lastIsVowel = VOWELS.has(lastPrefixChar);
  const firstIsVowel = VOWELS.has(firstTldChar);
  if (lastIsVowel !== firstIsVowel) return true;
  // Both consonants or both vowels - still okay if it looks natural
  return full.length <= 12;
}

export function scoreDomainHack(
  prefix: string,
  tld: string,
  fullWord: string,
  popularTlds: Set<string>
): number {
  let score = 50; // base score

  // Boundary quality (3x weight)
  if (isCleanBoundary(prefix, tld, fullWord)) {
    score += 30;
  }

  // Pronounceability (2x weight)
  if (hasVowel(prefix) || prefix.length <= 2) {
    score += 20;
  }

  // TLD familiarity (1x weight)
  if (popularTlds.has(tld)) {
    score += 10;
  }

  // Shorter prefix bonus (1x weight)
  if (prefix.length <= 4) {
    score += 10;
  } else if (prefix.length <= 6) {
    score += 5;
  }

  return Math.min(score, 100);
}

export function deduplicateSuggestions(suggestions: Suggestion[]): Suggestion[] {
  const seen = new Map<string, Suggestion>();
  for (const s of suggestions) {
    const key = `${s.prefix}.${s.tld}`;
    const existing = seen.get(key);
    if (!existing || s.score > existing.score) {
      seen.set(key, s);
    }
  }
  return Array.from(seen.values());
}

export function capSuggestions(suggestions: Suggestion[], max = 500): Suggestion[] {
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, max);
}
