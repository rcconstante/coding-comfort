"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "../button";
import { Asset, Info, PageHeading, ActionLink } from "./shared";
import { useSession, sessionResults } from "../../lib/use-session";
import { subscales } from "../../lib/dass";
import { ui } from "../../lib/experience-copy";
import { supportResources } from "../../lib/support-resources";
import type { Locale } from "../../lib/copy";

export type SupportView = "resources" | "referral" | "crisis";
export function Support({
  locale,
  view,
}: {
  locale: Locale;
  view?: SupportView;
}) {
  const t = ui[locale];
  const { session } = useSession();
  const results = sessionResults(session);
  const views = ["resources", "referral", "crisis"] as const;
  const images = ["help", "referral", "crisis"];
  return (
    <>
      <PageHeading
        asset="heart"
        title={t.supportTitle}
        description={t.supportIntro}
      />
      {!view ? (
        <>
          <div className="support-menu">
            {views.map((key, index) => (
              <Link
                key={key}
                className="surface activity-card"
                href={`/support?view=${key}&lang=${locale}`}
              >
                <Asset name={images[index]} size={54} />
                <div>
                  <h2>{t.supportTitles[index]}</h2>
                  <p>{t.supportDescriptions[index]}</p>
                </div>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={20}
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
          <div className="form-actions centered">
            <ActionLink href="/support?view=crisis" locale={locale}>
              {t.helpNow}
            </ActionLink>
          </div>
        </>
      ) : (
        <>
          {view === "crisis" && (
            <div className="surface urgent-support">
              <Asset name="crisis" size={72} />
              <h2>{t.crisisHeading}</h2>
              <p>{t.crisisBody}</p>
              <Button asChild className="pill-button">
                <a href={supportResources[0].call}>
                  {t.call} {supportResources[0].phone}
                </a>
              </Button>
              <p className="quiet-note">NCMH · {t.hours}</p>
            </div>
          )}
          {view === "referral" ? (
            <div className="surface referral-surface">
              <Asset name="referral" size={76} />
              <h2>{t.professionalTitle}</h2>
              <ul className="dot-list">
                {t.professionalSteps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {results && (
                <div className="referral-result-list">
                  {subscales.map((key) => {
                    const severity = results[key].severity;
                    const message =
                      severity === "normal"
                        ? t.recommendationNormal
                        : severity === "mild"
                          ? t.recommendationMild
                          : severity === "moderate"
                            ? t.recommendationModerate
                            : severity === "severe"
                              ? t.recommendationSevere
                              : t.recommendationExtreme;
                    return (
                      <section key={key}>
                        <h3>
                          {t[key]} · {t[severity]}
                        </h3>
                        <p>{message}</p>
                      </section>
                    );
                  })}
                </div>
              )}
              <Info>{t.referralNotice}</Info>
              <div className="form-actions">
                <ActionLink href="/support?view=resources" locale={locale}>
                  {t.supportTitles[0]}
                </ActionLink>
              </div>
            </div>
          ) : (
            <div className="resources-grid">
              {supportResources.map((resource) => (
                <section key={resource.id} className="surface resource-card">
                  <h2>{resource.name}</h2>
                  <p>
                    {resource.id === "ncmh"
                      ? t.ncmhDescription
                      : t.organisationInfo}
                  </p>
                  {resource.phone ? (
                    <>
                      <a className="resource-phone" href={resource.call}>
                        {resource.phone}
                      </a>
                      <span className="resource-hours">{resource.hours}</span>
                    </>
                  ) : (
                    <p className="resource-note">{t.unverified}</p>
                  )}
                  <a
                    className="resource-website"
                    href={resource.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.website}
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={16}
                      aria-hidden="true"
                    />
                  </a>
                </section>
              ))}
            </div>
          )}
          <div className="form-actions centered">
            <ActionLink secondary href="/support" locale={locale}>
              {t.back}
            </ActionLink>
          </div>
        </>
      )}
      <div className="contact-strip">
        <div>
          <h2>{t.contactTitle}</h2>
          <p>{t.contactBody}</p>
        </div>
        <ActionLink secondary href="/contact" locale={locale}>
          {t.contactTeam}
        </ActionLink>
      </div>
    </>
  );
}
export function Contact({ locale }: { locale: Locale }) {
  const t = ui[locale];
  return (
    <>
      <PageHeading
        asset="help"
        title={t.contactTitle}
        description={t.contactBody}
      />
      <div className="surface contact-surface">
        <Asset name="heart" size={90} />
        <a className="team-email" href="mailto:codingcomfort.team@gmail.com">
          codingcomfort.team@gmail.com
        </a>
        <Button asChild className="pill-button">
          <a href="mailto:codingcomfort.team@gmail.com">{t.sendEmail}</a>
        </Button>
        <p>{t.contactNote}</p>
      </div>
    </>
  );
}
