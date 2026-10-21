import { useCallback, useMemo, useSyncExternalStore } from "react";

type Kind = "local" | "session";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function store(kind: Kind): Storage {
  return kind === "local" ? window.localStorage : window.sessionStorage;
}

function readRaw(kind: Kind, key: string): string | null {
  try {
    return store(kind).getItem(key);
  } catch {
    return null; // storage blocked (private mode, disabled cookies)
  }
}

/**
 * JSON value kept in localStorage (survives reloads and new tabs) or
 * sessionStorage (this tab's session only), read through useSyncExternalStore
 * so SSR/hydration stay consistent: the server snapshot is always `null`.
 * `parse` must return null for anything it doesn't recognise.
 */
export function useStoredJson<T>(
  kind: Kind,
  key: string,
  parse: (value: unknown) => T | null
): [T | null, (next: T | null) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(kind, key),
    () => null
  );

  const value = useMemo(() => {
    if (!raw) return null;
    try {
      return parse(JSON.parse(raw));
    } catch {
      return null;
    }
  }, [raw, parse]);

  const set = useCallback(
    (next: T | null) => {
      try {
        if (next === null) store(kind).removeItem(key);
        else store(kind).setItem(key, JSON.stringify(next));
      } catch {
        // Non-fatal: the value just won't persist.
      }
      listeners.forEach((l) => l());
    },
    [kind, key]
  );

  return [value, set];
}
