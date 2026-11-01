import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getLocale, type PageQuery } from "../lib/copy";
import { SiteHeader } from "../ui/site-chrome";
import { SessionControls } from "../ui/session-controls";
import { Evaluation } from "../ui/experience/evaluation";
import { Screening } from "../ui/experience/screening";
import { ResultsPage, Reflection } from "../ui/experience/results";
import { SelfCare } from "../ui/experience/self-care";
import { activities, type Activity } from "../lib/activities";
import { Contact, Support, type SupportView } from "../ui/experience/support";

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
];
async function SectionContent({ params, searchParams }: SectionProps) {
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
  const current =
    section === "reflection" || section === "evaluation"
      ? "results"
      : section === "contact"
        ? "support"
        : (section as "screening" | "results" | "self-care" | "support");
  return (
    <div className="site" lang={locale}>
      <SiteHeader
        locale={locale}
        current={current}
        path={`/${section}`}
        query={{ activity, view }}
      />
      <main
        id="main-content"
        className={`experience-main page-width experience-${section}`}
      >
        {section === "evaluation" ? (
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
    </div>
  );
}
export default function SectionPage(props: SectionProps) {
  return (
    <Suspense
      fallback={
        <main className="page-loading" aria-busy="true">
          Coding Comfort…
        </main>
      }
    >
      <SectionContent {...props} />
    </Suspense>
  );
}
