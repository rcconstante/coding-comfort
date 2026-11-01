"use client";
import { useSyncExternalStore } from "react";

type Draft = {
  agreed: boolean;
  ratings: number[];
  comment: string;
  token: string;
  submissionKey: string;
  submitted: boolean;
};
const key = "coding-comfort-evaluation-v1";
const empty: Draft = {
  agreed: false,
  ratings: [0, 0, 0],
  comment: "",
  token: "",
  submissionKey: "",
  submitted: false,
};
let snapshot = empty;
let loaded = false;
const listeners = new Set<() => void>();
function parse(raw: string | null): Draft {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (!value || typeof value !== "object") return empty;
    const row = value as Record<string, unknown>;
    if (row.agreed !== true) return empty;
    return {
      agreed: true,
      ratings:
        Array.isArray(row.ratings) &&
        row.ratings.length === 3 &&
        row.ratings.every(
          (rating) => Number.isInteger(rating) && rating >= 0 && rating <= 5,
        )
          ? row.ratings
          : [0, 0, 0],
      comment:
        typeof row.comment === "string" ? row.comment.slice(0, 2000) : "",
      token: typeof row.token === "string" ? row.token.slice(0, 36) : "",
      submissionKey:
        typeof row.submissionKey === "string"
          ? row.submissionKey.slice(0, 36)
          : "",
      submitted: row.submitted === true,
    };
  } catch {
    return empty;
  }
}
function getSnapshot() {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try {
      snapshot = parse(localStorage.getItem(key));
    } catch {
      /* Draft stays in memory when storage is unavailable. */
    }
  }
  return snapshot;
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (
      event.storageArea === localStorage &&
      (event.key === key || event.key === null)
    ) {
      snapshot = parse(event.newValue);
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
export function updateEvaluation(change: Partial<Draft>) {
  const next = { ...getSnapshot(), ...change };
  snapshot = next.agreed ? next : empty;
  try {
    if (snapshot.agreed) localStorage.setItem(key, JSON.stringify(snapshot));
    else localStorage.removeItem(key);
  } catch {
    /* Submission remains available without persistent browser storage. */
  }
  listeners.forEach((listener) => listener());
}
export function clearEvaluation() {
  updateEvaluation({ agreed: false });
}
export function useEvaluation() {
  return useSyncExternalStore(subscribe, getSnapshot, () => empty);
}
