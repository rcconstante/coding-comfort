"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { getLocale } from "../lib/copy";
import type { Section } from "../lib/features";
import { SiteHeader } from "./site-chrome";

export function PublicHeader() {
  const path = usePathname();
  const query = useSearchParams();
  const locale = getLocale({ lang: query.get("lang") ?? undefined });
  const section = path.split("/")[1];
  const current: "landing" | "dashboard" | Section = !section
    ? "landing"
    : section === "dashboard"
      ? "dashboard"
      : ["results", "reflection", "evaluation", "privacy"].includes(section)
        ? "results"
        : section === "screening"
          ? "screening"
          : section === "self-care"
            ? "self-care"
            : "support";

  return (
    <SiteHeader
      locale={locale}
      current={current}
      path={path}
      query={{
        activity: query.get("activity") ?? undefined,
        view: query.get("view") ?? undefined,
      }}
    />
  );
}
