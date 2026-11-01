import type { Locale } from "../../lib/copy";
import { researchCopy } from "../../lib/research-copy";
import { ActionLink } from "./shared";

export function ExperienceInvite({ locale }: { locale: Locale }) {
  return (
    <div className="evaluation-invite">
      <ActionLink href="/evaluation" locale={locale} secondary>
        {researchCopy[locale].evaluate}
      </ActionLink>
    </div>
  );
}
