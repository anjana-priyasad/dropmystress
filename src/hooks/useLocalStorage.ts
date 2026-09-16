"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { readStorage, subscribeStorage, writeStorage } from "@/lib/storage";

/**
 * JSON state persisted in this browser only. Renders `fallback` on the server
 * and during hydration, then switches to the stored value.
 * Pass a module-level constant as `fallback` so its identity stays stable.
 */
export function useLocalStorage<T>(key: string, fallback: T) {
  const raw = useSyncExternalStore(
    subscribeStorage,
    () => readStorage(key),
    () => null,
  );

  const value = useMemo<T>(() => {
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }, [raw, fallback]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const current = readStorage(key);
      let prev = fallback;
      if (current !== null) {
        try {
          prev = JSON.parse(current) as T;
        } catch {}
      }
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      writeStorage(key, JSON.stringify(resolved));
    },
    [key, fallback],
  );

  return [value, setValue] as const;
}

export function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
