"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { useSession, sessionResults } from "../lib/use-session";
import { featureCopy, sections } from "../lib/features";
import { ui } from "../lib/experience-copy";
import type { Locale } from "../lib/copy";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { Asset } from "./experience/shared";

const assets = {
  screening: "note",
  results: "graph",
  "self-care": "leave",
  support: "heart",
};
export function FeatureCards({ locale }: { locale: Locale }) {
  const t = featureCopy[locale];
  const { session } = useSession();
  const results = sessionResults(session);
  return (
    <div className="feature-grid">
      {sections.map((section) => {
        const feature = t.cards[section];
        const locked = section === "results" && !results;
        return (
          <Card
            key={section}
            className={`feature-card ${section === "screening" ? "feature-card-primary" : ""}`}
          >
            <CardContent className="feature-content">
              <div className="feature-heading">
                <Asset name={assets[section]} size={62} />
                <h2>{feature.title}</h2>
              </div>
              <p>{feature.description}</p>
              {locked && (
                <span className="feature-locked-note" id="results-locked-note">
                  {ui[locale].noResultsBody}
                </span>
              )}
              {locked ? (
                <Button
                  disabled
                  className="feature-action"
                  title={ui[locale].noResultsBody}
                  aria-describedby="results-locked-note"
                >
                  {feature.action}
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={16}
                    aria-hidden="true"
                  />
                </Button>
              ) : (
                <Button asChild className="feature-action">
                  <Link href={`/${section}?lang=${locale}`}>
                    {feature.action}
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={16}
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
