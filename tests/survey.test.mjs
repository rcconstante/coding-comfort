import test from "node:test";
import assert from "node:assert/strict";
import { validateSurveyUrl } from "../app/lib/survey.ts";

test("external survey accepts only public HTTPS Google Forms response links", () => {
  assert.equal(
    validateSurveyUrl("  https://forms.gle/Example123  "),
    "https://forms.gle/Example123",
  );
  assert.equal(
    validateSurveyUrl("https://docs.google.com/forms/d/e/Example123/viewform"),
    "https://docs.google.com/forms/d/e/Example123/viewform",
  );
  assert.equal(validateSurveyUrl(""), "");
  for (const input of [
    "javascript:alert(1)",
    "http://forms.gle/abc",
    "https://forms.gle.evil.test/abc",
    "https://user@forms.gle/abc",
    "https://docs.google.com/forms/d/abc/edit",
    "https://forms.gle/abc?email=participant@example.com",
    "https://forms.gle/abc#details",
  ])
    assert.throws(() => validateSurveyUrl(input));
});
