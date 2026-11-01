"use node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { severityFor, subscales } from "../app/lib/dass";
import {
  composeReflection,
  parseSelection,
} from "../app/lib/reflection-policy";
import { encryptReflection } from "../app/lib/reflection-crypto";
const scoresValidator = v.object({
  depression: v.number(),
  anxiety: v.number(),
  stress: v.number(),
});
export const perform = internalAction({
  args: {
    id: v.id("reflectionRequests"),
    scores: scoresValidator,
    publicKey: v.string(),
  },
  handler: async (ctx, args) => {
    let stage = "request";
    try {
      const key = process.env.GEMINI_API_KEY;
      if (!key) throw new Error("Unavailable");
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": key,
          },
          signal: AbortSignal.timeout(55000),
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: "Select supportive wording and one or two different low-risk self-care steps for a DASS-21 explanation based on these separate past-week scores. Return only JSON: opening is 0 (thank you for checking in), 1 (reflect at your own pace), or 2 (understanding experiences matters); steps contains one or two different IDs: 0 comfortable breathing break, 1 one manageable task, 2 talk with a trusted person, 3 rest. Never diagnose, prescribe, infer danger or overall health. The application supplies all explanations and clinical boundaries.",
                },
              ],
            },
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: JSON.stringify(
                      subscales.map((scale) => ({
                        scale,
                        score: args.scores[scale],
                        severity: severityFor(scale, args.scores[scale]),
                      })),
                    ),
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: 512,
              thinkingConfig: { thinkingLevel: "low" },
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  opening: { type: "INTEGER", minimum: 0, maximum: 2 },
                  steps: {
                    type: "ARRAY",
                    items: { type: "INTEGER", minimum: 0, maximum: 3 },
                    minItems: 1,
                    maxItems: 2,
                  },
                },
                required: ["opening", "steps"],
              },
            },
          }),
        },
      );
      if (!response.ok) throw new Error("Unavailable");
      stage = "response";
      const data = (await response.json()) as {
        candidates?: {
          finishReason?: string;
          content?: { parts?: { text?: string; thought?: boolean }[] };
        }[];
      };
      const candidate = data.candidates?.[0];
      if (candidate?.finishReason !== "STOP") throw new Error("Incomplete");
      stage = "selection";
      const selection = parseSelection(
        JSON.parse(
          candidate.content?.parts
            ?.filter((p) => !p.thought)
            .map((p) => p.text ?? "")
            .join("") ?? "",
        ),
      );
      if (!selection) throw new Error("Invalid");
      stage = "encrypt";
      await ctx.runMutation(internal.reflection.finish, {
        id: args.id,
        envelope: await encryptReflection(
          composeReflection(args.scores, selection),
          args.publicKey,
        ),
      });
    } catch {
      console.warn("Reflection job could not finish", { stage });
      await ctx.runMutation(internal.reflection.finish, { id: args.id });
    }
  },
});
