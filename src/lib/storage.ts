/** Tiny localStorage wrapper shared by hooks and non-React modules. */

const listeners = new Set<() => void>();
// Used when localStorage is unavailable, so the UI still works for this visit.
const memory = new Map<string, string>();

export function subscribeStorage(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function readStorage(key: string): string | null {
  if (memory.has(key)) return memory.get(key) ?? null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
    memory.delete(key);
  } catch {
    memory.set(key, value);
  }
  listeners.forEach((l) => l());
}

const PREFIX = "dms.";

/** Everything this site has stored in the browser, keyed by storage key. */
export function readAllStorage(): Record<string, string> {
  const all: Record<string, string> = {};
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(PREFIX)) all[key] = window.localStorage.getItem(key) ?? "";
    }
  } catch {}
  memory.forEach((value, key) => {
    if (key.startsWith(PREFIX)) all[key] = value;
  });
  return all;
}

export function clearAllStorage() {
  Object.keys(readAllStorage()).forEach((key) => {
    memory.delete(key);
    try {
      window.localStorage.removeItem(key);
    } catch {}
  });
  listeners.forEach((l) => l());
}

/** Restores a backup made by `readAllStorage`. Returns how many entries were restored. */
export function importStorage(data: unknown): number {
  if (!data || typeof data !== "object" || Array.isArray(data)) return 0;
  let count = 0;
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith(PREFIX) && typeof value === "string") {
      writeStorage(key, value);
      count++;
    }
  }
  return count;
}
