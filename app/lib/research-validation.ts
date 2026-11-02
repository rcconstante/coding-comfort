export const RESEARCH_CONSENT_VERSION = "research-2026-11-01-v1";
export const FEEDBACK_CONSENT_VERSION = "feedback-2026-11-01-v1";
export const EVALUATION_QUESTIONS = {
  en: [
    "How easy was the site to use?",
    "How clear were the instructions and explanations?",
    "How would you rate your overall experience?",
  ],
  fil: [
    "Gaano kadaling gamitin ang site?",
    "Gaano kalinaw ang mga tagubilin at paliwanag?",
    "Paano mo ire-rate ang kabuuang karanasan mo?",
  ],
} as const;
export function validateEvaluation(
  ease: number,
  clarity: number,
  overall: number,
  comment: string,
) {
  if (
    ![ease, clarity, overall].every(
      (value) => Number.isInteger(value) && value >= 1 && value <= 5,
    )
  )
    throw new Error("Choose a rating from 1 to 5 for every question.");
  if (
    comment.length > 2000 ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(comment)
  )
    throw new Error(
      "Feedback must contain at most 2,000 characters of plain text.",
    );
  return { ease, clarity, overall, comment: comment.trim() };
}
export function validateAccount(account: string) {
  const normalized = account.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._+@-]{2,253}$/.test(normalized))
    throw new Error("Use a valid email address or username.");
  return normalized;
}
export function validateFirstName(input: string) {
  const value = input.trim().replace(/\s+/g, " ");
  if (!/^[\p{L}\p{M}][\p{L}\p{M} .'-]{0,59}$/u.test(value))
    throw new Error("Enter a first name of up to 60 letters.");
  return value;
}
export function validateNewPassword(password: string, account: string) {
  if (
    password.length < 12 ||
    password.length > 128 ||
    password.toLowerCase() === account.toLowerCase()
  )
    throw new Error(
      "Use 12–128 characters and a password different from your email or username.",
    );
}
export function validatePasswordChange(
  newPassword: string,
  currentPassword: string,
  account: string,
) {
  validateNewPassword(newPassword, account);
  if (newPassword === currentPassword)
    throw new Error("Choose a password different from your current password.");
}
export function safeSpreadsheetText(value: string) {
  return /^[\s]*[=+@-]/.test(value) ? `'${value}` : value;
}
export function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const stamp = Date.parse(`${value}T00:00:00Z`);
  return (
    Number.isFinite(stamp) &&
    new Date(stamp).toISOString().slice(0, 10) === value
  );
}
