import { v, ConvexError } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";
import { severityFor, subscales } from "../app/lib/dass";
import {
  AI_CONSENT_VERSION,
  parseReflectionContent,
  type ReflectionContent,
} from "../app/lib/reflection";

export const claim = internalMutation({
  args: { sessionHash: v.string() },
  handler: async (ctx, { sessionHash }) => {
    const existing = await ctx.db
      .query("reflectionRequests")
      .withIndex("by_session", (q) => q.eq("sessionHash", sessionHash))
      .unique();
    if (existing) return false;
    const now = Date.now();
    for (const [key, duration, maximum] of [
      ["gemini-minute", 60_000, 20],
      ["gemini-day", 86_400_000, 500],
    ] as const) {
      const window = await ctx.db
        .query("requestWindows")
        .withIndex("by_key", (q) => q.eq("key", key))
        .unique();
      if (!window)
        await ctx.db.insert("requestWindows", {
          key,
          startedAt: now,
          count: 1,
        });
      else if (now - window.startedAt >= duration)
        await ctx.db.patch(window._id, { startedAt: now, count: 1 });
      else if (window.count >= maximum)
        throw new ConvexError("REFLECTION_LIMIT");
      else await ctx.db.patch(window._id, { count: window.count + 1 });
    }
    await ctx.db.insert("reflectionRequests", { sessionHash, createdAt: now });
    return true;
  },
});

const textSchema = {
  type: "OBJECT",
  properties: Object.fromEntries([
    ...[
      "summary",
      "depression",
      "anxiety",
      "stress",
      "further",
      "referral",
    ].map((key) => [key, { type: "STRING" }]),
    [
      "steps",
      { type: "ARRAY", items: { type: "STRING" }, minItems: 1, maxItems: 2 },
    ],
  ]),
  required: [
    "summary",
    "depression",
    "anxiety",
    "stress",
    "further",
    "steps",
    "referral",
  ],
};

const instruction = `You provide supportive DASS-21 explanations for Coding Comfort, a Filipino nursing research prototype.
Return one JSON object with en (simple English) and fil (natural accessible Filipino) versions with equivalent meaning.
In Filipino use the interface labels: depression = depresyon, anxiety = pagkabalisa, stress = stress; normal = normal, mild = banayad, moderate = katamtaman, severe = malubha, extremely severe = lubhang malubha. Explain these as antas ng naiulat na sintomas; avoid English medical jargon where plain Filipino works.
Each language has summary, depression, anxiety, stress, further, steps (one or two short low-risk actions), referral. Use plain, warm, accessible words, not technical or product language. Never name the model, API, database, backend, or provider.
Use only the supplied conventional doubled scores and independently computed severities. Do not change scores or combine subscales. Explain each subscale in 1 or 2 short sentences: its everyday meaning and actual symptom range. Refer to reported symptoms over the past week. Avoid repeating the same disclaimer in every paragraph; the interface clearly displays the non-diagnostic disclaimer.
summary: 2 supportive nonjudgmental sentences tailored to this actual score pattern, never identical boilerplate for all participants. Depression, anxiety and stress are separate but may overlap. Describe only what responses report, never assert how the person actually feels or their overall health. The interface supplies the informational/non-diagnostic disclaimer. Do not infer individual answers, causes, life events, age, gender, diagnoses, risk, or daily functioning.
For zero or normal-range scores, say only that responses fall in the normal symptom range for the past week. Never say the person is healthy, balanced, safe, doing well, fine, calm, relaxed, free of distress, or maintaining current well-being. Never congratulate a score or infer a positive emotional state from it. Low scores do not rule out concerns or a need for professional support.
further: 2 sentences explaining that scores reflect a limited past-week self-report, not certainty, and that low scores do not rule out a need for help.
steps: one or two realistic optional actions such as a short comfortable breathing break, one small task, rest, or talking to someone trusted. No guarantees, prescriptions, or medication/treatment changes.
referral: 2 short sentences in everyday language. If any subscale is moderate, suggest considering a qualified professional especially if experiences persist or affect daily life; if severe or extremely severe, encourage timely professional assessment. Do not infer immediate danger from a score. For normal/mild, offer self-care and access to support whenever wanted. Do not imply that anyone has been contacted or a referral completed. AI cannot replace qualified professional judgment.
Never diagnose, claim clinical certainty, classify clinical risk, predict future conditions, prescribe, suggest stopping treatment, call someone mentally healthy, or imply automatic monitoring/contact. Do not give phone numbers, URLs, or fabricated services. Keep each text field under 65 words and each step under 25 words. Output plain text without HTML or Markdown.`;

export const generate = action({
  args: {
    submissionKey: v.string(),
    scores: v.object({
      depression: v.number(),
      anxiety: v.number(),
      stress: v.number(),
    }),
    consent: v.boolean(),
    consentVersion: v.string(),
  },
  handler: async (ctx, args): Promise<ReflectionContent> => {
    if (!args.consent || args.consentVersion !== AI_CONSENT_VERSION)
      throw new ConvexError("REFLECTION_CONSENT_REQUIRED");
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        args.submissionKey,
      )
    )
      throw new ConvexError("INVALID_REFLECTION_SESSION");
    const scores = subscales.map((subscale) => {
      const score = args.scores[subscale];
      if (
        !Number.isInteger(score) ||
        score < 0 ||
        score > 42 ||
        score % 2 !== 0
      )
        throw new ConvexError("INVALID_REFLECTION_SCORE");
      return {
        subscale,
        score,
        maximum: 42,
        severity: severityFor(subscale, score),
      };
    });
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new ConvexError("REFLECTION_UNAVAILABLE");
    const sessionHash = bytesToHex(sha256(utf8ToBytes(args.submissionKey)));
    if (!(await ctx.runMutation(internal.reflection.claim, { sessionHash })))
      throw new ConvexError("REFLECTION_ALREADY_REQUESTED");
    // A claimed session is never retried, including provider failures and client disconnects.
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          signal: AbortSignal.timeout(55_000),
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: instruction }] },
            contents: [
              {
                role: "user",
                parts: [{ text: JSON.stringify({ pastWeekScores: scores }) }],
              },
            ],
            generationConfig: {
              maxOutputTokens: 5000,
              thinkingConfig: { thinkingLevel: "low" },
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: { en: textSchema, fil: textSchema },
                required: ["en", "fil"],
              },
            },
          }),
        },
      );
      if (!response.ok) {
        console.warn("Gemini request rejected", { status: response.status });
        throw new Error("Provider unavailable");
      }
      const data = (await response.json()) as {
        candidates?: {
          finishReason?: string;
          content?: { parts?: { text?: string; thought?: boolean }[] };
        }[];
      };
      const candidate = data.candidates?.[0];
      if (candidate?.finishReason !== "STOP")
        throw new Error("Incomplete response");
      const text =
        candidate.content?.parts
          ?.filter((part) => !part.thought)
          .map((part) => part.text ?? "")
          .join("") ?? "";
      const reflection = parseReflectionContent(JSON.parse(text));
      if (!reflection) throw new Error("Invalid response");
      return reflection;
    } catch {
      // Do not expose provider responses, scores, or credentials in application errors/logs.
      throw new ConvexError("REFLECTION_FAILED");
    }
  },
});
