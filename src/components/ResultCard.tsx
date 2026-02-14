"use client";

import { useCallback, useState } from "react";
import type { Suggestion, StrategyName } from "@/lib/types";

const strategyColors: Record<StrategyName, string> = {
  domainHack: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  prefix: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  suffix: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  abbreviation: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  altSpelling: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  wordPlay: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
};

const strategyLabels: Record<StrategyName, string> = {
  domainHack: "Domain Hack",
  prefix: "Prefix",
  suffix: "Suffix",
  abbreviation: "Abbreviation",
  altSpelling: "Alt Spelling",
  wordPlay: "Word Play",
};

interface ResultCardProps {
  suggestion: Suggestion;
  isFavorite: boolean;
  onToggleFavorite: (suggestion: Suggestion) => void;
}

export default function ResultCard({
  suggestion,
  isFavorite,
  onToggleFavorite,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const fullDomain = suggestion.isMultiLevel
    ? suggestion.domain
    : `${suggestion.prefix}.${suggestion.tld}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullDomain);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for environments without clipboard API
    }
  }, [fullDomain]);

  const handleFavorite = useCallback(() => {
    onToggleFavorite(suggestion);
  }, [onToggleFavorite, suggestion]);

  return (
    <div className="group flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors hover:bg-card-hover">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-base font-medium text-foreground">
          {fullDomain}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${strategyColors[suggestion.strategy]}`}
          >
            {strategyLabels[suggestion.strategy]}
          </span>
          <span className="text-xs text-muted">
            score: {suggestion.score}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md p-1.5 text-muted transition-colors hover:bg-accent-bg hover:text-accent"
          aria-label={copied ? "Copied!" : "Copy domain"}
          title={copied ? "Copied!" : "Copy domain"}
        >
          {copied ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4 text-green-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
              />
            </svg>
          )}
        </button>

        {/* Favorite button */}
        <button
          type="button"
          onClick={handleFavorite}
          className="rounded-md p-1.5 text-muted transition-colors hover:bg-accent-bg hover:text-accent"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4 text-amber-500"
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
