import type { Suggestion, TLDData } from "../types";
import { normalizeInput } from "../scoring";
import { POPULAR_TLDS } from "../tld";
import { detectDomainHack } from "./domainHack";

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

function dropVowels(word: string): string {
  // Keep first char even if it's a vowel
  if (word.length === 0) return "";
  return word[0] + [...word.slice(1)].filter((ch) => !VOWELS.has(ch)).join("");
}

function getConsonantCluster(word: string): string {
  // Extract leading consonant cluster + trailing consonant cluster
  let leading = "";
  for (const ch of word) {
    if (VOWELS.has(ch)) break;
    leading += ch;
  }
  let trailing = "";
  for (let i = word.length - 1; i >= 0; i--) {
    if (VOWELS.has(word[i])) break;
    trailing = word[i] + trailing;
  }
  if (leading === trailing) return leading;
  const combined = leading + trailing;
  return combined.length >= 2 ? combined : "";
}

function getInitials(input: string): string {
  // Multi-word: take first letter of each word
  const words = input
    .trim()
    .split(/[\s\-_]+/)
    .filter((w) => w.length > 0);
  if (words.length < 2) return "";
  return words.map((w) => w[0]).join("");
}

function scoreAbbreviation(
  abbrev: string,
  tld: string,
  isDomainHack: boolean
): number {
  let score = 40;
  if (POPULAR_TLDS.has(tld)) score += 5;
  if (isDomainHack) score += 10;
  // Shorter abbreviations are snappier
  if (abbrev.length <= 4) score += 10;
  else if (abbrev.length <= 6) score += 5;
  return Math.min(score, 100);
}

function addWithTlds(
  abbrev: string,
  tldData: TLDData,
  results: Suggestion[]
): void {
  if (abbrev.length < 2) return;

  // Pair with popular TLDs
  const popularTldList = Array.from(POPULAR_TLDS);
  for (const tld of popularTldList) {
    results.push({
      domain: `${abbrev}.${tld}`,
      tld,
      prefix: abbrev,
      strategy: "abbreviation",
      score: scoreAbbreviation(abbrev, tld, false),
    });
  }

  // Check for domain hack potential
  const hacks = detectDomainHack(abbrev, tldData);
  for (const hack of hacks) {
    results.push({
      ...hack,
      strategy: "abbreviation",
      score: scoreAbbreviation(hack.prefix, hack.tld, true),
    });
  }
}

export function findAbbreviationSuggestions(
  input: string,
  tldData: TLDData
): Suggestion[] {
  const normalized = normalizeInput(input);
  if (normalized.length < 2) return [];

  const results: Suggestion[] = [];
  const seen = new Set<string>();

  function addUnique(abbrev: string) {
    if (abbrev.length < 2 || abbrev === normalized || seen.has(abbrev)) return;
    seen.add(abbrev);
    addWithTlds(abbrev, tldData, results);
  }

  // 1. Drop vowels
  addUnique(dropVowels(normalized));

  // 2. First N chars
  for (const n of [3, 4, 5, 6]) {
    if (n < normalized.length) {
      addUnique(normalized.slice(0, n));
    }
  }

  // 3. Multi-word initials (use raw input for word boundaries)
  const initials = getInitials(input);
  if (initials) {
    addUnique(initials.toLowerCase());
  }

  // 4. Consonant cluster
  const cluster = getConsonantCluster(normalized);
  addUnique(cluster);

  // Sort and cap
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 100);
}
