"use client";

import { useCallback, useState } from "react";
import SearchInput from "@/components/SearchInput";
import FilterToolbar from "@/components/FilterToolbar";
import ResultsSection from "@/components/ResultsSection";
import FavoritesPanel from "@/components/FavoritesPanel";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useSuggestions } from "@/hooks/useSuggestions";
import { useFavorites } from "@/hooks/useFavorites";

const EXAMPLE_CHIPS = ["notify", "cloud", "stream", "pixel", "bright"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [chipValue, setChipValue] = useState<string | undefined>(undefined);
  const { suggestions, isLoading, filters, setFilters, sort, setSort } =
    useSuggestions(query);
  const { favorites, isFavorite, toggleFavorite, clearFavorites } =
    useFavorites();

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const handleChipClick = useCallback((chip: string) => {
    setChipValue(chip);
    setQuery(chip);
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex flex-col items-center gap-8">
        {/* Hero section */}
        <div className="flex flex-col items-center gap-4 pt-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Find the perfect
            <span className="text-accent"> domain name</span>
          </h2>
          <p className="max-w-lg text-base text-muted sm:text-lg">
            Type a word or brand name and we&apos;ll generate clever domain
            suggestions using TLD hacks, prefixes, suffixes, and more.
          </p>
        </div>

        {/* Search input */}
        <SearchInput onSearch={handleSearch} externalValue={chipValue} />

        {/* Example chips */}
        {!query && (
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-xs text-muted">Try:</span>
            {EXAMPLE_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Filter toolbar — only show when we have results */}
        {(suggestions.length > 0 || query.length >= 2) && (
          <div className="w-full">
            <FilterToolbar
              filters={filters}
              sort={sort}
              onFiltersChange={setFilters}
              onSortChange={setSort}
            />
          </div>
        )}

        {/* Results section */}
        <div className="w-full">
          <ResultsSection
            suggestions={suggestions}
            isLoading={isLoading}
            query={query}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />
        </div>
      </div>

      {/* Favorites panel */}
      <FavoritesPanel
        favorites={favorites}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        onClear={clearFavorites}
      />

      {/* Noscript */}
      <noscript>
        <div className="fixed inset-0 flex items-center justify-center bg-background p-8 text-center">
          <p className="text-lg text-foreground">
            findthename requires JavaScript to generate domain suggestions.
            Please enable JavaScript to use this app.
          </p>
        </div>
      </noscript>
    </ErrorBoundary>
  );
}
