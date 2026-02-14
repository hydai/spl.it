import type { Suggestion, TLDData } from "../types";
import { normalizeInput } from "../scoring";
import { POPULAR_TLDS } from "../tld";
import { detectDomainHack } from "./domainHack";
import suffixes from "@/data/suffixes.json";

/**
 * Strategy C: Suffix Addition
 * Appends common suffixes to the input word and finds domain hacks on the combined string.
 * Also generates simple word+suffix.tld suggestions for popular TLDs.
 */
export function findSuffixSuggestions(
  input: string,
  tldData: TLDData
): Suggestion[] {
  const normalized = normalizeInput(input);
  if (normalized.length < 1) return [];

  const results: Suggestion[] = [];

  for (const suffix of suffixes as string[]) {
    const combined = normalized + suffix;

    // Find domain hacks on the combined word+suffix
    const hacks = detectDomainHack(combined, tldData);
    for (const hack of hacks) {
      results.push({
        ...hack,
        strategy: "suffix",
        score: Math.max(Math.round(hack.score * 0.9), 10),
      });
    }

    // Also suggest word+suffix with popular TLDs
    for (const tld of POPULAR_TLDS) {
      if (combined.endsWith(tld)) continue;

      const score = scoreSuffixSuggestion(normalized, suffix, tld);
      results.push({
        domain: `${combined}.${tld}`,
        tld,
        prefix: combined,
        strategy: "suffix",
        score,
      });
    }
  }

  return results;
}

function scoreSuffixSuggestion(
  word: string,
  suffix: string,
  tld: string
): number {
  let score = 30; // base score for suffix suggestions

  const combined = word + suffix;

  // Shorter combined names score higher
  if (combined.length <= 6) {
    score += 20;
  } else if (combined.length <= 10) {
    score += 10;
  }

  // Popular TLD bonus
  if (POPULAR_TLDS.has(tld)) {
    score += 10;
  }

  // Short, punchy suffixes
  if (suffix.length <= 3) {
    score += 10;
  }

  // Meaningful tech/product suffixes get a bonus
  if (["app", "hub", "lab", "kit", "hq"].includes(suffix)) {
    score += 5;
  }

  // "com" gets extra bonus
  if (tld === "com") {
    score += 10;
  } else if (tld === "io" || tld === "dev" || tld === "app") {
    score += 5;
  }

  return Math.min(score, 100);
}
