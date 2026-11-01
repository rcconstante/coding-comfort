import { ui } from "./experience-copy";
import { severityFor, subscales, type Subscale } from "./dass";
import type { ReflectionContent } from "./reflection";
export type ReflectionScores = Record<Subscale, number>;
export type Selection = { opening: number; steps: number[] };
export function parseSelection(value: unknown): Selection | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    !Number.isInteger(row.opening) ||
    Number(row.opening) < 0 ||
    Number(row.opening) > 2 ||
    !Array.isArray(row.steps) ||
    row.steps.length < 1 ||
    row.steps.length > 2 ||
    !row.steps.every((n) => Number.isInteger(n) && n >= 0 && n <= 3) ||
    new Set(row.steps).size !== row.steps.length
  )
    return null;
  return { opening: Number(row.opening), steps: row.steps };
}
export function composeReflection(
  scores: ReflectionScores,
  selection: Selection,
): ReflectionContent {
  for (const scale of subscales)
    if (scores[scale] % 2 !== 0) throw new Error("Invalid score");
  const result = {} as ReflectionContent;
  for (const locale of ["en", "fil"] as const) {
    const t = ui[locale];
    const fil = locale === "fil";
    const opening = fil
      ? [
          "Salamat sa paglalaan ng oras para kumustahin ang sarili.",
          "Maaari mong pagnilayan ang mga resultang ito sa sarili mong bilis.",
          "Mahalaga ang pag-unawa sa sarili mong karanasan.",
        ]
      : [
          "Thank you for taking time to check in with yourself.",
          "You can reflect on these results at your own pace.",
          "Making space to understand your experiences matters.",
        ];
    const meanings = fil
      ? {
          depression:
            "Tungkol ito sa naiulat na lungkot, kawalan ng gana, o hirap makaramdam ng kasiyahan.",
          anxiety:
            "Tungkol ito sa naiulat na kaba, takot, o pisikal na senyales ng pagkabalisa.",
          stress:
            "Tungkol ito sa naiulat na tensyon, pagkairita, o hirap magrelaks.",
        }
      : {
          depression:
            "This area describes reported low mood, loss of interest, or difficulty feeling enjoyment.",
          anxiety:
            "This area describes reported fear, nervousness, or physical experiences of anxiety.",
          stress:
            "This area describes reported tension, irritability, or difficulty relaxing.",
        };
    const steps = fil
      ? [
          "Magpahinga sandali at huminga nang dahan-dahan sa komportableng paraan.",
          "Pumili ng isang maliit at kayang gawin na gawain.",
          "Makipag-usap sa isang taong pinagkakatiwalaan mo kung nais mo.",
          "Maglaan ng kaunting oras para sa pahinga.",
        ]
      : [
          "Take a short break and breathe slowly at a comfortable pace.",
          "Choose one small, manageable task.",
          "Talk with someone you trust if you would like to.",
          "Make a little space for rest.",
        ];
    const fields = {} as Record<Subscale, string>;
    const guidance: string[] = [];
    for (const scale of subscales) {
      const severity = severityFor(scale, scores[scale]);
      fields[scale] =
        `${meanings[scale]} ${fil ? "Ang score mong" : "Your score of"} ${scores[scale]} ${fil ? "ay nasa antas na" : "falls in the"} ${t[severity].toLowerCase()} ${fil ? "para sa naiulat na sintomas nitong nakaraang linggo." : "range for symptoms reported over the past week."}`;
      guidance.push(
        {
          normal: t.recommendationNormal,
          mild: t.recommendationMild,
          moderate: t.recommendationModerate,
          severe: t.recommendationSevere,
          extremelySevere: t.recommendationExtreme,
        }[severity],
      );
    }
    result[locale] = {
      ...fields,
      summary: `${opening[selection.opening]} ${subscales.map((scale) => `${t[scale]}: ${t[severityFor(scale, scores[scale])]}`).join("; ")}. ${fil ? "Magkakahiwalay ang mga karanasang ito, bagama’t maaari silang magkaugnay." : "These experiences are separate, although they may overlap."}`,
      further: fil
        ? "Batay lamang ito sa iyong mga sagot nitong nakaraang linggo, hindi sa kumpletong pagsusuri. Hindi nangangahulugan ang mababang score na wala ka nang pangangailangan para sa suporta."
        : "These scores reflect only your responses over the past week, not a complete assessment. Low scores do not rule out concerns or a need for support.",
      steps: selection.steps.map((index) => steps[index]),
      referral: [...new Set(guidance)].join(" "),
    };
  }
  return result;
}
