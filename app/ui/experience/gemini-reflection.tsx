"use client";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Locale } from "../../lib/copy";
import {
  AI_CONSENT_VERSION,
  parseReflectionContent,
} from "../../lib/reflection";
import {
  createRecoveryKeys,
  decryptReflection,
} from "../../lib/reflection-crypto";
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

  const t = reflectionCopy[locale];
  const [agreed, setAgreed] = useState(false);
  const [storageFailed, setStorageFailed] = useState(false);
  const started = useRef(false);
  const record =
    session.reflection?.submissionKey === session.submissionKey
      ? session.reflection
      : null;
  const remote = useQuery(
    api.reflection.result,
    record?.status === "pending"
      ? { submissionKey: record.submissionKey }
      : "skip",
  );
  useEffect(() => {
    if (record?.status !== "pending" || remote === undefined) return;
    const results = sessionResults(session);
    if (!results) return;
    const submissionKey = record.submissionKey;
    if (remote === null) {
      if (!record.publicKey || !record.privateKey) {
        finishReflection(submissionKey, null);
        return;
      }
      void fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionKey,
          publicKey: record.publicKey,
          scores: {
            depression: results.depression.score,
            anxiety: results.anxiety.score,
            stress: results.stress.score,
          },
          consent: true,
          consentVersion: AI_CONSENT_VERSION,
        }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Unavailable");
        })
        .catch(() => finishReflection(submissionKey, null));
    } else if (
      remote.status === "ready" &&
      remote.envelope &&
      record.privateKey
    ) {
      void decryptReflection(remote.envelope, record.privateKey)
        .then((value) =>
          finishReflection(submissionKey, parseReflectionContent(value)),
        )
        .catch(() => finishReflection(submissionKey, null));
    } else if (remote.status !== "pending") {
      finishReflection(submissionKey, null);
    }
  }, [remote, record, session]);
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
  async function begin() {
    if (!agreed || !sessionResults(session) || started.current || storageError)
      return;
    started.current = true;
    try {
      const keys = await createRecoveryKeys();
      const submissionKey = session.submissionKey || crypto.randomUUID();
      if (
        !updateSession({
          submissionKey,
          reflection: {
            submissionKey,
            status: "pending",
            policyVersion: "reviewed-v1",
            content: null,
            ...keys,
          },
        })
      )
        setStorageFailed(true);
    } catch {
      setStorageFailed(true);
      started.current = false;
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
          onChange={(e) => setAgreed(e.target.checked)}
        />
        {t.consent}
      </label>
      <Button
        className="pill-button"
        disabled={!agreed || storageError || storageFailed}
        onClick={begin}
      >
        {t.generate}
      </Button>
    </div>
  );
}
