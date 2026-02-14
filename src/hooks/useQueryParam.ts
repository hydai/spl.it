"use client";

import { useCallback, useMemo } from "react";

/**
 * Reads and writes a single query-string parameter via the History API.
 * Works with static exports (no server-side routing needed).
 */
export function useQueryParam(
  key: string,
): [string, (value: string) => void] {
  const value = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get(key) ?? "";
  }, [key]);

  const setValue = useCallback(
    (next: string) => {
      const params = new URLSearchParams(window.location.search);
      if (next) {
        params.set(key, next);
      } else {
        params.delete(key);
      }
      const qs = params.toString();
      const url = qs
        ? `${window.location.pathname}?${qs}`
        : window.location.pathname;
      window.history.replaceState(null, "", url);
    },
    [key],
  );

  return [value, setValue];
}
