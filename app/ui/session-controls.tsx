"use client";

import { useRouter } from "next/navigation";
import { clearSession, useSession } from "../lib/use-session";
import { ui } from "../lib/experience-copy";
import type { Locale } from "../lib/copy";

export function SessionControls({ locale }: { locale: Locale }) {
  const { session } = useSession();
  const router = useRouter();
  if (!session.consent) return null;
  return (
    <div className="session-controls">
      <button
        type="button"
        onClick={() => {
          clearSession();
          router.push(`/dashboard?lang=${locale}`);
        }}
      >
        {ui[locale].endSession}
      </button>
    </div>
  );
}
