export const RESET_PHRASE = "RESET PILOT DATA";
export function validateCorrectionReason(reason: string) {
  const value = reason.trim();
  if (value.length < 5 || value.length > 500 || /[\u0000-\u001f]/.test(value))
    throw new Error(
      "Enter a correction reason of 5–500 characters without line breaks.",
    );
  return value;
}
