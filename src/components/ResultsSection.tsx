"use client";

import type { Suggestion, StrategyName } from "@/lib/types";
import StrategyAccordion from "./StrategyAccordion";
import LoadingSkeleton from "./LoadingSkeleton";

const STRATEGY_ORDER: StrategyName[] = [
  "domainHack",
  "prefix",
  "suffix",
  "abbreviation",
  "altSpelling",
  "wordPlay",
];

interface ResultsSectionProps {
  suggestions: Suggestion[];
  isLoading: boolean;
  query: string;
  isFavorite: (suggestion: Suggestion) => boolean;
  onToggleFavorite: (suggestion: Suggestion) => void;
}

export default function ResultsSection({
  suggestions,
  isLoading,
  query,
  isFavorite,
  onToggleFavorite,
}: ResultsSectionProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <LoadingSkeleton count={8} />
      </div>
    );
  }

  if (!query) {
    return null;
  }

  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-lg font-medium text-foreground">No results found</p>
        <p className="text-sm text-muted">
          Try a different word or adjust your filters.
        </p>
      </div>
    );
  }

  // Group by strategy
  const grouped = STRATEGY_ORDER.reduce(
    (acc, strategy) => {
      acc[strategy] = suggestions.filter((s) => s.strategy === strategy);
      return acc;
    },
    {} as Record<StrategyName, Suggestion[]>,
  );

  // Hero: top 3 results by score
  const topResults = [...suggestions].sort((a, b) => b.score - a.score).slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      {/* Hero top picks */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Top picks for &ldquo;{query}&rdquo;
        </h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {topResults.map((s) => {
            const domain = s.isMultiLevel ? s.domain : `${s.prefix}.${s.tld}`;
            return (
              <div
                key={domain}
                className="flex flex-col items-center gap-1 rounded-xl border border-accent/30 bg-accent-bg p-4 text-center"
              >
                <span className="font-mono text-lg font-bold text-accent">
                  {domain}
                </span>
                <span className="text-xs text-muted">
                  score: {s.score}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted">
        {suggestions.length} suggestion{suggestions.length !== 1 ? "s" : ""}{" "}
        found
      </p>

      {/* Strategy accordions */}
      {STRATEGY_ORDER.map((strategy, i) => (
        <StrategyAccordion
          key={strategy}
          strategy={strategy}
          suggestions={grouped[strategy]}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          defaultOpen={i === 0}
        />
      ))}
    </div>
  );
}
