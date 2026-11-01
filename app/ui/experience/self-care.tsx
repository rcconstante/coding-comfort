"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "../button";
import { Consent } from "./consent";
import { Asset, PageHeading } from "./shared";
import { useSession, updateSession } from "../../lib/use-session";
import { ui } from "../../lib/experience-copy";
import type { Locale } from "../../lib/copy";
import { activities, type Activity } from "../../lib/activities";
import { DurationSelect } from "../duration-select";

const activityImages = ["breath", "grounding-act", "guide-journaling", "heart"] as const;

function Breathing({ locale }: { locale: Locale }) {
  const t = ui[locale];
  const [duration, setDuration] = useState(60);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [cycle, setCycle] = useState(0);
  const startedAt = useRef(0);
  const base = useRef(0);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      const seconds = Math.min(
        duration,
        base.current +
          Math.floor((performance.now() - startedAt.current) / 1000),
      );
      setElapsed(seconds);
      if (seconds >= duration) setRunning(false);
    }, 250);
    return () => clearInterval(timer);
  }, [running, duration]);
  const done = elapsed >= duration;
  const inhale = Math.floor(elapsed / 4) % 2 === 0;
  function toggle() {
    setStarted(true);
    if (!running) {
      base.current = elapsed;
      startedAt.current = performance.now();
    }
    setRunning(!running);
  }
  return (
    <div className="surface breathing-surface">
      <p>{t.breathingInstructions}</p>
      <div className="duration-label">
        {t.duration}
        <DurationSelect
          value={duration}
          disabled={running}
          label={t.duration}
          minute={t.minute}
          minutes={t.minutes}
          onChange={(seconds) => {
            setDuration(seconds);
            setElapsed(0);
            setStarted(false);
            setCycle(cycle + 1);
          }}
        />
      </div>
      <div className={`breathing-orbit ${running ? "is-running" : ""}`}>
        <div key={cycle} className="breathing-circle">
          <span aria-live="polite">
            {done
              ? t.exerciseComplete
              : running
                ? inhale
                  ? t.breatheIn
                  : t.breatheOut
                : started
                  ? t.paused
                  : t.ready}
          </span>
        </div>
      </div>
      <div className="timer-readout" role="timer">
        {Math.floor((duration - elapsed) / 60)}:
        {String((duration - elapsed) % 60).padStart(2, "0")}
      </div>
      <div className="form-actions centered">
        <Button className="pill-button" disabled={done} onClick={toggle}>
          {running ? t.pause : started ? t.resume : t.start}
        </Button>
        <Button
          variant="ghost"
          className="pill-button pill-secondary"
          onClick={() => {
            setRunning(false);
            setElapsed(0);
            setStarted(false);
            setCycle(cycle + 1);
          }}
        >
          {t.restart}
        </Button>
        <Button asChild variant="ghost" className="pill-button pill-secondary">
          <Link
            href={`/self-care?lang=${locale}`}
            onClick={() => setRunning(false)}
          >
            {t.exit}
          </Link>
        </Button>
      </div>
      <p className="quiet-note">{t.breathNote}</p>
    </div>
  );
}
function Grounding({ locale }: { locale: Locale }) {
  const t = ui[locale];
  const [step, setStep] = useState(0);
  return (
    <div className="surface grounding-surface">
      <p>{t.groundingIntro}</p>
      <Asset name="grounding-act" size={110} />
      {step < 5 ? (
        <>
          <span className="grounding-number" aria-hidden="true">
            {5 - step}
          </span>
          <h2 aria-live="polite">{t.groundingSteps[step]}</h2>
        </>
      ) : (
        <h2 aria-live="polite">{t.groundingDone}</h2>
      )}
      <div className="step-dots" aria-label={`${Math.min(step + 1, 5)} / 5`}>
        {t.groundingSteps.map((_, index) => (
          <span key={index} className={index <= step ? "active" : ""} />
        ))}
      </div>
      <div className="form-actions centered">
        <Button
          variant="ghost"
          className="pill-button pill-secondary"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          {t.previous}
        </Button>
        <Button
          className="pill-button"
          onClick={() => setStep(step === 5 ? 0 : step + 1)}
        >
          {step === 5 ? t.restart : t.next}
        </Button>
      </div>
    </div>
  );
}
function Journal({ locale }: { locale: Locale }) {
  const t = ui[locale];
  const { session, storageError } = useSession();
  return (
    <div className="surface journal-surface">
      <p>{t.journalIntro}</p>
      <blockquote>{t.journalPrompt}</blockquote>
      <label htmlFor="journal-entry">{t.journalLabel}</label>
      <textarea
        id="journal-entry"
        maxLength={4000}
        value={session.journal}
        placeholder={t.journalPlaceholder}
        onChange={(event) => updateSession({ journal: event.target.value })}
        rows={9}
      />
      <div className="journal-status">
        <span role="status">
          {storageError
            ? t.storageError
            : session.journal
              ? t.journalSaved
              : t.draftEmpty}
        </span>
        <span>
          {session.journal.length} / 4000 {t.characters}
        </span>
      </div>
    </div>
  );
}
function Planner({ locale }: { locale: Locale }) {
  const t = ui[locale];
  const { session } = useSession();
  const preset = session.action.startsWith("preset:")
    ? Number(session.action.slice(7))
    : -1;
  const custom = session.action.startsWith("custom:")
    ? session.action.slice(7)
    : "";
  const selected =
    preset >= 0 && preset < t.actions.length
      ? t.actions[preset]
      : custom.trim();
  if (session.actionDone && selected)
    return (
      <div className="surface planner-complete">
        <Asset name="heart" size={100} />
        <h2>{t.stepDone}</h2>
        <p>{selected}</p>
        <Button
          className="pill-button pill-secondary"
          variant="ghost"
          onClick={() => updateSession({ action: "", actionDone: false })}
        >
          {t.chooseAnother}
        </Button>
      </div>
    );
  return (
    <div className="surface planner-surface">
      <p>{t.plannerIntro}</p>
      <fieldset>
        <legend>{t.selectedStep}</legend>
        <div className="planner-options">
          {t.actions.map((label, index) => (
            <label
              className={`response-option ${preset === index ? "selected" : ""}`}
              key={index}
            >
              <input
                type="radio"
                name="small-step"
                checked={preset === index}
                onChange={() =>
                  updateSession({
                    action: `preset:${index}`,
                    actionDone: false,
                  })
                }
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="custom-action" htmlFor="custom-action">
        {t.custom}
        <input
          id="custom-action"
          type="text"
          maxLength={180}
          value={custom}
          placeholder={t.customPlaceholder}
          onChange={(event) =>
            updateSession({
              action: `custom:${event.target.value}`,
              actionDone: false,
            })
          }
        />
      </label>
      <div className="form-actions end">
        <Button
          disabled={!selected}
          className="pill-button"
          onClick={() => updateSession({ actionDone: true })}
        >
          {t.markDone}
        </Button>
      </div>
    </div>
  );
}
export function SelfCare({
  locale,
  activity,
}: {
  locale: Locale;
  activity?: Activity;
}) {
  const t = ui[locale];
  const { session, ready } = useSession();
  if ((activity === "journal" || activity === "steps") && !ready) return null;
  if ((activity === "journal" || activity === "steps") && !session.consent)
    return <Consent locale={locale} purpose="self-care" />;
  if (!activity)
    return (
      <>
        <PageHeading
          asset="leave"
          title={t.selfCareTitle}
          description={t.selfCareIntro}
        />
        <div className="activity-grid">
          {activities.map((key, index) => (
            <Link
              key={key}
              className="surface activity-card"
              href={`/self-care?activity=${key}&lang=${locale}`}
              prefetch={true}
            >
              <Asset name={activityImages[index]} size={54} />
              <div>
                <h2>{t.activityTitles[index]}</h2>
                <p>{t.activityDescriptions[index]}</p>
              </div>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={20}
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </>
    );
  const index = activities.indexOf(activity);
  return (
    <>
      <PageHeading
        asset={activityImages[index]}
        title={t.activityTitles[index]}
      />
      {activity === "breathing" ? (
        <Breathing locale={locale} />
      ) : activity === "grounding" ? (
        <Grounding locale={locale} />
      ) : activity === "journal" ? (
        <Journal locale={locale} />
      ) : (
        <Planner locale={locale} />
      )}
      {activity !== "breathing" && (
        <div className="form-actions centered">
          <Button
            asChild
            variant="ghost"
            className="pill-button pill-secondary"
          >
            <Link href={`/self-care?lang=${locale}`}>{t.exit}</Link>
          </Button>
        </div>
      )}
    </>
  );
}
