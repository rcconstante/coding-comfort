import test from "node:test";
import assert from "node:assert/strict";
import { reflectionCopy } from "../app/lib/reflection-copy.ts";
import { researchCopy } from "../app/lib/research-copy.ts";
import { ui } from "../app/lib/experience-copy.ts";
import {
  parseReflectionContent,
  parseSavedReflection,
  hasUnsafeReflectionClaim,
} from "../app/lib/reflection.ts";

const text = {
  summary: "Separate past-week scores.",
  depression: "A symptom range, not a diagnosis.",
  anxiety: "A symptom range, not a diagnosis.",
  stress: "A symptom range, not a diagnosis.",
  further: "Scores are self-report, not certainty.",
  steps: ["Take a short break."],
  referral: "Consider qualified professional support.",
};
const content = {
  en: text,
  fil: { ...text, summary: "Magkakahiwalay ang mga score." },
};
test("public consent and reflection copy use plain labels with a visible non-diagnostic disclaimer", () => {
  for (const copy of [reflectionCopy, researchCopy, ui])
    assert.doesNotMatch(
      JSON.stringify(copy),
      /Gemini|Convex|backend|one-way session hash|localStorage/i,
    );
  assert.match(
    reflectionCopy.en.disclaimer,
    /information and support.*not a diagnosis/i,
  );
  assert.match(
    reflectionCopy.fil.disclaimer,
    /impormasyon at suporta.*hindi.*diagnosis/i,
  );
});
test("unsafe diagnostic, prescription, prediction, and low-score reassurance claims are rejected", () => {
  for (const claim of [
    "You have depression.",
    "You appear to be doing well.",
    "You are mentally healthy.",
    "You have been feeling generally calm and relaxed.",
    "Stop taking your prescribed medication.",
    "You will develop depression.",
    "Itigil ang iyong gamot.",
  ]) {
    assert.equal(hasUnsafeReflectionClaim(claim), true);
    assert.equal(
      parseReflectionContent({ ...content, en: { ...text, summary: claim } }),
      null,
    );
  }
  assert.equal(
    hasUnsafeReflectionClaim(
      "Your responses fall in the normal symptom range. Low scores do not rule out concerns or a need for support.",
    ),
    false,
  );
  assert.deepEqual(parseReflectionContent(content), content);
});
test("Gemini responses require complete bilingual text and one or two bounded self-care steps", () => {
  assert.deepEqual(parseReflectionContent(content), content);
  for (const value of [
    null,
    { en: text },
    { ...content, fil: { ...text, steps: [] } },
    { ...content, en: { ...text, steps: ["a", "b", "c"] } },
    { ...content, en: { ...text, summary: "x".repeat(1801) } },
    { ...content, en: { ...text, referral: "" } },
  ])
    assert.equal(parseReflectionContent(value), null);
});
test("local reflection state keeps pending/error markers and refuses malformed cached results", () => {
  const submissionKey = "11111111-1111-4111-8111-111111111111";
  for (const status of ["pending", "error", "ready"]) {
    const saved = {
      submissionKey,
      status,
      content: status === "ready" ? content : null,
      policyVersion: "reviewed-v1",
    };
    assert.deepEqual(parseSavedReflection(saved), saved);
  }
  assert.equal(
    parseSavedReflection({ submissionKey, status: "ready", content }).status,
    "error",
  );
  assert.equal(
    parseSavedReflection({ submissionKey, status: "ready", content: null })
      .status,
    "error",
  );
  assert.equal(
    parseSavedReflection({ submissionKey: "broken", status: "ready", content }),
    null,
  );
  assert.equal(
    parseSavedReflection({ submissionKey, status: "retry", content }),
    null,
  );
});
