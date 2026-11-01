import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateResults,
  severityFor,
  questions,
  responseOptions,
} from "../app/lib/dass.ts";

test("all 21 answers are required and only integer responses 0–3 are accepted", () => {
  for (const invalid of [
    [],
    Array(20).fill(0),
    Array(22).fill(0),
    Array(21),
    Array(21).fill(null),
    [4, ...Array(20).fill(0)],
    [1.5, ...Array(20).fill(0)],
    ["1", ...Array(20).fill(0)],
  ]) {
    assert.throws(() => calculateResults(invalid));
  }
});
test("minimum and maximum scores are calculated separately and doubled", () => {
  for (const value of [0, 3]) {
    const result = calculateResults(Array(21).fill(value));
    for (const key of ["depression", "anxiety", "stress"]) {
      assert.deepEqual(result[key], {
        raw: value * 7,
        score: value * 14,
        severity: value ? "extremelySevere" : "normal",
      });
    }
  }
});
test("each questionnaire item contributes only to its assigned subscale", () => {
  const groups = {
    depression: [3, 5, 10, 13, 16, 17, 21],
    anxiety: [2, 4, 7, 9, 15, 19, 20],
    stress: [1, 6, 8, 11, 12, 14, 18],
  };
  for (const [target, items] of Object.entries(groups)) {
    for (const item of items) {
      const answers = Array(21).fill(0);
      answers[item - 1] = 3;
      const results = calculateResults(answers);
      for (const key of Object.keys(groups))
        assert.equal(results[key].score, key === target ? 6 : 0);
    }
  }
});
test("every severity boundary matches the supplied requirements", () => {
  const bounds = {
    depression: [9, 13, 20, 27],
    anxiety: [7, 9, 14, 19],
    stress: [14, 18, 25, 33],
  };
  const levels = ["normal", "mild", "moderate", "severe", "extremelySevere"];
  for (const [key, cutoffs] of Object.entries(bounds)) {
    cutoffs.forEach((cutoff, index) => {
      assert.equal(severityFor(key, cutoff), levels[index]);
      assert.equal(severityFor(key, cutoff + 1), levels[index + 1]);
    });
    for (const invalid of [-1, 43, 2.5, NaN])
      assert.throws(() => severityFor(key, invalid));
  }
});
test("both languages contain 21 statements and four response options in the supplied order", () => {
  assert.equal(questions.en.length, 21);
  assert.equal(questions.fil.length, 21);
  assert.equal(responseOptions.en.length, 4);
  assert.equal(responseOptions.fil.length, 4);
  assert.equal(
    questions.fil[6],
    "Nakaranas ako ng panginginig (hal. sa kamay).",
  );
  assert.equal(
    questions.fil[20],
    "Naramdaman kong walang kahulugan ang buhay.",
  );
  assert.equal(responseOptions.fil[0], "Hindi nangyayari / nagaganap sa akin");
});
