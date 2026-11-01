"use client";
import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSession } from "../../lib/use-session";
import { researchCopy } from "../../lib/research-copy";
import {
  EVALUATION_QUESTIONS,
  FEEDBACK_CONSENT_VERSION,
  validateEvaluation,
} from "../../lib/research-validation";
import type { Locale } from "../../lib/copy";
import { ActionLink, PageHeading } from "./shared";
import { Button } from "../button";
export function Evaluation({ locale }: { locale: Locale }) {
  const t = researchCopy[locale];
  const { session } = useSession();
  const submit = useMutation(api.research.submitEvaluation);
  const [agreed, setAgreed] = useState(false);
  const [ratings, setRatings] = useState<number[]>([0, 0, 0]);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );
  const identity = useRef<{ token: string; key: string } | null>(null);
  async function send(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agreed) return;
    try {
      validateEvaluation(ratings[0], ratings[1], ratings[2], comment);
    } catch {
      setStatus("error");
      return;
    }
    identity.current ??= {
      token: session.participantToken || crypto.randomUUID(),
      key: crypto.randomUUID(),
    };
    setStatus("saving");
    try {
      await submit({
        token: identity.current.token,
        submissionKey: identity.current.key,
        locale,
        consent: true,
        consentVersion: FEEDBACK_CONSENT_VERSION,
        ease: ratings[0],
        clarity: ratings[1],
        overall: ratings[2],
        comment,
      });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }
  if (status === "done")
    return (
      <div className="surface evaluation-complete">
        <PageHeading
          asset="heart"
          title={t.thanks}
          description={t.thanksBody}
        />
        <ActionLink href="/dashboard" locale={locale}>
          {t.home}
        </ActionLink>
      </div>
    );
  return (
    <>
      <PageHeading
        asset="guide-journaling"
        title={t.evaluationTitle}
        description={t.evaluationIntro}
      />
      <form className="surface evaluation-form" onSubmit={send}>
        <div className="research-consent">
          <p>{t.evaluationDetails}</p>
          <label className="consent-agree">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
            />
            {t.evaluationConsent}
          </label>
        </div>
        <fieldset
          disabled={!agreed || status === "saving"}
          className="evaluation-fields"
        >
          <legend className="sr-only">{t.evaluationTitle}</legend>
          {EVALUATION_QUESTIONS[locale].map((question, index) => (
            <fieldset className="evaluation-rating" key={index}>
              <legend>{question}</legend>
              <div>
                {[1, 2, 3, 4, 5].map((value) => (
                  <label
                    key={value}
                    className={ratings[index] === value ? "selected" : ""}
                  >
                    <input
                      type="radio"
                      name={`evaluation-${index}`}
                      value={value}
                      required
                      checked={ratings[index] === value}
                      onChange={() =>
                        setRatings(
                          ratings.map((previous, i) =>
                            i === index ? value : previous,
                          ),
                        )
                      }
                    />
                    <span>{value}</span>
                  </label>
                ))}
              </div>
              <p>
                <span>{t.ratingLow}</span>
                <span>{t.ratingHigh}</span>
              </p>
            </fieldset>
          ))}
          <label className="evaluation-comment">
            {t.comment}
            <textarea
              maxLength={2000}
              rows={5}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </label>
        </fieldset>
        {status === "error" && (
          <p className="field-error" role="alert">
            {ratings.some((value) => !value) ? t.required : t.feedbackError}
          </p>
        )}
        <div className="form-actions spread">
          <ActionLink secondary href="/dashboard" locale={locale}>
            {t.skip}
          </ActionLink>
          <Button
            className="pill-button"
            disabled={
              !agreed || ratings.some((value) => !value) || status === "saving"
            }
            type="submit"
          >
            {status === "saving" ? t.submitting : t.submit}
          </Button>
        </div>
      </form>
    </>
  );
}
