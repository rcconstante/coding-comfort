import { v, ConvexError } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";
import { calculateResults, subscales } from "../app/lib/dass";
import {
  RESEARCH_CONSENT_VERSION,
  FEEDBACK_CONSENT_VERSION,
  validateEvaluation,
} from "../app/lib/research-validation";
import { requireResearcher } from "./permissions";

const locale = v.union(v.literal("en"), v.literal("fil"));
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
async function limitSubmission(ctx: MutationCtx, token: string) {
  if (!uuid.test(token)) throw new ConvexError("Invalid participant session.");
  const now = Date.now();
  for (const [key, maximum] of [
    ["research-submit", 60],
    [`research-${bytesToHex(sha256(utf8ToBytes(token)))}`, 6],
  ] as const) {
    const row = await ctx.db
      .query("requestWindows")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    if (!row)
      await ctx.db.insert("requestWindows", { key, startedAt: now, count: 1 });
    else if (now - row.startedAt >= 60000)
      await ctx.db.patch(row._id, { startedAt: now, count: 1 });
    else if (row.count >= maximum)
      throw new ConvexError(
        "Submission limit reached. Please try again in a minute.",
      );
    else await ctx.db.patch(row._id, { count: row.count + 1 });
  }
}
async function stats(ctx: MutationCtx) {
  const existing = await ctx.db
    .query("statistics")
    .withIndex("by_key", (q) => q.eq("key", "global"))
    .unique();
  if (existing) return existing;
  const id = await ctx.db.insert("statistics", {
    key: "global",
    participants: 0,
    screenings: 0,
    evaluations: 0,
    easeTotal: 0,
    clarityTotal: 0,
    overallTotal: 0,
    severities: {
      depression: [0, 0, 0, 0, 0],
      anxiety: [0, 0, 0, 0, 0],
      stress: [0, 0, 0, 0, 0],
    },
  });
  return (await ctx.db.get(id))!;
}
async function participant(ctx: MutationCtx, token: string, version: string) {
  if (!uuid.test(token)) throw new ConvexError("Invalid participant session.");
  const tokenHash = bytesToHex(sha256(utf8ToBytes(token)));
  const existing = await ctx.db
    .query("participants")
    .withIndex("by_token", (q) => q.eq("tokenHash", tokenHash))
    .unique();
  if (existing) return existing._id;
  const id = await ctx.db.insert("participants", {
    tokenHash,
    consentVersion: version,
    consentedAt: Date.now(),
  });
  const total = await stats(ctx);
  await ctx.db.patch(total._id, { participants: total.participants + 1 });
  return id;
}
export const submitScreening = mutation({
  args: {
    token: v.string(),
    submissionKey: v.string(),
    locale,
    answers: v.array(v.number()),
    consentVersion: v.string(),
    consent: v.boolean(),
    instrumentVersion: v.string(),
  },
  handler: async (ctx, args) => {
    if (
      !args.consent ||
      args.consentVersion !== RESEARCH_CONSENT_VERSION ||
      !uuid.test(args.submissionKey)
    )
      throw new ConvexError("Research consent is required.");
    const scores = calculateResults(args.answers);
    const instrument = await ctx.db
      .query("instruments")
      .withIndex("by_version", (q) => q.eq("version", args.instrumentVersion))
      .unique();
    if (!instrument)
      throw new ConvexError(
        "The questionnaire version is not available. Please restart the screening.",
      );
    await limitSubmission(ctx, args.token);
    const participantId = await participant(
      ctx,
      args.token,
      args.consentVersion,
    );
    const existing = await ctx.db
      .query("screenings")
      .withIndex("by_submission", (q) =>
        q
          .eq("participantId", participantId)
          .eq("submissionKey", args.submissionKey),
      )
      .unique();
    if (existing)
      return {
        id: existing._id,
        participantCode: `P-${participantId.slice(-8).toUpperCase()}`,
      };
    const id = await ctx.db.insert("screenings", {
      participantId,
      submissionKey: args.submissionKey,
      locale: args.locale,
      answers: args.answers,
      ...scores,
      submittedAt: Date.now(),
      consentVersion: args.consentVersion,
      instrumentVersion: args.instrumentVersion,
    });
    const total = await stats(ctx);
    const severities = { ...total.severities };
    const levels = ["normal", "mild", "moderate", "severe", "extremelySevere"];
    for (const key of subscales) {
      const counts = [...severities[key]];
      counts[levels.indexOf(scores[key].severity)]++;
      severities[key] = counts;
    }
    await ctx.db.patch(total._id, {
      screenings: total.screenings + 1,
      severities,
    });
    return {
      id,
      participantCode: `P-${participantId.slice(-8).toUpperCase()}`,
    };
  },
});
export const submitEvaluation = mutation({
  args: {
    token: v.string(),
    submissionKey: v.string(),
    locale,
    consent: v.boolean(),
    consentVersion: v.string(),
    ease: v.number(),
    clarity: v.number(),
    overall: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    if (
      !args.consent ||
      args.consentVersion !== FEEDBACK_CONSENT_VERSION ||
      !uuid.test(args.submissionKey)
    )
      throw new ConvexError("Feedback consent is required.");
    const response = validateEvaluation(
      args.ease,
      args.clarity,
      args.overall,
      args.comment,
    );
    await limitSubmission(ctx, args.token);
    const participantId = await participant(
      ctx,
      args.token,
      args.consentVersion,
    );
    const existing = await ctx.db
      .query("evaluations")
      .withIndex("by_submission", (q) =>
        q
          .eq("participantId", participantId)
          .eq("submissionKey", args.submissionKey),
      )
      .unique();
    if (existing) return existing._id;
    const id = await ctx.db.insert("evaluations", {
      participantId,
      submissionKey: args.submissionKey,
      locale: args.locale,
      ...response,
      submittedAt: Date.now(),
      consentVersion: args.consentVersion,
    });
    const total = await stats(ctx);
    await ctx.db.patch(total._id, {
      evaluations: total.evaluations + 1,
      easeTotal: total.easeTotal + response.ease,
      clarityTotal: total.clarityTotal + response.clarity,
      overallTotal: total.overallTotal + response.overall,
    });
    return id;
  },
});
export const summary = query({
  args: {},
  handler: async (ctx) => {
    await requireResearcher(ctx);
    const total = await ctx.db
      .query("statistics")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .unique();
    return total
      ? {
          participants: total.participants,
          screenings: total.screenings,
          evaluations: total.evaluations,
          severities: total.severities,
          averages: total.evaluations
            ? {
                ease: total.easeTotal / total.evaluations,
                clarity: total.clarityTotal / total.evaluations,
                overall: total.overallTotal / total.evaluations,
              }
            : null,
        }
      : {
          participants: 0,
          screenings: 0,
          evaluations: 0,
          severities: {
            depression: [0, 0, 0, 0, 0],
            anxiety: [0, 0, 0, 0, 0],
            stress: [0, 0, 0, 0, 0],
          },
          averages: null,
        };
  },
});
export const listScreenings = query({
  args: {
    paginationOpts: paginationOptsValidator,
    from: v.optional(v.number()),
    to: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireResearcher(ctx);
    const from = args.from ?? 0,
      to = args.to ?? Number.MAX_SAFE_INTEGER;
    if (
      !Number.isFinite(from) ||
      !Number.isFinite(to) ||
      from > to ||
      args.paginationOpts.numItems > 200
    )
      throw new ConvexError("Invalid filter.");
    const page = await ctx.db
      .query("screenings")
      .withIndex("by_submitted", (q) =>
        q.gte("submittedAt", from).lte("submittedAt", to),
      )
      .order("desc")
      .paginate(args.paginationOpts);
    return {
      ...page,
      page: page.page.map(({ submissionKey, ...row }) => {
        void submissionKey;
        return {
          ...row,
          participantCode: `P-${row.participantId.slice(-8).toUpperCase()}`,
        };
      }),
    };
  },
});
export const listEvaluations = query({
  args: {
    paginationOpts: paginationOptsValidator,
    from: v.optional(v.number()),
    to: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireResearcher(ctx);
    const from = args.from ?? 0,
      to = args.to ?? Number.MAX_SAFE_INTEGER;
    if (
      !Number.isFinite(from) ||
      !Number.isFinite(to) ||
      from > to ||
      args.paginationOpts.numItems > 200
    )
      throw new ConvexError("Invalid filter.");
    const page = await ctx.db
      .query("evaluations")
      .withIndex("by_submitted", (q) =>
        q.gte("submittedAt", from).lte("submittedAt", to),
      )
      .order("desc")
      .paginate(args.paginationOpts);
    return {
      ...page,
      page: page.page.map(({ submissionKey, ...row }) => {
        void submissionKey;
        return {
          ...row,
          participantCode: `P-${row.participantId.slice(-8).toUpperCase()}`,
        };
      }),
    };
  },
});

export const screeningDetail = query({
  args: { id: v.id("screenings") },
  handler: async (ctx, { id }) => {
    await requireResearcher(ctx);
    const record = await ctx.db.get(id);
    if (!record) return null;
    const instrument = await ctx.db
      .query("instruments")
      .withIndex("by_version", (q) => q.eq("version", record.instrumentVersion))
      .unique();
    return {
      answers: record.answers,
      questions: instrument?.questions ?? null,
      locale: record.locale,
      version: record.instrumentVersion,
    };
  },
});
export const exportInstruments = query({
  args: { versions: v.array(v.string()) },
  handler: async (ctx, { versions }) => {
    await requireResearcher(ctx);
    if (versions.length > 100)
      throw new ConvexError("Use a narrower date range.");
    return await Promise.all(
      versions.map((version) =>
        ctx.db
          .query("instruments")
          .withIndex("by_version", (q) => q.eq("version", version))
          .unique(),
      ),
    );
  },
});
