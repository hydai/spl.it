"use client";

import { useState, useCallback, useEffect } from "react";
import type { Suggestion } from "@/lib/types";

const STORAGE_KEY = "findthename-favorites";

function domainKey(s: Suggestion): string {
  return s.isMultiLevel ? s.domain : `${s.prefix}.${s.tld}`;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Suggestion[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Ignore storage errors
    }
  }, [favorites]);

  const isFavorite = useCallback(
    (suggestion: Suggestion) =>
      favorites.some((f) => domainKey(f) === domainKey(suggestion)),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (suggestion: Suggestion) => {
      setFavorites((prev) => {
        const key = domainKey(suggestion);
        if (prev.some((f) => domainKey(f) === key)) {
          return prev.filter((f) => domainKey(f) !== key);
        }
        return [...prev, suggestion];
      });
    },
    [],
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return { favorites, isFavorite, toggleFavorite, clearFavorites };
}
