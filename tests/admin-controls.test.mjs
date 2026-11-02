import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "../app/ui/button.tsx";
import { parsePickerDate } from "../app/lib/calendar.ts";
import { validateFirstName } from "../app/lib/research-validation.ts";

test("busy action keeps its label, announces busy state, and prevents duplicate submission", () => {
  const html = renderToStaticMarkup(
    createElement(Button, { loading: true }, "Sign in"),
  );
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /loading-spinner/);
  assert.match(html, />Sign in</);
  assert.ok(!html.includes("Signing"));
  const normal = renderToStaticMarkup(createElement(Button, null, "Sign in"));
  assert.ok(!normal.includes("loading-spinner"));
});
test("calendar picker preserves local calendar dates and rejects impossible dates", () => {
  for (const value of ["2026-11-02", "2024-02-29", "0099-01-01"]) {
    const date = parsePickerDate(value);
    const [year, month, day] = value.split("-").map(Number);
    assert.equal(date.getFullYear(), year);
    assert.equal(date.getMonth() + 1, month);
    assert.equal(date.getDate(), day);
    assert.equal(date.getHours(), 12);
  }
  for (const value of ["", "2026-02-29", "2026-13-01", "2026-11-02T00:00:00Z"])
    assert.equal(parsePickerDate(value), undefined);
});
test("staff first name supports real names without markup or oversized input", () => {
  assert.equal(validateFirstName("  María  "), "María");
  assert.equal(validateFirstName("Anne-Marie"), "Anne-Marie");
  for (const value of ["", "<img src=x>", "a".repeat(61), "123"])
    assert.throws(() => validateFirstName(value));
});
