"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "../button";
import { Consent } from "./consent";
import { Asset, Info, PageHeading } from "./shared";
import { useSession, updateSession } from "../../lib/use-session";
import {
  calculateResults,
  questions,
  responseOptions,
  type Answer,
} from "../../lib/dass";
import { ui } from "../../lib/experience-copy";
import type { Locale } from "../../lib/copy";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { researchCopy } from "../../lib/research-copy";

export function Screening({ locale }: { locale: Locale }) {
  const { session, storageError, ready } = useSession();
  const t = ui[locale];
  const currentInstrument = useQuery(api.instruments.current);
  const router = useRouter();
  const group = useId();
  const legend = useRef<HTMLLegendElement>(null);
  const [error, setError] = useState(false);
  if (!ready) return null;
  if (!session.consent) return <Consent locale={locale} />;
  if (session.phase !== "questions")
    return (
      <>
        <PageHeading
          asset="note"
          title={t.introTitle}
          description={t.introDescription}
        />
        <div className="surface screening-intro">
          <div>
            <h2>{t.aboutTitle}</h2>
            <ul className="dot-list">
              {t.introBullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <Asset name="Dass-screening" size={210} />
        </div>
        <div className="form-actions end">
          {!currentInstrument && (
            <p className="quiet-note">
              {currentInstrument === undefined
                ? researchCopy[locale].instrumentLoading
                : researchCopy[locale].instrumentError}
            </p>
          )}
          <Button
            className="pill-button"
            disabled={!currentInstrument}
            onClick={() =>
              currentInstrument &&
              updateSession({
                phase: "questions",
                instrument:
                  session.phase === "completed" || !session.instrument
                    ? currentInstrument
                    : session.instrument,
                submissionKey:
                  session.phase === "completed" || !session.submissionKey
                    ? crypto.randomUUID()
                    : session.submissionKey,
                participantToken:
                  session.participantToken ||
                  (session.researchConsent ? crypto.randomUUID() : ""),
                ...(session.phase === "completed"
                  ? {
                      answers: Array(21).fill(null),
                      question: 0,
                      reflection: null,
                    }
                  : {}),
              })
            }
          >
            {session.phase === "completed"
              ? t.restartScreening
              : t.startQuestionnaire}
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={16}
              aria-hidden="true"
            />
          </Button>
        </div>
      </>
    );
  const index = session.question;
  const selected = session.answers[index];
  function advance() {
    if (selected === null) {
      setError(true);
      return;
    }
    setError(false);
    if (index === 20) {
      try {
        calculateResults(session.answers);
      } catch {
        setError(true);
        return;
      }
      updateSession({ phase: "completed" });
      router.push(`/results?lang=${locale}`);
    } else {
      updateSession({ question: index + 1 });
      requestAnimationFrame(() => legend.current?.focus());
    }
  }
  return (
    <>
      <div className="question-top">
        <h1>{t.screeningTitle}</h1>
        <span className="question-position" aria-live="polite">
          <svg className="sun-arc" viewBox="0 0 100 55" aria-hidden="true">
            <path d="M 10 50 A 40 40 0 0 1 90 50" pathLength="100" />
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              pathLength="100"
              strokeDasharray={`${((index + 1) / 21) * 100} 100`}
            />
          </svg>
          {t.question} {index + 1} {t.of} 21
        </span>
      </div>
      <div
        className="sun-progress"
        role="progressbar"
        aria-label={t.screeningTitle}
        aria-valuemin={0}
        aria-valuemax={21}
        aria-valuenow={index + 1}
      >
        <span style={{ width: `${((index + 1) / 21) * 100}%` }} />
      </div>
      <p className="question-instructions">{t.instructions}</p>
      <fieldset className="surface question-surface">
        <legend className="question-legend" ref={legend} tabIndex={-1}>
          <span className="question-badge" aria-hidden="true">
            {index + 1}
          </span>
          <span>
            {(session.instrument?.questions ?? questions)[locale][index]}
          </span>
        </legend>
        <div className="response-options">
          {(session.instrument?.options ?? responseOptions)[locale].map(
            (option, score) => (
              <label
                key={score}
                className={`response-option ${selected === score ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name={`${group}-${index}`}
                  checked={selected === score}
                  value={score}
                  onChange={() => {
                    const answers = [...session.answers];
                    answers[index] = score as Answer;
                    updateSession({ answers });
                    setError(false);
                  }}
                />
                <span>
                  <strong>{score}</strong> – {option}
                </span>
              </label>
            ),
          )}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="field-error">
          {t.chooseAnswer}
        </p>
      )}
      {storageError && <Info>{t.storageError}</Info>}
      <div className="form-actions spread">
        <Button
          variant="ghost"
          className="pill-button pill-secondary"
          onClick={() => {
            setError(false);
            updateSession(
              index === 0 ? { phase: "intro" } : { question: index - 1 },
            );
            requestAnimationFrame(() => legend.current?.focus());
          }}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} aria-hidden="true" />
          {t.previous}
        </Button>
        <Button
          className="pill-button"
          disabled={selected === null}
          onClick={advance}
        >
          {index === 20 ? t.finish : t.next}
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} aria-hidden="true" />
        </Button>
      </div>
      <Link className="quiet-exit" href={`/dashboard?lang=${locale}`}>
        {t.stop}
      </Link>
      <p className="quiet-note">{t.stopBody}</p>
    </>
  );
}
