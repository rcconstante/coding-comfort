import Link from "next/link";
import type { Locale } from "../../lib/copy";
import { researchCopy } from "../../lib/research-copy";
import { ActionLink, PageHeading } from "./shared";

export function ResearchPrivacy({ locale }: { locale: Locale }) {
  const t = researchCopy[locale];
  return (
    <>
      <PageHeading asset="note" title={locale === "fil" ? "Patakaran sa Privacy" : "Privacy Policy"} />
      <div className="surface privacy-surface">
        <h2>{locale === "fil" ? "Datos sa iyong device" : "Data on your device"}</h2>
        <p>{locale === "fil" ? "Naka-save sa browser na ito ang mga sagot, resulta, journal, napiling hakbang, at reflection. Walang account na kailangan. Nananatili ang mga ito kapag nag-refresh; gamitin ang End session o burahin ang browser data upang alisin ang mga ito. Maaaring mabasa ng ibang gumagamit ng parehong browser profile ang naka-save na datos." : "Your answers, results, journal, chosen step, and reflection are saved in this browser. No participant account is needed. They remain after a refresh; use End session or clear browser data to remove them. Someone using the same browser profile may access saved data."}</p>
        <h2>{t.privacyChoiceTitle}</h2>
        <p>{t.privacyChoice}</p>
        <h2>{t.privacyRecords}</h2>
        <p>{t.researchDetails}</p>
        <h2>{locale === "fil" ? "Opsyonal na feedback" : "Optional feedback"}</h2>
        <p>{t.evaluationDetails}</p>
        <h2>{locale === "fil" ? "Opsyonal na paliwanag ng AI" : "Optional AI explanation"}</h2>
        <p>{locale === "fil" ? "Sa hiwalay mong pahintulot, tatlong score lamang ang ipinapadala sa AI service ng Google para sa paliwanag. Hindi kasama ang mga sagot o journal. Naka-encrypt ang pansamantalang reflection sa server at inaalis pagkalipas ng 24 oras; nananatili ang request marker upang maiwasan ang dobleng generation. May sariling patakaran ang provider sa pagproseso ng datos." : "With your separate permission, only three scores are sent to Google’s AI service for an explanation. Your answers and journal are not sent. The temporary reflection is encrypted on the server and removed after 24 hours; a request marker remains to prevent duplicate generation. The provider applies its own data-processing policies."}</p>
        <h2>{locale === "fil" ? "Proteksyon at pagpapatakbo" : "Protection and operation"}</h2>
        <p>{locale === "fil" ? "Awtorisadong researcher lamang ang may access sa mga isinumiteng tala at export. Gumagamit ang site ng browser storage, kinakailangang authentication cookies para sa researcher, at security rate limits. Maaaring magproseso ang hosting provider ng teknikal na request logs. Huwag maglagay ng pangalan o contact details sa journal o feedback. Hindi awtomatikong nabubura ang naisumiteng research data kapag binura ang lokal na session." : "Authorized researchers can access submitted records and exports. The site uses browser storage, necessary researcher authentication cookies, and security rate limits. Hosting providers may process technical request logs. Avoid names or contact details in journal entries and feedback. Clearing a local session does not delete research records already submitted."}</p>
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
