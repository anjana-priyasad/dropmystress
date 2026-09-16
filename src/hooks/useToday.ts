"use client";

import { useSyncExternalStore } from "react";

export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

/** Today's local date as YYYY-MM-DD, or null during server render and hydration. */
export function useToday(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => dateKey(new Date()),
    () => null,
  );
}
