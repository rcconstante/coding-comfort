import test from "node:test";
import assert from "node:assert/strict";
import {
  validateEvaluation,
  validateAccount,
  validateNewPassword,
  safeSpreadsheetText,
} from "../app/lib/research-validation.ts";
import { parseInstrument } from "../app/lib/instrument.ts";

test("evaluation requires three bounded integer ratings and plain-text feedback", () => {
  assert.deepEqual(validateEvaluation(1, 3, 5, " hello "), {
    ease: 1,
    clarity: 3,
    overall: 5,
    comment: "hello",
  });
  for (const value of [0, 6, 1.5, NaN])
    assert.throws(() => validateEvaluation(value, 3, 3, ""));
  assert.throws(() => validateEvaluation(3, 3, 3, "x".repeat(2001)));
  assert.throws(() => validateEvaluation(3, 3, 3, "bad\u0000text"));
});
test("administrator accounts normalize consistently and private passwords cannot equal the account", () => {
  assert.equal(
    validateAccount(" Researcher@Example.com "),
    "researcher@example.com",
  );
  assert.throws(() => validateAccount("<script>"));
  assert.throws(() => validateNewPassword("short", "researcher@example.com"));
  assert.throws(() =>
    validateNewPassword("researcher@example.com", "researcher@example.com"),
  );
  assert.doesNotThrow(() =>
    validateNewPassword("a-private-long-passphrase", "researcher@example.com"),
  );
});
test("spreadsheet comments cannot become formulas", () => {
  for (const text of [
    '=HYPERLINK("x")',
    "+1+1",
    "-10",
    "@SUM(1)",
    "  =1",
    "\t+1",
  ])
    assert.equal(safeSpreadsheetText(text), `'${text}`);
  assert.equal(
    safeSpreadsheetText("Helpful and easy to use."),
    "Helpful and easy to use.",
  );
});
test("questionnaire snapshots require exactly 21 statements and four options in both languages", () => {
  const instrument = {
    version: "test",
    questions: {
      en: Array(21).fill("English"),
      fil: Array(21).fill("Filipino"),
    },
    options: { en: ["a", "b", "c", "d"], fil: ["a", "b", "c", "d"] },
  };
  assert.deepEqual(parseInstrument(instrument), instrument);
  assert.equal(
    parseInstrument({
      ...instrument,
      questions: { ...instrument.questions, fil: [] },
    }),
    null,
  );
  assert.equal(
    parseInstrument({
      ...instrument,
      options: { ...instrument.options, en: ["a"] },
    }),
    null,
  );
  assert.equal(parseInstrument(null), null);
});
