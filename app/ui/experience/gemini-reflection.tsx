"use client";
import { useRef, useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Locale } from "../../lib/copy";
import { AI_CONSENT_VERSION } from "../../lib/reflection";
import { reflectionCopy } from "../../lib/reflection-copy";
import {
  finishReflection,
  sessionResults,
  updateSession,
  useSession,
} from "../../lib/use-session";
import { Button } from "../button";
import { Info } from "./shared";

export function GeminiReflection({ locale }: { locale: Locale }) {
  const { session, storageError } = useSession();
  const generate = useAction(api.reflection.generate);
  const t = reflectionCopy[locale];
  const [agreed, setAgreed] = useState(false);
  const [storageFailed, setStorageFailed] = useState(false);
  const started = useRef(false);
  const record =
    session.reflection?.submissionKey === session.submissionKey
      ? session.reflection
      : null;
  if (storageFailed || (storageError && record?.status === "pending"))
    return (
      <Info>
        <p role="alert">{t.storage}</p>
      </Info>
    );
  if (record?.status === "ready")
    return (
      <Info>
        <span role="status">{t.saved}</span>
        <p>{t.disclaimer}</p>
      </Info>
    );
  if (record)
    return (
      <Info>
        <span role="status">
          {record.status === "pending" ? t.pending : t.failed}
        </span>
      </Info>
    );
  async function request() {
    const results = sessionResults(session);
    if (!agreed || !results || started.current || storageError) return;
    started.current = true;
    const submissionKey = session.submissionKey || crypto.randomUUID();
    const saved = updateSession({
      submissionKey,
      reflection: { submissionKey, status: "pending", content: null },
    });
    if (!saved) {
      setStorageFailed(true);
      return;
    }
    try {
      const content = await generate({
        submissionKey,
        scores: {
          depression: results.depression.score,
          anxiety: results.anxiety.score,
          stress: results.stress.score,
        },
        consent: true,
        consentVersion: AI_CONSENT_VERSION,
      });
      finishReflection(submissionKey, content);
    } catch {
      finishReflection(submissionKey, null);
    }
  }
  return (
    <div className="gemini-consent">
      <p>{t.once}</p>
      <details className="privacy-details">
        <summary>{t.privacyTitle}</summary>
        <p>{t.privacy}</p>
      </details>
      <label className="consent-agree">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
        />
        {t.consent}
      </label>
      {(storageError || storageFailed) && (
        <p role="alert" className="field-error">
          {t.storage}
        </p>
      )}
      <Button
        className="pill-button"
        disabled={!agreed || storageError || storageFailed}
        onClick={request}
      >
        {t.generate}
      </Button>
    </div>
  );
}
