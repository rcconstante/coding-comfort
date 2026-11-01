import { getLocale, type PageQuery } from "../../lib/copy";
import { featureCopy } from "../../lib/features";
import { ui } from "../../lib/experience-copy";
import { FeatureCards } from "../../ui/feature-cards";
import { SessionControls } from "../../ui/session-controls";
import Link from "next/link";
import { cacheLife } from "next/cache";
import type { Locale } from "../../lib/copy";

export const metadata = { title: "Explore | Coding Comfort" };
export default async function Dashboard({
  searchParams,
}: {
  searchParams: PageQuery;
}) {
  const locale = getLocale(await searchParams);
  return <DashboardView locale={locale} />;
}
async function DashboardView({ locale }: { locale: Locale }) {
  "use cache";
  cacheLife("hours");
  return (
    <main lang={locale} id="main-content" className="dashboard-main page-width">
      <h1 className="page-title">{featureCopy[locale].explore}</h1>
      <FeatureCards locale={locale} />
      <div className="dashboard-contact">
        <Link href={`/contact?lang=${locale}`} prefetch={true}>
          {ui[locale].contactTeam}
        </Link>
      </div>
      <SessionControls locale={locale} />
    </main>
  );
}
