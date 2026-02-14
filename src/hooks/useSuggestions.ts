"use client";

import { useState, useEffect, useMemo } from "react";
import type { Suggestion, FilterState, SortOption, StrategyName } from "@/lib/types";
import { tldData } from "@/lib/tld";
import { getTldType } from "@/lib/tld";
import { runAllStrategies } from "@/lib/strategies";

const DEFAULT_FILTERS: FilterState = {
  tldType: ["ccTLD", "gTLD", "sTLD"],
  strategy: [
    "domainHack",
    "prefix",
    "suffix",
    "abbreviation",
    "altSpelling",
    "wordPlay",
  ] as StrategyName[],
  tldLengthMin: 0,
  tldLengthMax: 99,
  searchWithin: "",
};

export function useSuggestions(query: string) {
  const [allSuggestions, setAllSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>("score");

  // Generate suggestions when query changes
  useEffect(() => {
    if (!query || query.length < 2) {
      setAllSuggestions([]);
      return;
    }

    setIsLoading(true);

    // Use requestAnimationFrame to avoid blocking the UI thread
    const raf = requestAnimationFrame(() => {
      const results = runAllStrategies(query, tldData);
      setAllSuggestions(results);
      setIsLoading(false);
    });

    return () => cancelAnimationFrame(raf);
  }, [query]);

  // Apply filters and sorting
  const filtered = useMemo(() => {
    let results = allSuggestions;

    // Filter by TLD type
    if (filters.tldType.length < 3) {
      results = results.filter((s) => {
        const type = getTldType(s.tld);
        return type ? filters.tldType.includes(type) : true;
      });
    }

    // Filter by strategy
    if (filters.strategy.length < 6) {
      results = results.filter((s) => filters.strategy.includes(s.strategy));
    }

    // Filter by search within
    if (filters.searchWithin) {
      const term = filters.searchWithin.toLowerCase();
      results = results.filter((s) => s.domain.toLowerCase().includes(term));
    }

    // Sort
    switch (sort) {
      case "score":
        results = [...results].sort((a, b) => b.score - a.score);
        break;
      case "alpha":
        results = [...results].sort((a, b) => a.domain.localeCompare(b.domain));
        break;
      case "length":
        results = [...results].sort((a, b) => a.domain.length - b.domain.length);
        break;
    }

    return results;
  }, [allSuggestions, filters, sort]);

  return {
    suggestions: filtered,
    allCount: allSuggestions.length,
    isLoading,
    filters,
    setFilters,
    sort,
    setSort,
  };
}
