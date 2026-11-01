"use client";

import { useRef, useState } from "react";
import { useSession, sessionResults } from "../../lib/use-session";
import { subscales, type Results, type Severity } from "../../lib/dass";
import { ui, type ExperienceText } from "../../lib/experience-copy";
import type { Locale } from "../../lib/copy";
import { Asset, ActionLink, Info, PageHeading } from "./shared";
import { Button } from "../button";
import { ResearchSubmission } from "./research-submission";
import { researchCopy } from "../../lib/research-copy";
import { GeminiReflection } from "./gemini-reflection";

const images = {
  depression: "depression",
  anxiety: "anxeity",
  stress: "stress",
} as const;
function EmptyResults({ locale }: { locale: Locale }) {
  const t = ui[locale];
  return (
    <div className="empty-results">
      <Asset name="graph" size={90} />
      <h1>{t.noResults}</h1>
      <p>{t.noResultsBody}</p>
      <ActionLink href="/screening" locale={locale}>
        {t.begin}
      </ActionLink>
    </div>
  );
}
function Explanation({
  severity,
  t,
}: {
  severity: Severity;
  t: ExperienceText;
}) {
  return (
    <>
      {t.resultExplanationStart}{" "}
      <strong>{t[severity].toLocaleLowerCase()}</strong>{" "}
      {t.resultExplanationEnd}
    </>
  );
}
function ScoreDetails({ results, t }: { results: Results; t: ExperienceText }) {
  return (
    <div className="surface score-details">
      <p>{t.rawExplanation}</p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">DASS-21</th>
              <th scope="col">{t.rawScore}</th>
              <th scope="col">{t.finalScore}</th>
            </tr>
          </thead>
          <tbody>
            {subscales.map((key) => (
              <tr key={key}>
                <th scope="row">{t[key]}</th>
                <td>{results[key].raw} / 21</td>
                <td>{results[key].score} / 42</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export function ResultsPage({ locale }: { locale: Locale }) {
  const { session, ready } = useSession();
  const results = sessionResults(session);
  const t = ui[locale];
  const [details, setDetails] = useState(false);
  if (!ready) return null;
  if (!results) return <EmptyResults locale={locale} />;
  return (
    <>
      <PageHeading
        asset="graph"
        title={t.resultsTitle}
        description={t.resultsIntro}
      />
      <div className="result-grid">
        {subscales.map((key) => (
          <section
            className="surface result-card"
            key={key}
            aria-labelledby={`result-${key}`}
          >
            <Asset name={images[key]} size={82} />
            <h2 id={`result-${key}`}>{t[key]}</h2>
            <div className="result-number">
              {results[key].score}
              <span> / 42</span>
            </div>
            <span className={`severity severity-${results[key].severity}`}>
              {t[results[key].severity]}
            </span>
            <meter
              min={0}
              max={42}
              value={results[key].score}
              aria-label={`${t[key]} ${t.score}`}
            />
            <p>
              <Explanation severity={results[key].severity} t={t} />
            </p>
          </section>
        ))}
      </div>
      <Info>{t.resultsDisclaimer}</Info>
      <div className="evaluation-invite">
        <ActionLink href="/evaluation" locale={locale}>
          {researchCopy[locale].evaluate}
        </ActionLink>
      </div>
      <div className="form-actions results-actions">
        <ActionLink href="/reflection" locale={locale}>
          {t.understand}
        </ActionLink>
        <Button
          variant="ghost"
          className="pill-button pill-secondary"
          aria-expanded={details}
          aria-controls="score-details"
          onClick={() => setDetails(!details)}
        >
          {details ? t.hideDetails : t.details}
        </Button>
      </div>
      {details && (
        <div id="score-details">
          <ScoreDetails results={results} t={t} />
        </div>
      )}
      <div className="form-actions centered">
        <ActionLink secondary href="/support" locale={locale}>
          {t.support}
        </ActionLink>
        <ActionLink secondary href="/self-care" locale={locale}>
          {t.selfCare}
        </ActionLink>
        <ActionLink secondary href="/dashboard" locale={locale}>
          {t.home}
        </ActionLink>
      </div>
      <ResearchSubmission locale={locale} />
    </>
  );
}
function recommendation(severity: Severity, t: ExperienceText) {
  return {
    normal: t.recommendationNormal,
    mild: t.recommendationMild,
    moderate: t.recommendationModerate,
    severe: t.recommendationSevere,
    extremelySevere: t.recommendationExtreme,
  }[severity];
}
export function Reflection({ locale }: { locale: Locale }) {
  const { session, ready } = useSession();
  const results = sessionResults(session);
  const t = ui[locale];
  const [tab, setTab] = useState(0);
  const [detail, setDetail] = useState(false);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const reflection =
    session.reflection?.submissionKey === session.submissionKey &&
    session.reflection.status === "ready"
      ? session.reflection.content?.[locale]
      : null;
  if (!ready) return null;
  if (!results) return <EmptyResults locale={locale} />;
  return (
    <>
      <PageHeading
        asset="ai"
        title={t.reflectionTitle}
        description={t.reflectionIntro}
      />
      <div
        className="reflection-tabs"
        role="tablist"
        aria-label={t.reflectionTitle}
      >
        {t.tabs.map((label, index) => (
          <button
            key={index}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`reflection-tab-${index}`}
            aria-controls={`reflection-panel-${index}`}
            aria-selected={index === tab}
            tabIndex={index === tab ? 0 : -1}
            onClick={() => setTab(index)}
            onKeyDown={(event) => {
              let next = index;
              if (event.key === "ArrowRight") next = (index + 1) % 3;
              else if (event.key === "ArrowLeft") next = (index + 2) % 3;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = 2;
              else return;
              event.preventDefault();
              setTab(next);
              refs.current[next]?.focus();
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <section
        className="surface reflection-panel"
        role="tabpanel"
        id={`reflection-panel-${tab}`}
        aria-labelledby={`reflection-tab-${tab}`}
        tabIndex={0}
      >
        {tab === 0 ? (
          <>
            <Asset name="robot" size={160} className="reflection-robot" />
            <div>
              <h2>{t.reflectionHeading}</h2>
              <p>{reflection?.summary ?? t.summaryIntro}</p>
              <ul className="reflection-scores">
                {subscales.map((key) => (
                  <li key={key}>
                    <strong>{t[key]}</strong>
                    <span>{results[key].score} / 42</span>
                    <span
                      className={`severity severity-${results[key].severity}`}
                    >
                      {t[results[key].severity]}
                    </span>
                  </li>
                ))}
              </ul>
              {reflection &&
                subscales.map((key) => (
                  <p key={key}>
                    <strong>{t[key]}: </strong>
                    {reflection[key]}
                  </p>
                ))}
              <GeminiReflection locale={locale} />
            </div>
          </>
        ) : (
          <div className="referral-summary">
            <h2>{t.tabs[tab]}</h2>
            {reflection &&
              (tab === 1 ? (
                <ul className="dot-list">
                  {reflection.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              ) : (
                <p>{reflection.referral}</p>
              ))}
            {!reflection &&
              subscales.map((key) => (
                <section key={key}>
                  <h3>
                    {t[key]} · {t[results[key].severity]}
                  </h3>
                  <p>{recommendation(results[key].severity, t)}</p>
                </section>
              ))}
            {tab === 2 && (
              <>
                <Info>{t.referralNotice}</Info>
                <ActionLink href="/support?view=resources" locale={locale}>
                  {t.support}
                </ActionLink>
              </>
            )}
          </div>
        )}
      </section>
      {detail && (
        <>
          {reflection && (
            <div className="surface score-details">
              <p>{reflection.further}</p>
            </div>
          )}
          <ScoreDetails results={results} t={t} />
        </>
      )}
      <div className="form-actions centered reflection-actions">
        <Button
          className="pill-button pill-secondary"
          variant="ghost"
          onClick={() => setDetail(!detail)}
          aria-expanded={detail}
        >
          {t.explainFurther}
        </Button>
        <Button
          className="pill-button pill-secondary"
          variant="ghost"
          onClick={() => {
            setTab(1);
            refs.current[1]?.focus();
          }}
        >
          {t.smallNext}
        </Button>
        <ActionLink secondary href="/support?view=referral" locale={locale}>
          {t.seekHelp}
        </ActionLink>
        <ActionLink
          secondary
          href="/self-care?activity=breathing"
          locale={locale}
        >
          {t.calming}
        </ActionLink>
        <ActionLink href="/dashboard" locale={locale}>
          {t.finishReflection}
        </ActionLink>
      </div>
      <Info>{t.oversight}</Info>
    </>
  );
}
