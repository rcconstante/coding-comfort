import Image from "next/image";
import Link from "next/link";
import { copy, type Locale } from "../lib/copy";
import { featureCopy, type Section } from "../lib/features";
import { ResultsNavLink } from "./results-nav-link";

export function SiteHeader({
  locale,
  current = "landing",
  path: overridePath,
  query,
}: {
  locale: Locale;
  current?: "landing" | "dashboard" | Section;
  path?: string;
  query?: { activity?: string; view?: string };
}) {
  const t = copy[locale];
  const f = featureCopy[locale];
  const landing = current === "landing";
  const path =
    overridePath ??
    (landing ? "/" : current === "dashboard" ? "/dashboard" : `/${current}`);
  function languageHref(language: Locale) {
    const params = new URLSearchParams({ lang: language });
    if (query?.activity) params.set("activity", query.activity);
    if (query?.view) params.set("view", query.view);
    return `${path}?${params}`;
  }
  const items = landing
    ? [
        { href: "/", label: t.home, active: true },
        { href: "/dashboard", label: t.start, active: false },
      ]
    : [
        { href: "/dashboard", label: t.home, active: current === "dashboard" },
        {
          href: "/screening",
          label: f.screeningNav,
          active: current === "screening",
        },
        {
          href: "/results",
          label: f.resultsNav,
          active: current === "results",
        },
        {
          href: "/self-care",
          label: f.selfCareNav,
          active: current === "self-care",
        },
        {
          href: "/support",
          label: f.supportNav,
          active: current === "support",
        },
      ];

  return (
    <>
      <a className="skip-link" href="#main-content">
        {t.skip}
      </a>
      <header className="site-header">
        <div className="header-inner page-width">
          <Link
            className="brand"
            href={`/?lang=${locale}`}
            aria-label="Coding Comfort"
          >
            <Image
              src="/header-logo.png"
              alt="Coding Comfort"
              width={1250}
              height={425}
              sizes="(max-width: 600px) 140px, 170px"
              priority
            />
          </Link>
          <nav
            className="header-nav"
            aria-label={
              locale === "fil" ? "Pangunahing nabigasyon" : "Main navigation"
            }
          >
            <ul>
              {items.map((item) => (
                <li key={item.href}>
                  {item.href === "/results" ? (
                    <ResultsNavLink
                      href={`${item.href}?lang=${locale}`}
                      locale={locale}
                      active={item.active}
                    >
                      {item.label}
                    </ResultsNavLink>
                  ) : (
                    <Link
                      className="nav-link"
                      href={`${item.href}?lang=${locale}`}
                      aria-current={item.active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <nav className="language-switch" aria-label={t.language}>
            <Link
              href={languageHref("en")}
              lang="en"
              hrefLang="en"
              aria-label="English"
              aria-current={locale === "en" ? "true" : undefined}
            >
              EN
            </Link>
            <Link
              href={languageHref("fil")}
              lang="fil"
              hrefLang="fil"
              aria-label="Filipino"
              aria-current={locale === "fil" ? "true" : undefined}
            >
              FIL
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
