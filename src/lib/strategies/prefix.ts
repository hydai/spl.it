import type { Suggestion, TLDData } from "../types";
import { normalizeInput, scoreDomainHack } from "../scoring";
import { POPULAR_TLDS } from "../tld";
import { detectDomainHack } from "./domainHack";
import prefixes from "@/data/prefixes.json";

/**
 * Strategy B: Prefix Addition
 * Prepends common prefixes to the input word and finds domain hacks on the combined string.
 * Also generates simple prefix+word.tld suggestions for popular TLDs.
 */
export function findPrefixSuggestions(
  input: string,
  tldData: TLDData
): Suggestion[] {
  const normalized = normalizeInput(input);
  if (normalized.length < 1) return [];

  const results: Suggestion[] = [];

  for (const prefix of prefixes as string[]) {
    const combined = prefix + normalized;

    // Find domain hacks on the combined prefix+word
    const hacks = detectDomainHack(combined, tldData);
    for (const hack of hacks) {
      results.push({
        ...hack,
        strategy: "prefix",
        // Slightly lower score since it's a prefix addition, not a pure hack
        score: Math.max(Math.round(hack.score * 0.9), 10),
      });
    }

    // Also suggest prefix+word with popular TLDs
    for (const tld of POPULAR_TLDS) {
      // Skip if combined word already ends with this TLD (already covered by domain hack)
      if (combined.endsWith(tld)) continue;

      const score = scorePrefixSuggestion(prefix, normalized, tld);
      results.push({
        domain: `${combined}.${tld}`,
        tld,
        prefix: combined,
        strategy: "prefix",
        score,
      });
    }
  }

  return results;
}

function scorePrefixSuggestion(
  prefix: string,
  word: string,
  tld: string
): number {
  let score = 30; // base score for prefix suggestions

  const combined = prefix + word;

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

  // Short, punchy prefixes
  if (prefix.length <= 3) {
    score += 10;
  }

  // "com" and "io" get extra bonus for prefix strategies
  if (tld === "com") {
    score += 10;
  } else if (tld === "io" || tld === "dev" || tld === "app") {
    score += 5;
  }

  return Math.min(score, 100);
}
