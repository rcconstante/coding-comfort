export const AI_CONSENT_VERSION = "gemini-scores-2026-11-01-v1";
export type ReflectionText = {
  summary: string;
  depression: string;
  anxiety: string;
  stress: string;
  further: string;
  steps: string[];
  referral: string;
};
export type ReflectionContent = { en: ReflectionText; fil: ReflectionText };
export type SavedReflection = {
  submissionKey: string;
  status: "pending" | "ready" | "error";
  content: ReflectionContent | null;
  publicKey?: string;
  privateKey?: string;
  policyVersion?: "reviewed-v1";
};
const unsafeClaims = [
  /\byou (?:have|suffer from|are suffering from|are diagnosed with) (?:clinical |major |an? )?(?:depression|anxiety disorder|mental (?:illness|disorder))/i,
  /\byou (?:are|seem|appear|sound)(?: to be)? (?:doing well|mentally healthy|safe|fine|feeling balanced)/i,
  /\byou(?:'re| are| have been) (?:feeling )?(?:generally )?(?:calm and relaxed|balanced|mentally healthy)/i,
  /\b(?:start|stop|increase|decrease|discontinue) (?:taking )?(?:your )?(?:prescribed )?(?:medication|treatment|antidepressants)/i,
  /\byou will (?:develop|recover from|overcome) (?:depression|anxiety|a mental)/i,
  /\b(?:mayroon kang|may) (?:clinical depression|depresyon|anxiety disorder)/i,
  /\b(?:itigil|tigilan|dagdagan|bawasan) (?:ang )?(?:iyong )?(?:gamot|medikasyon)/i,
  /\b(?:tiyak na|siguradong) (?:may depresyon ka|malusog ang iyong pag-iisip)/i,
];
export function hasUnsafeReflectionClaim(text: string) {
  return unsafeClaims.some((pattern) => pattern.test(text));
}
export function parseReflectionContent(
  value: unknown,
): ReflectionContent | null {
  if (!value || typeof value !== "object") return null;
  const result: Record<string, ReflectionText> = {};
  for (const locale of ["en", "fil"] as const) {
    const text = (value as Record<string, unknown>)[locale];
    if (!text || typeof text !== "object") return null;
    const row = text as Record<string, unknown>;
    const fields = [
      "summary",
      "depression",
      "anxiety",
      "stress",
      "further",
      "referral",
    ] as const;
    if (
      !fields.every(
        (field) =>
          typeof row[field] === "string" &&
          row[field].trim().length > 0 &&
          row[field].length <= 1800,
      )
    )
      return null;
    if (
      !Array.isArray(row.steps) ||
      row.steps.length < 1 ||
      row.steps.length > 2 ||
      !row.steps.every(
        (step) =>
          typeof step === "string" &&
          step.trim().length > 0 &&
          step.length <= 600,
      )
    )
      return null;
    result[locale] = Object.fromEntries([
      ...fields.map((field) => [field, row[field]]),
      ["steps", row.steps],
    ]) as ReflectionText;
  }
  if (
    Object.values(result).some((text) =>
      Object.values(text)
        .flat()
        .some((value) => hasUnsafeReflectionClaim(value)),
    )
  )
    return null;
  return result as ReflectionContent;
}
export function parseSavedReflection(value: unknown): SavedReflection | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.submissionKey !== "string" ||
    row.submissionKey.length !== 36 ||
    !["pending", "ready", "error"].includes(String(row.status))
  )
    return null;
  const content = parseReflectionContent(row.content);
  return {
    submissionKey: row.submissionKey,
    status:
      row.status === "ready" &&
      (!content || row.policyVersion !== "reviewed-v1")
        ? "error"
        : (row.status as SavedReflection["status"]),
    content,
    ...(row.policyVersion === "reviewed-v1"
      ? { policyVersion: "reviewed-v1" as const }
      : {}),
    ...(typeof row.publicKey === "string" && row.publicKey.length <= 1500
      ? { publicKey: row.publicKey }
      : {}),
    ...(typeof row.privateKey === "string" && row.privateKey.length <= 5000
      ? { privateKey: row.privateKey }
      : {}),
  };
}
