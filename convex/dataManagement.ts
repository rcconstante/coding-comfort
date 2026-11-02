import { v, ConvexError } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin, requireResearcher } from "./permissions";
import { assertDataWritable, researchDataState } from "./dataAccess";
import { calculateResults, subscales } from "../app/lib/dass";
import { validateEvaluation } from "../app/lib/research-validation";
import {
  RESET_PHRASE,
  validateCorrectionReason,
} from "../app/lib/data-management";

const tables = [
  "screenings",
  "evaluations",
  "recordRevisions",
  "participants",
  "statistics",
] as const;
const locale = v.union(v.literal("en"), v.literal("fil"));
const levels = ["normal", "mild", "moderate", "severe", "extremelySevere"];
export const status = query({
  args: {},
  handler: async (ctx) => {
    await requireResearcher(ctx);
    const state = await researchDataState(ctx);
    return state
      ? {
          status: state.status,
          deleted: state.deleted,
          requestedAt: state.requestedAt,
        }
      : null;
  },
});
export const reset = mutation({
  args: { confirmation: v.string() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (args.confirmation !== RESET_PHRASE)
      throw new ConvexError("Type RESET PILOT DATA to confirm.");
    const state = await researchDataState(ctx);
    if (state?.status === "resetting") {
      await ctx.scheduler.runAfter(0, internal.dataManagement.clearBatch, {});
      return;
    }
    const values = {
      status: "resetting" as const,
      stage: 0,
      deleted: 0,
      requestedAt: Date.now(),
      completedAt: undefined,
      actor: admin.userId,
    };
    if (state) await ctx.db.patch(state._id, values);
    else await ctx.db.insert("dataMaintenance", { key: "pilot", ...values });
    await ctx.db.insert("auditLog", {
      actor: admin.userId,
      action: "pilot.reset.started",
      target: "research-data",
      createdAt: Date.now(),
    });
    await ctx.scheduler.runAfter(0, internal.dataManagement.clearBatch, {});
  },
});
export const clearBatch = internalMutation({
  args: {},
  handler: async (ctx) => {
    const state = await researchDataState(ctx);
    if (state?.status !== "resetting") return;
    const table = tables[state.stage];
    if (!table) {
      await ctx.db.patch(state._id, {
        status: "complete",
        completedAt: Date.now(),
      });
      await ctx.db.insert("auditLog", {
        actor: state.actor,
        action: "pilot.reset.completed",
        target: "research-data",
        createdAt: Date.now(),
      });
      return;
    }
    const rows = await ctx.db.query(table).take(100);
    for (const row of rows) await ctx.db.delete(row._id);
    await ctx.db.patch(state._id, {
      deleted: state.deleted + rows.length,
      stage: rows.length < 100 ? state.stage + 1 : state.stage,
    });
    await ctx.scheduler.runAfter(0, internal.dataManagement.clearBatch, {});
  },
});
export const revisions = query({
  args: { recordId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db
      .query("recordRevisions")
      .withIndex("by_record", (q) => q.eq("recordId", args.recordId))
      .order("desc")
      .take(20);
  },
});
export const editScreening = mutation({
  args: {
    id: v.id("screenings"),
    expectedUpdatedAt: v.number(),
    answers: v.array(v.number()),
    locale,
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await assertDataWritable(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) throw new ConvexError("Record no longer exists.");
    if ((row.updatedAt ?? row._creationTime) !== args.expectedUpdatedAt)
      throw new ConvexError(
        "This record changed. Close and reopen the editor.",
      );
    const reason = validateCorrectionReason(args.reason);
    const scores = calculateResults(args.answers);
    const total = await ctx.db
      .query("statistics")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .unique();
    if (!total) throw new ConvexError("Research totals are unavailable.");
    const severities = { ...total.severities };
    for (const key of subscales) {
      severities[key] = [...severities[key]];
      severities[key][levels.indexOf(row[key].severity)]--;
      severities[key][levels.indexOf(scores[key].severity)]++;
    }
    await ctx.db.insert("recordRevisions", {
      recordId: args.id,
      kind: "screenings",
      before: JSON.stringify({ ...row, submissionKey: undefined }),
      reason,
      actor: admin.userId,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.id, {
      answers: args.answers,
      locale: args.locale,
      ...scores,
      updatedAt: Math.max(
        Date.now(),
        Math.floor(row.updatedAt ?? row._creationTime) + 1,
      ),
    });
    await ctx.db.patch(total._id, { severities });
    await ctx.db.insert("auditLog", {
      actor: admin.userId,
      action: "screening.corrected",
      target: args.id,
      createdAt: Date.now(),
    });
  },
});
export const editEvaluation = mutation({
  args: {
    id: v.id("evaluations"),
    expectedUpdatedAt: v.number(),
    locale,
    ease: v.number(),
    clarity: v.number(),
    overall: v.number(),
    comment: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    await assertDataWritable(ctx);
    const row = await ctx.db.get(args.id);
    if (!row) throw new ConvexError("Record no longer exists.");
    if ((row.updatedAt ?? row._creationTime) !== args.expectedUpdatedAt)
      throw new ConvexError(
        "This record changed. Close and reopen the editor.",
      );
    const reason = validateCorrectionReason(args.reason);
    const response = validateEvaluation(
      args.ease,
      args.clarity,
      args.overall,
      args.comment,
    );
    const total = await ctx.db
      .query("statistics")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .unique();
    if (!total) throw new ConvexError("Research totals are unavailable.");
    await ctx.db.insert("recordRevisions", {
      recordId: args.id,
      kind: "evaluations",
      before: JSON.stringify({ ...row, submissionKey: undefined }),
      reason,
      actor: admin.userId,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.id, {
      ...response,
      locale: args.locale,
      updatedAt: Math.max(
        Date.now(),
        Math.floor(row.updatedAt ?? row._creationTime) + 1,
      ),
    });
    await ctx.db.patch(total._id, {
      easeTotal: total.easeTotal + response.ease - row.ease,
      clarityTotal: total.clarityTotal + response.clarity - row.clarity,
      overallTotal: total.overallTotal + response.overall - row.overall,
    });
    await ctx.db.insert("auditLog", {
      actor: admin.userId,
      action: "evaluation.corrected",
      target: args.id,
      createdAt: Date.now(),
    });
  },
});
