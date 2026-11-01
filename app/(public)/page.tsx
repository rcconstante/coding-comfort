import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent } from "../ui/card";
import { copy, getLocale, type PageQuery } from "../lib/copy";
import character from "../../public/home.webp";

export default async function Home({ searchParams }: { searchParams: PageQuery }) {
  const locale = getLocale(await searchParams);
  const t = copy[locale];

  return (
    <main lang={locale} id="main-content" className="home-main page-width">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">Coding Comfort</h1>
          <h2>{t.tagline}</h2>
          <p className="hero-description">{t.description}</p>
        </div>
        <Image
          className="hero-character"
          src={character}
          alt={t.characterAlt}
          width={1162}
          height={1342}
          sizes="(max-width: 600px) 75vw, (max-width: 1100px) 42vw, 440px"
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
  );
}
