import Link from "next/link";
import type { Locale } from "../../lib/copy";
import { privacyCopy } from "../../lib/privacy-copy";
import { researchCopy } from "../../lib/research-copy";
import { ActionLink, PageHeading } from "./shared";

export function ResearchPrivacy({ locale }: { locale: Locale }) {
  const t = researchCopy[locale];
  const p = privacyCopy[locale];
  return (
    <>
      <PageHeading asset="note" title={p.title} description={p.intro} />
      <div className="surface privacy-surface">
        <h2>{p.localTitle}</h2>
        <p>{p.local}</p>
        <h2>{t.privacyChoiceTitle}</h2>
        <p>{t.privacyChoice}</p>
        <h2>{t.privacyRecords}</h2>
        <p>{t.researchDetails}</p>
        <h2>{p.feedbackTitle}</h2>
        <p>{t.evaluationDetails}</p>
        <h2>{p.locationTitle}</h2>
        <p>{p.location}</p>
        <h2>{p.aiTitle}</h2>
        <p>{p.ai}</p>
        <h2>{p.accessTitle}</h2>
        <p>{p.access}</p>
        <h2>{t.privacyRemovalTitle}</h2>
        <p>
          {t.privacyRemoval}{" "}
          <Link className="privacy-link" href={`/contact?lang=${locale}`}>
            {t.privacyContact}
          </Link>
        </p>
      </div>
      <div className="form-actions">
        <ActionLink href="/dashboard" locale={locale} secondary>
          {t.home}
        </ActionLink>
      </div>
    </>
  );
}
