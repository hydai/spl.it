import type { Suggestion, TLDData } from "../types";
import { normalizeInput, scoreDomainHack } from "../scoring";
import { POPULAR_TLDS } from "../tld";

const MAX_MULTI_LEVEL_DEPTH = 3;

/**
 * Detect single-level domain hacks for a word.
 * Checks if the word ends with any known TLD, yielding prefix.tld pairs.
 */
export function detectDomainHack(
  word: string,
  tldData: TLDData
): Suggestion[] {
  const results: Suggestion[] = [];
  const normalized = word.toLowerCase();

  if (normalized.length < 2) return results;

  // Try each possible TLD length (from longest to shortest for better matches)
  const lengths = Array.from(tldData.byLength.keys()).sort((a, b) => b - a);

  for (const len of lengths) {
    if (len >= normalized.length) continue; // prefix must be at least 1 char

    const suffix = normalized.slice(-len);
    const tlds = tldData.byLength.get(len);
    if (!tlds) continue;

    if (tldData.set.has(suffix)) {
      const prefix = normalized.slice(0, -len);
      if (prefix.length === 0) continue;

      const score = scoreDomainHack(prefix, suffix, normalized, POPULAR_TLDS);

      results.push({
        domain: `${prefix}.${suffix}`,
        tld: suffix,
        prefix,
        strategy: "domainHack",
        score,
      });
    }
  }

  return results;
}

/**
 * Recursively detect multi-level domain hacks.
 * e.g., "delicious" -> "del.icio.us" (prefix "delicio" ends with "io", and prefix "del" with remaining)
 */
function detectMultiLevelHacks(
  word: string,
  tldData: TLDData,
  depth: number
): Suggestion[] {
  if (depth >= MAX_MULTI_LEVEL_DEPTH || word.length < 2) return [];

  const results: Suggestion[] = [];
  const lengths = Array.from(tldData.byLength.keys()).sort((a, b) => b - a);

  for (const len of lengths) {
    if (len >= word.length) continue;

    const suffix = word.slice(-len);
    if (!tldData.set.has(suffix)) continue;

    const prefix = word.slice(0, -len);
    if (prefix.length === 0) continue;

    // Try to find a domain hack in the prefix portion
    const innerHacks = detectMultiLevelHacks(prefix, tldData, depth + 1);

    for (const inner of innerHacks) {
      // Build multi-level domain: inner.domain already has dots, append this level's TLD
      const domain = `${inner.domain}.${suffix}`;
      // Score based on the outermost hack; penalize slightly for complexity
      const score = Math.max(
        Math.round(inner.score * 0.85),
        10
      );

      results.push({
        domain,
        tld: suffix,
        prefix: inner.prefix,
        strategy: "domainHack",
        score,
        isMultiLevel: true,
      });
    }

    // Single-level hack at this depth also counts as a base case for recursion
    if (depth > 0) {
      const score = scoreDomainHack(prefix, suffix, word, POPULAR_TLDS);
      results.push({
        domain: `${prefix}.${suffix}`,
        tld: suffix,
        prefix,
        strategy: "domainHack",
        score,
      });
    }
  }

  return results;
}

/**
 * Main entry point: find all domain hack suggestions for the user input.
 */
export function findDomainHacks(
  input: string,
  tldData: TLDData
): Suggestion[] {
  const normalized = normalizeInput(input);
  if (normalized.length < 2) return [];

  // Single-level domain hacks
  const singleLevel = detectDomainHack(normalized, tldData);

  // Multi-level domain hacks (recursive, starting at depth 0)
  const multiLevel = detectMultiLevelHacks(normalized, tldData, 0);

  return [...singleLevel, ...multiLevel];
}
