import { Suspense } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { SiteHeader } from "./ui/site-chrome";
import { Card, CardContent } from "./ui/card";
import { copy, getLocale, type PageQuery } from "./lib/copy";

async function HomeContent({ searchParams }: { searchParams: PageQuery }) {
  const locale = getLocale(await searchParams);
  const t = copy[locale];

  return (
    <div className="site" lang={locale}>
      <SiteHeader locale={locale} />
      <main id="main-content" className="home-main page-width">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">Coding Comfort</h1>
            <h2>{t.tagline}</h2>
            <p className="hero-description">{t.description}</p>
          </div>
          <Image
            className="hero-character"
            src="/home.png"
            alt={t.characterAlt}
            width={1162}
            height={1342}
            sizes="(max-width: 600px) 75vw, 42vw"
            priority
          />
        </section>
        <Card className="screening-note">
          <CardContent className="screening-note-content">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              size={25}
              strokeWidth={2}
              className="screening-note-icon"
              aria-hidden="true"
            />
            <p>{t.screeningNote}</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function Home({ searchParams }: { searchParams: PageQuery }) {
  return (
    <Suspense
      fallback={
        <main className="page-loading" aria-busy="true">
          Coding Comfort…
        </main>
      }
    >
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}
