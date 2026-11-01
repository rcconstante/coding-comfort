"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function PublicFooter() {
  const locale = useSearchParams().get("lang") === "fil" ? "fil" : "en";
  return (
    <footer className="public-footer page-width" lang={locale}>
      <Link href={`/privacy?lang=${locale}`} prefetch={true}>
        {locale === "fil" ? "Patakaran sa privacy" : "Privacy policy"}
      </Link>
      <Link href={`/contact?lang=${locale}`} prefetch={true}>
        {locale === "fil" ? "Kontakin ang team" : "Contact the team"}
      </Link>
    </footer>
  );
}
