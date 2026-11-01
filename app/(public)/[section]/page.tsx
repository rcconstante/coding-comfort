import { notFound } from "next/navigation";
import { getLocale, type PageQuery } from "../../lib/copy";
import { SessionControls } from "../../ui/session-controls";
import { Evaluation } from "../../ui/experience/evaluation";
import { Screening } from "../../ui/experience/screening";
import { ResultsPage, Reflection } from "../../ui/experience/results";
import { SelfCare } from "../../ui/experience/self-care";
import { activities, type Activity } from "../../lib/activities";
import { Contact, Support, type SupportView } from "../../ui/experience/support";
import { ResearchPrivacy } from "../../ui/experience/research-privacy";
import { cacheLife } from "next/cache";
import type { Locale } from "../../lib/copy";

type SectionProps = {
  params: Promise<{ section: string }>;
  searchParams: PageQuery;
};
const validSections = [
  "screening",
  "results",
  "reflection",
  "self-care",
  "support",
  "contact",
  "evaluation",
  "privacy",
];
export default async function SectionPage({ params, searchParams }: SectionProps) {
  const [{ section }, query] = await Promise.all([params, searchParams]);
  if (!validSections.includes(section)) notFound();
  const locale = getLocale(query);
  const activity =
    typeof query.activity === "string" &&
    activities.includes(query.activity as Activity)
      ? (query.activity as Activity)
      : undefined;
  const view =
    typeof query.view === "string" &&
    ["resources", "referral", "crisis"].includes(query.view)
      ? (query.view as SupportView)
      : undefined;
  return (
    <SectionView
      section={section}
      locale={locale}
      activity={activity}
      view={view}
    />
  );
}
async function SectionView({
  section,
  locale,
  activity,
  view,
}: {
  section: string;
  locale: Locale;
  activity?: Activity;
  view?: SupportView;
}) {
  "use cache";
  cacheLife("hours");
  return (
    <main
      lang={locale}
      id="main-content"
      className={`experience-main page-width experience-${section}`}
    >
      {section === "privacy" ? (
        <ResearchPrivacy locale={locale} />
      ) : section === "evaluation" ? (
        <Evaluation locale={locale} />
      ) : section === "screening" ? (
        <Screening locale={locale} />
      ) : section === "results" ? (
        <ResultsPage locale={locale} />
      ) : section === "reflection" ? (
        <Reflection locale={locale} />
      ) : section === "self-care" ? (
        <SelfCare locale={locale} activity={activity} />
      ) : section === "contact" ? (
        <Contact locale={locale} />
      ) : (
        <Support locale={locale} view={view} />
      )}
      <SessionControls locale={locale} />
    </main>
  );
}
