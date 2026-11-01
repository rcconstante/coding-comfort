export type Instrument = {
  version: string;
  questions: { en: string[]; fil: string[] };
  options: { en: string[]; fil: string[] };
};
export function parseInstrument(value: unknown): Instrument | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Instrument;
  if (typeof candidate.version !== "string" || candidate.version.length > 100)
    return null;
  for (const locale of ["en", "fil"] as const) {
    if (
      !candidate.questions ||
      !candidate.options ||
      !Array.isArray(candidate.questions[locale]) ||
      !Array.isArray(candidate.options[locale]) ||
      candidate.questions[locale].length !== 21 ||
      candidate.options[locale].length !== 4 ||
      [...candidate.questions[locale], ...candidate.options[locale]].some(
        (text) =>
          typeof text !== "string" || !text.trim() || text.length > 1000,
      )
    )
      return null;
  }
  return candidate;
}
