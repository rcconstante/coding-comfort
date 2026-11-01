"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../button";
import { Asset, Info, PageHeading } from "./shared";
import { clearSession, updateSession } from "../../lib/use-session";
import { ui } from "../../lib/experience-copy";
import type { Locale } from "../../lib/copy";
import { researchCopy } from "../../lib/research-copy";

export function Consent({ locale }: { locale: Locale }) {
  const t = ui[locale];
  const [agreed, setAgreed] = useState(false);
  const [researchAgreed, setResearchAgreed] = useState(false);
  const checkboxId = useId();
  const router = useRouter();
  return (
    <>
      <PageHeading
        asset="note"
        title={t.consentTitle}
        description={t.consentIntro}
      />
      <div className="surface consent-surface">
        <ul className="check-list">
          {t.consentItems.map((item) => (
            <li key={item}>
              <span aria-hidden="true">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <Asset name="note" size={190} className="consent-illustration" />
      </div>
      <Info>{t.privacy}</Info>
      <div className="research-consent">
        <label className="consent-agree">
          <input
            type="checkbox"
            checked={researchAgreed}
            onChange={(event) => setResearchAgreed(event.target.checked)}
          />
          {researchCopy[locale].researchOptIn}
        </label>
        <details className="privacy-details">
          <summary>{researchCopy[locale].researchPrivacyTitle}</summary>
          <p>{researchCopy[locale].researchDetails}</p>
        </details>
      </div>
      <label className="consent-agree" htmlFor={checkboxId}>
        <input
          id={checkboxId}
          type="checkbox"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
        />
        {t.agree}
      </label>
      <div className="form-actions centered">
        <Button
          variant="ghost"
          className="pill-button pill-secondary"
          onClick={() => {
            clearSession();
            router.push(`/dashboard?lang=${locale}`);
          }}
        >
          {t.decline}
        </Button>
        <Button
          className="pill-button"
          disabled={!agreed}
          onClick={() =>
            updateSession({
              consent: true,
              phase: "intro",
              researchConsent: researchAgreed,
            })
          }
        >
          {t.continue}
        </Button>
      </div>
    </>
  );
}
