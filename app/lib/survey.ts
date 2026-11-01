export function validateSurveyUrl(input: string): string {
  const value = input.trim();
  if (!value) return "";
  if (value.length > 2048) throw new Error("Enter a Google Forms link.");
  const url = new URL(value);
  const validPath =
    (url.hostname === "forms.gle" && /^\/[A-Za-z0-9_-]+$/.test(url.pathname)) ||
    (url.hostname === "docs.google.com" &&
      /^\/forms\/d\/(?:e\/)?[A-Za-z0-9_-]+\/viewform\/?$/.test(url.pathname));
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !validPath ||
    url.search ||
    url.hash
  )
    throw new Error(
      "Use a public Google Forms response link without extra parameters.",
    );
  return url.href;
}
