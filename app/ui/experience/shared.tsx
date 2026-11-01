import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "../button";
import type { Locale } from "../../lib/copy";

export function Asset({
  name,
  size = 48,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={`/${name}.png`}
      alt=""
      width={size}
      height={size}
      className={`ui-asset ${className}`}
    />
  );
}
export function PageHeading({
  asset,
  title,
  description,
}: {
  asset: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="experience-heading">
      <div>
        <Asset name={asset} size={44} />
        <h1>{title}</h1>
      </div>
      {description && <p>{description}</p>}
    </div>
  );
}
export function Info({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`experience-info ${className}`}>
      <HugeiconsIcon
        icon={InformationCircleIcon}
        size={20}
        aria-hidden="true"
      />
      <div>{children}</div>
    </div>
  );
}
export function ActionLink({
  href,
  locale,
  children,
  secondary = false,
}: {
  href: string;
  locale: Locale;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Button
      asChild
      variant={secondary ? "ghost" : "default"}
      className={`pill-button ${secondary ? "pill-secondary" : ""}`}
    >
      <Link href={`${href}${href.includes("?") ? "&" : "?"}lang=${locale}`}>
        {children}
        <HugeiconsIcon icon={ArrowRight01Icon} size={16} aria-hidden="true" />
      </Link>
    </Button>
  );
}
