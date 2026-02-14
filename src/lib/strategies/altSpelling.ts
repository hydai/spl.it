import type { Suggestion, TLDData } from "../types";
import { normalizeInput } from "../scoring";
import { POPULAR_TLDS } from "../tld";
import { detectDomainHack } from "./domainHack";

interface SubRule {
  from: string;
  to: string;
}

const SUBSTITUTION_RULES: SubRule[] = [
  { from: "ph", to: "f" },
  { from: "f", to: "ph" },
  { from: "y", to: "i" },
  { from: "i", to: "y" },
  { from: "c", to: "k" },
  { from: "s", to: "z" },
  { from: "z", to: "s" },
  { from: "cks", to: "x" },
  { from: "ck", to: "k" },
  { from: "oo", to: "u" },
  { from: "ee", to: "i" },
  { from: "ight", to: "ite" },
  { from: "ite", to: "ight" },
];

function generateSingleSubstitutions(word: string): Set<string> {
  const variants = new Set<string>();

  for (const rule of SUBSTITUTION_RULES) {
    let idx = 0;
    while (idx <= word.length - rule.from.length) {
      const found = word.indexOf(rule.from, idx);
      if (found === -1) break;

      const variant =
        word.slice(0, found) + rule.to + word.slice(found + rule.from.length);

      if (variant !== word && variant.length >= 2) {
        variants.add(variant);
      }

      // Move past this occurrence to find next (single substitution only)
      // But we add each single-substitution variant independently
      idx = found + 1;
    }
  }

  return variants;
}

function scoreAltSpelling(
  variant: string,
  tld: string,
  isDomainHack: boolean
): number {
  let score = 40;
  if (POPULAR_TLDS.has(tld)) score += 5;
  if (isDomainHack) score += 10;
  if (variant.length <= 6) score += 5;
  else if (variant.length <= 10) score += 2;
  return Math.min(score, 100);
}

export function findAltSpellingSuggestions(
  input: string,
  tldData: TLDData
): Suggestion[] {
  const normalized = normalizeInput(input);
  if (normalized.length < 2) return [];

  const variants = generateSingleSubstitutions(normalized);
  if (variants.size === 0) return [];

  const results: Suggestion[] = [];
  const popularTldList = Array.from(POPULAR_TLDS);

  for (const variant of variants) {
    // Pair with popular TLDs
    for (const tld of popularTldList) {
      results.push({
        domain: `${variant}.${tld}`,
        tld,
        prefix: variant,
        strategy: "altSpelling",
        score: scoreAltSpelling(variant, tld, false),
      });
    }

    // Check for domain hack potential
    const hacks = detectDomainHack(variant, tldData);
    for (const hack of hacks) {
      results.push({
        ...hack,
        strategy: "altSpelling",
        score: scoreAltSpelling(hack.prefix, hack.tld, true),
      });
    }
  }

  // Sort and cap
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 100);
}
