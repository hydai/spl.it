"use client";

import { useState } from "react";
import type { Suggestion, StrategyName } from "@/lib/types";
import ResultCard from "./ResultCard";

const strategyLabels: Record<StrategyName, string> = {
  domainHack: "Domain Hacks",
  prefix: "Prefix",
  suffix: "Suffix",
  abbreviation: "Abbreviation",
  altSpelling: "Alt Spelling",
  wordPlay: "Word Play",
};

interface StrategyAccordionProps {
  strategy: StrategyName;
  suggestions: Suggestion[];
  isFavorite: (suggestion: Suggestion) => boolean;
  onToggleFavorite: (suggestion: Suggestion) => void;
  defaultOpen?: boolean;
}

export default function StrategyAccordion({
  strategy,
  suggestions,
  isFavorite,
  onToggleFavorite,
  defaultOpen = false,
}: StrategyAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-card-hover"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {strategyLabels[strategy]}
          </h3>
          <span className="rounded-full bg-accent-bg px-2 py-0.5 text-xs font-medium text-accent">
            {suggestions.length}
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`h-4 w-4 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="flex flex-col gap-2 px-4 pb-4">
          {suggestions.map((s) => (
            <ResultCard
              key={s.isMultiLevel ? s.domain : `${s.prefix}.${s.tld}`}
              suggestion={s}
              isFavorite={isFavorite(s)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
