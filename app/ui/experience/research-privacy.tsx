import Link from "next/link";
import type { Locale } from "../../lib/copy";
import { researchCopy } from "../../lib/research-copy";
import { ActionLink, PageHeading } from "./shared";

export function ResearchPrivacy({ locale }: { locale: Locale }) {
  const t = researchCopy[locale];
  return (
    <>
      <PageHeading asset="note" title={t.privacyTitle} />
      <div className="surface privacy-surface">
        <h2>{t.privacyChoiceTitle}</h2>
        <p>{t.privacyChoice}</p>
        <h2>{t.privacyRecords}</h2>
        <p>{t.researchDetails}</p>
        <h2>{t.privacyRemovalTitle}</h2>
        <p>
          {t.privacyRemoval}{" "}
          <Link className="privacy-link" href={`/contact?lang=${locale}`}>
            {t.privacyContact}
          </Link>
        </p>
      </div>
      <div className="form-actions">
        <ActionLink href="/results" locale={locale} secondary>
          {t.backToResults}
        </ActionLink>
      </div>
    </>
  );
}
