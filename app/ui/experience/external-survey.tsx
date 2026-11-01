"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Locale } from "../../lib/copy";
import { researchCopy } from "../../lib/research-copy";
import { Button } from "../button";

export function ExternalSurvey({ locale }: { locale: Locale }) {
  const url = useQuery(api.survey.current);
  const t = researchCopy[locale];
  if (!url) return null;
  return (
    <section className="surface external-survey">
      <h2>{t.externalTitle}</h2>
      <p>{t.externalNote}</p>
      <Button asChild className="pill-button pill-secondary" variant="ghost">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
        >
          {t.externalAction}
        </a>
      </Button>
    </section>
  );
}
