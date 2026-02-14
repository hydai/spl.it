"use client";

import { useCallback, useState } from "react";
import type { Suggestion } from "@/lib/types";
import ResultCard from "./ResultCard";
import Toast from "./Toast";

interface FavoritesPanelProps {
  favorites: Suggestion[];
  isFavorite: (suggestion: Suggestion) => boolean;
  onToggleFavorite: (suggestion: Suggestion) => void;
  onClear: () => void;
}

export default function FavoritesPanel({
  favorites,
  isFavorite,
  onToggleFavorite,
  onClear,
}: FavoritesPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleExport = useCallback(() => {
    const text = favorites
      .map((f) => (f.isMultiLevel ? f.domain : `${f.prefix}.${f.tld}`))
      .join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setToast("Favorites copied to clipboard!");
    }).catch(() => {
      // Fallback: do nothing
    });
  }, [favorites]);

  const handleClear = useCallback(() => {
    onClear();
    setToast("Favorites cleared");
  }, [onClear]);

  return (
    <>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label={`Favorites (${favorites.length})`}
        title={`Favorites (${favorites.length})`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path
            fillRule="evenodd"
            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
            clipRule="evenodd"
          />
        </svg>
        {favorites.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {favorites.length}
          </span>
        )}
      </button>

      {/* Slide-out panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border bg-background shadow-2xl">
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold text-foreground">
              Favorites ({favorites.length})
            </h2>
            <div className="flex items-center gap-2">
              {favorites.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleExport}
                    className="rounded-md px-2 py-1 text-xs text-accent hover:bg-accent-bg transition-colors"
                  >
                    Copy all
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Clear
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-muted transition-colors hover:text-foreground"
                aria-label="Close favorites"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-y-auto p-4">
            {favorites.length === 0 ? (
              <p className="text-center text-sm text-muted">
                Star domains to save them here.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {favorites.map((fav) => (
                  <ResultCard
                    key={fav.isMultiLevel ? fav.domain : `${fav.prefix}.${fav.tld}`}
                    suggestion={fav}
                    isFavorite={isFavorite(fav)}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast
        message={toast ?? ""}
        visible={toast !== null}
        onClose={() => setToast(null)}
      />
    </>
  );
}
