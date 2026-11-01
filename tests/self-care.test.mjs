import test from "node:test";
import assert from "node:assert/strict";
import { parseSession, sessionResults } from "../app/lib/use-session.ts";

test("journal and planner drafts survive reload without completing a screening", () => {
  const draft = parseSession(
    JSON.stringify({
      consent: true,
      phase: "intro",
      answers: Array(21).fill(null),
      journal: "A quiet moment today.",
      action: "custom:Take a short break",
      actionDone: true,
      researchConsent: false,
    }),
  );
  assert.equal(draft.journal, "A quiet moment today.");
  assert.equal(draft.action, "custom:Take a short break");
  assert.equal(draft.actionDone, true);
  assert.equal(draft.researchConsent, false);
  assert.equal(sessionResults(draft), null);
});
