import { Suspense } from "react";
import { getLocale, type PageQuery } from "../lib/copy";
import { featureCopy } from "../lib/features";
import { ui } from "../lib/experience-copy";
import { SiteHeader } from "../ui/site-chrome";
import { FeatureCards } from "../ui/feature-cards";
import { SessionControls } from "../ui/session-controls";
import Link from "next/link";

export const metadata = { title: "Explore | Coding Comfort" };
async function DashboardContent({ searchParams }: { searchParams: PageQuery }) {
  const locale = getLocale(await searchParams);
  return (
    <div className="site" lang={locale}>
      <SiteHeader locale={locale} current="dashboard" />
      <main id="main-content" className="dashboard-main page-width">
        <h1 className="page-title">{featureCopy[locale].explore}</h1>
        <FeatureCards locale={locale} />
        <div className="dashboard-contact">
          <Link href={`/contact?lang=${locale}`}>{ui[locale].contactTeam}</Link>
        </div>
        <SessionControls locale={locale} />
      </main>
    </div>
  );
}
export default function Dashboard({
  searchParams,
}: {
  searchParams: PageQuery;
}) {
  return (
    <Suspense
      fallback={
        <main className="page-loading" aria-busy="true">
          Coding Comfort…
        </main>
      }
    >
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}
