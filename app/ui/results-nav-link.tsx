"use client";

import Link from "next/link";
import { useSession, sessionResults } from "../lib/use-session";
import { ui } from "../lib/experience-copy";
import type { Locale } from "../lib/copy";

export function ResultsNavLink({
  href,
  locale,
  active,
  children,
}: {
  href: string;
  locale: Locale;
  active: boolean;
  children: React.ReactNode;
}) {
  const { session } = useSession();
  if (!sessionResults(session))
    return (
      <span
        className="nav-link nav-disabled"
        aria-disabled="true"
        title={ui[locale].noResultsBody}
      >
        {children}
      </span>
    );
  return (
    <Link
      className="nav-link"
      href={href}
      prefetch={true}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
