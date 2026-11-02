import test from "node:test";
import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { convexTest } from "convex-test";
import schema from "../convex/schema.ts";
import { api, internal } from "../convex/_generated/api.js";
import {
  RESEARCH_CONSENT_VERSION,
  FEEDBACK_CONSENT_VERSION,
} from "../app/lib/research-validation.ts";
import { calculateResults } from "../app/lib/dass.ts";
const modules = {
  "../convex/_generated/server.ts": () =>
    import("../convex/_generated/server.js"),
};
for (const name of await readdir(new URL("../convex/", import.meta.url)))
  if (name.endsWith(".ts"))
    modules[`../convex/${name}`] = () =>
      import(new URL(`../convex/${name}`, import.meta.url).href);

test("record corrections enforce admin access, update derived totals, preserve history, and reject stale writes", async () => {
  const t = convexTest(schema, modules);
  const [adminId, readerId] = await t.run(async (ctx) => {
    const a = await ctx.db.insert("users", {}),
      r = await ctx.db.insert("users", {});
    for (const [userId, role] of [
      [a, "admin"],
      [r, "researcher"],
    ])
      await ctx.db.insert("researchers", {
        userId,
        role,
        account: role,
        active: true,
        mustChangePassword: false,
      });
    return [a, r];
  });
  const admin = t.withIdentity({ subject: adminId }),
    reader = t.withIdentity({ subject: readerId });
  await t.mutation(internal.instruments.seed, {});
  const token = crypto.randomUUID();
  const { id } = await t.mutation(api.research.submitScreening, {
    token,
    submissionKey: crypto.randomUUID(),
    locale: "en",
    answers: Array(21).fill(0),
    consent: true,
    consentVersion: RESEARCH_CONSENT_VERSION,
    instrumentVersion: "dass21-pdf-v1",
  });
  const row = await t.run((ctx) => ctx.db.get(id));
  const edit = {
    id,
    expectedUpdatedAt: row._creationTime,
    answers: Array(21).fill(3),
    locale: "fil",
    reason: "Correct transcription",
  };
  await assert.rejects(t.mutation(api.dataManagement.editScreening, edit));
  await assert.rejects(reader.mutation(api.dataManagement.editScreening, edit));
  await assert.rejects(
    admin.mutation(api.dataManagement.editScreening, { ...edit, answers: [4] }),
  );
  await admin.mutation(api.dataManagement.editScreening, edit);
  const corrected = await t.run((ctx) => ctx.db.get(id));
  assert.deepEqual(
    corrected.depression,
    calculateResults(edit.answers).depression,
  );
  assert.equal(corrected.instrumentVersion, row.instrumentVersion);
  assert.equal(corrected.submittedAt, row.submittedAt);
  await assert.rejects(admin.mutation(api.dataManagement.editScreening, edit));
  let summary = await admin.query(api.research.summary, {});
  assert.deepEqual(summary.severities.depression, [0, 0, 0, 0, 1]);
  const history = await admin.query(api.dataManagement.revisions, {
    recordId: id,
  });
  assert.equal(history.length, 1);
  assert.deepEqual(JSON.parse(history[0].before).answers, Array(21).fill(0));
  assert.equal(JSON.parse(history[0].before).submissionKey, undefined);
  await assert.rejects(
    reader.query(api.dataManagement.revisions, { recordId: id }),
  );
  const eid = await t.mutation(api.research.submitEvaluation, {
    token,
    submissionKey: crypto.randomUUID(),
    locale: "en",
    consent: true,
    consentVersion: FEEDBACK_CONSENT_VERSION,
    ease: 1,
    clarity: 2,
    overall: 3,
    comment: "Original",
  });
  const evaluation = await t.run((ctx) => ctx.db.get(eid));
  await admin.mutation(api.dataManagement.editEvaluation, {
    id: eid,
    expectedUpdatedAt: evaluation._creationTime,
    locale: "en",
    ease: 5,
    clarity: 4,
    overall: 5,
    comment: "Corrected",
    reason: "Correct transcription",
  });
  summary = await admin.query(api.research.summary, {});
  assert.deepEqual(summary.averages, { ease: 5, clarity: 4, overall: 5 });
  await assert.rejects(
    reader.mutation(api.dataManagement.reset, {
      confirmation: "RESET PILOT DATA",
    }),
  );
  await assert.rejects(
    admin.mutation(api.dataManagement.reset, { confirmation: "reset" }),
  );
  await t.run(async (ctx) => {
    for (let i = 0; i < 205; i++)
      await ctx.db.insert("participants", {
        tokenHash: `fixture-${i}`,
        consentedAt: Date.now(),
        consentVersion: RESEARCH_CONSENT_VERSION,
      });
    await ctx.db.insert("surveySettings", { key: "external", url: "" });
  });
  await admin.mutation(api.dataManagement.reset, {
    confirmation: "RESET PILOT DATA",
  });
  await assert.rejects(
    t.mutation(api.research.submitEvaluation, {
      token,
      submissionKey: crypto.randomUUID(),
      locale: "en",
      consent: true,
      consentVersion: FEEDBACK_CONSENT_VERSION,
      ease: 1,
      clarity: 2,
      overall: 3,
      comment: "During reset",
    }),
  );
  await t.finishAllScheduledFunctions(
    () => new Promise((resolve) => setTimeout(resolve, 10)),
  );
  assert.equal(
    (await admin.query(api.dataManagement.status, {})).status,
    "complete",
  );
  for (const table of [
    "participants",
    "screenings",
    "evaluations",
    "recordRevisions",
    "statistics",
  ])
    assert.equal(
      await t.run(async (ctx) => (await ctx.db.query(table).collect()).length),
      0,
      table,
    );
  for (const table of [
    "researchers",
    "instruments",
    "surveySettings",
    "auditLog",
  ])
    assert.ok(
      (await t.run(
        async (ctx) => (await ctx.db.query(table).collect()).length,
      )) > 0,
      table,
    );
  summary = await admin.query(api.research.summary, {});
  assert.equal(summary.participants, 0);
  await t.mutation(api.research.submitEvaluation, {
    token: crypto.randomUUID(),
    submissionKey: crypto.randomUUID(),
    locale: "en",
    consent: true,
    consentVersion: FEEDBACK_CONSENT_VERSION,
    ease: 3,
    clarity: 3,
    overall: 3,
    comment: "After reset",
  });
  assert.equal((await admin.query(api.research.summary, {})).evaluations, 1);
});
