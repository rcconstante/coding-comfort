export const subscales = ["depression", "anxiety", "stress"] as const;
export type Subscale = (typeof subscales)[number];
export type Answer = 0 | 1 | 2 | 3;
export type Severity =
  "normal" | "mild" | "moderate" | "severe" | "extremelySevere";
export type Score = { raw: number; score: number; severity: Severity };
export type Results = Record<Subscale, Score>;

const itemNumbers: Record<Subscale, readonly number[]> = {
  depression: [3, 5, 10, 13, 16, 17, 21],
  anxiety: [2, 4, 7, 9, 15, 19, 20],
  stress: [1, 6, 8, 11, 12, 14, 18],
};
const upperBounds: Record<Subscale, readonly number[]> = {
  depression: [9, 13, 20, 27],
  anxiety: [7, 9, 14, 19],
  stress: [14, 18, 25, 33],
};
const severityLevels: readonly Severity[] = [
  "normal",
  "mild",
  "moderate",
  "severe",
  "extremelySevere",
];

export function isAnswer(value: unknown): value is Answer {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 3
  );
}
export function severityFor(subscale: Subscale, score: number): Severity {
  if (!Number.isInteger(score) || score < 0 || score > 42)
    throw new RangeError("Invalid DASS-21 score");
  const index = upperBounds[subscale].findIndex((bound) => score <= bound);
  return severityLevels[index === -1 ? 4 : index];
}
export function calculateResults(answers: readonly unknown[]): Results {
  if (answers.length !== 21 || !Array.from(answers).every(isAnswer))
    throw new Error("All 21 answers must be integers from 0 to 3");
  return Object.fromEntries(
    subscales.map((subscale) => {
      const raw = itemNumbers[subscale].reduce(
        (sum, number) => sum + (answers[number - 1] as Answer),
        0,
      );
      const score = raw * 2;
      return [subscale, { raw, score, severity: severityFor(subscale, score) }];
    }),
  ) as Results;
}

export const questions = {
  en: [
    "I found it hard to wind down.",
    "I was aware of dryness of my mouth.",
    "I couldn't seem to experience any positive feeling at all.",
    "I experienced breathing difficulty (e.g. excessively rapid breathing, breathlessness in the absence of physical exertion).",
    "I found it difficult to work up the initiative to do things.",
    "I tended to over-react to situations.",
    "I experienced trembling (e.g. in the hands).",
    "I felt that I was using a lot of nervous energy.",
    "I was worried about situations in which I might panic and make a fool of myself.",
    "I felt that I had nothing to look forward to.",
    "I found myself getting agitated.",
    "I found it difficult to relax.",
    "I felt down-hearted and blue.",
    "I was intolerant of anything that kept me from getting on with what I was doing.",
    "I felt I was close to panic.",
    "I was unable to become enthusiastic about anything.",
    "I felt I wasn't worth much as a person.",
    "I felt that I was rather touchy.",
    "I was aware of the action of my heart in the absence of physical exertion (e.g. sense of heart rate increase, heart missing a beat).",
    "I felt scared without any good reason.",
    "I felt that life was meaningless.",
  ],
  fil: [
    "Nahihirapan akong kumalma.",
    "Batid ko ang panunuyo ng aking bibig.",
    "Hindi ko man lang maranasan ang makaramdam ng mabuti.",
    "Nakakaranas ako ng hirap na paghinga (hal. sobrang bilis ng paghinga, kawalan ng hininga kung hindi aapuhin ito).",
    "Nahihirapan akong magkusa na gumawa.",
    "Masyado akong nagiging intimidida sa mga sitwasyon.",
    "Nakaranas ako ng panginginig (hal. sa kamay).",
    "Naramdaman ko na masyado akong gumagamit ng aking nervous energy.",
    "Nangangamba ako sa mga sitwasyong kung saan maaari akong matuliro at makagawa nang hindi matino.",
    "Nararamdaman ko na wala naman akong inaasahan.",
    "Madali akong mainis o hindi mapakali.",
    "Nahihirapan akong magrelaks / mamahinga.",
    "Nakaramdam ako ng lungkot at panghihina ng loob.",
    "Hindi ko pinapansin ang bagay na nakakahadlang sa aking ginagawa.",
    "Naramdaman kong muntik na akong matuliro.",
    "Hindi ko nagagawang maging magilas / aktibo sa kahit anong bagay.",
    "Naramdaman kong wala akong kwenta.",
    "Naramdaman kong madali akong magdamdam o mairita.",
    "Batid ko ang galaw ng aking puso kahit hindi ako kumikilos (hal. pagbilis ng pintig, pagkawala ng pintig ng puso).",
    "Natatakot ako ng walang kadahilanan.",
    "Naramdaman kong walang kahulugan ang buhay.",
  ],
} as const;

export const responseOptions = {
  en: [
    "Did not apply to me at all",
    "Applied to me to some degree, or some of the time",
    "Applied to me to a considerable degree, or a good part of the time",
    "Applied to me very much, or most of the time",
  ],
  fil: [
    "Hindi nangyayari / nagaganap sa akin",
    "Paminsan-minsan nangyayari / nagaganap sa akin",
    "Pangkaraniwang nangyayari / nagaganap sa akin",
    "Madalas na nangyayari / nagaganap sa akin",
  ],
} as const;
