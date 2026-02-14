"use client";

import { useCallback } from "react";
import type { FilterState, SortOption, StrategyName } from "@/lib/types";

const TLD_TYPES = [
  { value: "ccTLD" as const, label: "ccTLD" },
  { value: "gTLD" as const, label: "gTLD" },
  { value: "sTLD" as const, label: "sTLD" },
];

const STRATEGIES: { value: StrategyName; label: string }[] = [
  { value: "domainHack", label: "Domain Hack" },
  { value: "prefix", label: "Prefix" },
  { value: "suffix", label: "Suffix" },
  { value: "abbreviation", label: "Abbreviation" },
  { value: "altSpelling", label: "Alt Spelling" },
  { value: "wordPlay", label: "Word Play" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "score", label: "Best score" },
  { value: "alpha", label: "A-Z" },
  { value: "length", label: "Shortest" },
];

interface FilterToolbarProps {
  filters: FilterState;
  sort: SortOption;
  onFiltersChange: (filters: FilterState) => void;
  onSortChange: (sort: SortOption) => void;
}

function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-accent bg-accent-bg text-accent"
          : "border-border bg-card text-muted hover:border-accent/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

export default function FilterToolbar({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
}: FilterToolbarProps) {
  const toggleTldType = useCallback(
    (type: "ccTLD" | "gTLD" | "sTLD") => {
      const current = filters.tldType;
      const next = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      onFiltersChange({ ...filters, tldType: next });
    },
    [filters, onFiltersChange],
  );

  const toggleStrategy = useCallback(
    (strategy: StrategyName) => {
      const current = filters.strategy;
      const next = current.includes(strategy)
        ? current.filter((s) => s !== strategy)
        : [...current, strategy];
      onFiltersChange({ ...filters, strategy: next });
    },
    [filters, onFiltersChange],
  );

  const handleSearchWithin = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ ...filters, searchWithin: e.target.value });
    },
    [filters, onFiltersChange],
  );

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      {/* Top row: Sort + search within */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-muted">
          Sort by
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <div className="ml-auto flex items-center gap-2">
          <input
            type="text"
            value={filters.searchWithin}
            onChange={handleSearchWithin}
            placeholder="Filter results..."
            className="h-8 w-40 rounded-md border border-border bg-background px-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* TLD type chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted">TLD type:</span>
        {TLD_TYPES.map((t) => (
          <ToggleChip
            key={t.value}
            label={t.label}
            active={filters.tldType.includes(t.value)}
            onClick={() => toggleTldType(t.value)}
          />
        ))}
      </div>

      {/* Strategy chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted">Strategy:</span>
        {STRATEGIES.map((s) => (
          <ToggleChip
            key={s.value}
            label={s.label}
            active={filters.strategy.includes(s.value)}
            onClick={() => toggleStrategy(s.value)}
          />
        ))}
      </div>
    </div>
  );
}
