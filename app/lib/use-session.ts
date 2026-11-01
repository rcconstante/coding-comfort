"use client";

import { useSyncExternalStore } from "react";
import { calculateResults, isAnswer, type Answer, type Results } from "./dass";
import { parseInstrument, type Instrument } from "./instrument";
import { parseSavedReflection, type SavedReflection } from "./reflection";
import { clearEvaluation } from "./use-evaluation";

type Phase = "consent" | "intro" | "questions" | "completed";
export type Session = {
  consent: boolean;
  phase: Phase;
  answers: (Answer | null)[];
  question: number;
  journal: string;
  action: string;
  actionDone: boolean;
  researchConsent: boolean;
  participantToken: string;
  submissionKey: string;
  researchSavedKey: string;
  participantCode: string;
  instrument: Instrument | null;
  reflection: SavedReflection | null;
};
const key = "coding-comfort-session-v1";
const empty: Session = {
  consent: false,
  phase: "consent",
  answers: Array(21).fill(null),
  question: 0,
  journal: "",
  action: "",
  actionDone: false,
  researchConsent: false,
  participantToken: "",
  submissionKey: "",
  researchSavedKey: "",
  participantCode: "",
  instrument: null,
  reflection: null,
};
let snapshot = empty;
let loaded = false;
let storageError = false;
const listeners = new Set<() => void>();

export function parseSession(raw: string | null): Session {
  if (!raw) return empty;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return empty;
    const v = data as Record<string, unknown>;
    if (v.consent !== true) return empty;
    const answers =
      Array.isArray(v.answers) &&
      v.answers.length === 21 &&
      Array.from(v.answers).every((a) => a === null || isAnswer(a))
        ? (v.answers as Session["answers"])
        : [...empty.answers];
    const phase = ["intro", "questions", "completed"].includes(
      v.phase as string,
    )
      ? (v.phase as Phase)
      : "intro";
    return {
      consent: true,
      phase:
        phase === "completed" && !answers.every(isAnswer) ? "questions" : phase,
      answers,
      question:
        typeof v.question === "number" &&
        Number.isInteger(v.question) &&
        v.question >= 0 &&
        v.question < 21
          ? v.question
          : 0,
      journal: typeof v.journal === "string" ? v.journal.slice(0, 4000) : "",
      action: typeof v.action === "string" ? v.action.slice(0, 200) : "",
      actionDone: v.actionDone === true,
      researchConsent: v.researchConsent === true,
      participantToken:
        typeof v.participantToken === "string"
          ? v.participantToken.slice(0, 36)
          : "",
      submissionKey:
        typeof v.submissionKey === "string" ? v.submissionKey.slice(0, 36) : "",
      researchSavedKey:
        typeof v.researchSavedKey === "string"
          ? v.researchSavedKey.slice(0, 36)
          : "",
      participantCode:
        typeof v.participantCode === "string"
          ? v.participantCode.slice(0, 32)
          : "",
      instrument: parseInstrument(v.instrument),
      reflection: parseSavedReflection(v.reflection),
    };
  } catch {
    return empty;
  }
}
function getSnapshot() {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try {
      const stored = localStorage.getItem(key);
      const legacy = stored === null ? sessionStorage.getItem(key) : null;
      snapshot = parseSession(stored ?? legacy);
      if (legacy) {
        localStorage.setItem(key, JSON.stringify(snapshot));
        sessionStorage.removeItem(key);
      }
    } catch {
      storageError = true;
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
      snapshot = parseSession(event.newValue);
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
export function updateSession(change: Partial<Session>) {
  const next = { ...getSnapshot(), ...change };
  snapshot = next.consent ? next : { ...empty, answers: [...empty.answers] };
  let saved = true;
  try {
    localStorage.setItem(key, JSON.stringify(snapshot));
  } catch {
    storageError = true;
    saved = false;
  }
  listeners.forEach((listener) => listener());
  return saved;
}
export function clearSession() {
  clearEvaluation();
  snapshot = { ...empty, answers: [...empty.answers] };
  try {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  } catch {
    storageError = true;
  }
  listeners.forEach((listener) => listener());
}
export function useSession() {
  const stored = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return { session: stored ?? empty, storageError, ready: stored !== null };
}
export function sessionResults(session: Session): Results | null {
  if (!session.consent || session.phase !== "completed") return null;
  try {
    return calculateResults(session.answers);
  } catch {
    return null;
  }
}
export function researchIdentity() {
  const current = getSnapshot();
  const participantToken = current.participantToken || crypto.randomUUID();
  const submissionKey = current.submissionKey || crypto.randomUUID();
  updateSession({ participantToken, submissionKey });
  return { participantToken, submissionKey };
}
export function finishReflection(
  submissionKey: string,
  content: SavedReflection["content"],
) {
  let current = getSnapshot();
  try {
    current = parseSession(localStorage.getItem(key));
  } catch {
    storageError = true;
  }
  if (
    current.consent &&
    current.submissionKey === submissionKey &&
    current.reflection?.submissionKey === submissionKey &&
    (content !== null || current.reflection.status !== "ready")
  ) {
    snapshot = current;
    updateSession({
      reflection: {
        submissionKey,
        policyVersion: "reviewed-v1",
        status: content ? "ready" : "error",
        content,
      },
    });
  }
}
