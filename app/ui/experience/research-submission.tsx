"use client";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  useSession,
  updateSession,
  researchIdentity,
  sessionResults,
} from "../../lib/use-session";
import { RESEARCH_CONSENT_VERSION } from "../../lib/research-validation";
import { researchCopy } from "../../lib/research-copy";
import type { Locale } from "../../lib/copy";
import { Info } from "./shared";
import { Button } from "../button";
export function ResearchSubmission({ locale }: { locale: Locale }) {
  const { session } = useSession();
  const t = researchCopy[locale];
  const submit = useMutation(api.research.submitScreening);
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (
      !session.researchConsent ||
      session.phase !== "completed" ||
      !session.submissionKey ||
      !session.participantToken ||
      session.researchSavedKey === session.submissionKey ||
      !sessionResults(session)
    )
      return;
    let cancelled = false;
    void submit({
      token: session.participantToken,
      submissionKey: session.submissionKey,
      locale,
      answers: session.answers as number[],
      consentVersion: RESEARCH_CONSENT_VERSION,
      consent: true,
      instrumentVersion: session.instrument?.version ?? "dass21-pdf-v1",
    })
      .then((result) => {
        if (!cancelled) {
          updateSession({
            researchSavedKey: session.submissionKey,
            participantCode: result.participantCode,
          });
          setStatus("idle");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [session, locale, submit, retry]);
  if (
    session.researchSavedKey &&
    session.researchSavedKey === session.submissionKey
  )
    return (
      <Info>
        <span role="status">
          {t.saved} · {t.participantCode}:{" "}
          <strong>{session.participantCode}</strong>
        </span>
      </Info>
    );
  if (session.researchConsent)
    return (
      <Info>
        <div role="status">{status === "error" ? t.saveError : t.saving}</div>
        {status === "error" && (
          <Button
            className="pill-button"
            onClick={() => {
              setStatus("idle");
              setRetry(retry + 1);
            }}
          >
            {t.retry}
          </Button>
        )}
      </Info>
    );
  return (
    <details className="surface research-save privacy-details">
      <summary>{t.shareResearch}</summary>
      <label className="consent-agree">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
        />
        {t.researchOptIn}
      </label>
      <p>{t.researchDetails}</p>
      <Button
        className="pill-button"
        disabled={!agreed}
        onClick={() => {
          researchIdentity();
          updateSession({ researchConsent: true });
        }}
      >
        {t.saveConsent}
      </Button>
    </details>
  );
}
