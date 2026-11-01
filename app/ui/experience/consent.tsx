"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../button";
import { Asset, Info, PageHeading } from "./shared";
import { clearSession, updateSession } from "../../lib/use-session";
import { ui } from "../../lib/experience-copy";
import type { Locale } from "../../lib/copy";

export function Consent({ locale }: { locale: Locale }) {
  const t = ui[locale];
  const [agreed, setAgreed] = useState(false);
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
              researchConsent: false,
            })
          }
        >
          {t.continue}
        </Button>
      </div>
    </>
  );
}
