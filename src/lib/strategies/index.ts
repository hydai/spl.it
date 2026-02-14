import type { Suggestion, TLDData } from "../types";
import { deduplicateSuggestions, capSuggestions } from "../scoring";
import { findDomainHacks } from "./domainHack";
import { findPrefixSuggestions } from "./prefix";
import { findSuffixSuggestions } from "./suffix";
import { findAbbreviationSuggestions } from "./abbreviation";
import { findAltSpellingSuggestions } from "./altSpelling";
import { findWordPlaySuggestions } from "./wordPlay";

export function runAllStrategies(input: string, tldData: TLDData): Suggestion[] {
  const all: Suggestion[] = [
    ...findDomainHacks(input, tldData),
    ...findPrefixSuggestions(input, tldData),
    ...findSuffixSuggestions(input, tldData),
    ...findAbbreviationSuggestions(input, tldData),
    ...findAltSpellingSuggestions(input, tldData),
    ...findWordPlaySuggestions(input, tldData),
  ];

  return capSuggestions(deduplicateSuggestions(all));
}
