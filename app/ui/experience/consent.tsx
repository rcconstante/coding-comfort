"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../button";
import { Asset, Info, PageHeading } from "./shared";
import { clearSession, updateSession } from "../../lib/use-session";
import { ui } from "../../lib/experience-copy";
import type { Locale } from "../../lib/copy";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

export function Consent({ locale, purpose = "screening" }: { locale: Locale; purpose?: "screening" | "self-care" }) {
  const t = ui[locale];
  const selfCare = purpose === "self-care";
  const localItems = locale === "fil"
    ? ["Nananatili sa browser na ito ang journal at napili mong hakbang.", "Hindi ibinabahagi sa researcher o AI ang mga ito.", "Maaari mong burahin ang lokal na datos sa pamamagitan ng End session."]
    : ["Your journal and chosen step stay in this browser.", "They are not shared with researchers or AI.", "You can clear local data using End session."];
  const [agreed, setAgreed] = useState(false);
  const checkboxId = useId();
  const router = useRouter();
  return (
    <>
      <PageHeading
        asset="note"
        title={selfCare ? (locale === "fil" ? "Isang sandali para sa sarili" : "A moment for yourself") : t.consentTitle}
        description={selfCare ? (locale === "fil" ? "Magsulat o pumili ng maliit na hakbang. Hindi kailangang sagutan ang screening." : "Write a reflection or choose a small step. No screening is required.") : t.consentIntro}
      />
      <div className="surface consent-surface">
        <ul className="check-list">
          {(selfCare ? localItems : t.consentItems).map((item) => (
            <li key={item}>
              <span aria-hidden="true"><HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2.5} /></span>
              <span className="check-copy">{item}</span>
            </li>
          ))}
        </ul>
        <Asset name="note" size={190} className="consent-illustration" />
      </div>
      <Info>{t.privacy}</Info>
      <Link className="privacy-link consent-privacy" href={`/privacy?lang=${locale}`}>
        {locale === "fil" ? "Patakaran sa privacy" : "Privacy policy"}
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
          {selfCare ? (locale === "fil" ? "Buksan ang Self-Care" : "Open Self-Care") : t.continue}
        </Button>
      </div>
    </>
  );
}
