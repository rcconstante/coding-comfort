"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../button";
import { Asset, Info, PageHeading } from "./shared";
import { clearSession, updateSession } from "../../lib/use-session";
import { ui } from "../../lib/experience-copy";
import { privacyCopy } from "../../lib/privacy-copy";
import type { Locale } from "../../lib/copy";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

export function Consent({
  locale,
  purpose = "screening",
}: {
  locale: Locale;
  purpose?: "screening" | "self-care";
}) {
  const t = ui[locale];
  const selfCare = purpose === "self-care";
  const [agreed, setAgreed] = useState(false);
  const checkboxId = useId();
  const router = useRouter();
  return (
    <>
      <PageHeading
        asset="note"
        title={selfCare ? t.selfCareConsentTitle : t.consentTitle}
        description={selfCare ? t.selfCareConsentIntro : t.consentIntro}
      />
      <div className="surface consent-surface">
        <ul className="check-list">
          {(selfCare ? t.selfCareConsentItems : t.consentItems).map((item) => (
            <li key={item}>
              <span aria-hidden="true">
                <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2.5} />
              </span>
              <span className="check-copy">{item}</span>
            </li>
          ))}
        </ul>
        <Asset name="note" size={190} className="consent-illustration" />
      </div>
      <Info>{t.privacy}</Info>
      <Link
        className="privacy-link consent-privacy"
        href={`/privacy?lang=${locale}`}
      >
        {privacyCopy[locale].title}
      </Link>
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
          {selfCare ? t.openSelfCare : t.continue}
        </Button>
      </div>
    </>
  );
}
