import { query, mutation, internalMutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { questions, responseOptions } from "../app/lib/dass";
import { requireAdmin } from "./permissions";

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const state = await ctx.db
      .query("instrumentState")
      .withIndex("by_key", (q) => q.eq("key", "active"))
      .unique();
    if (state) return;
    const version = "dass21-pdf-v1";
    await ctx.db.insert("instruments", {
      version,
      questions: { en: [...questions.en], fil: [...questions.fil] },
      options: { en: [...responseOptions.en], fil: [...responseOptions.fil] },
      publishedAt: Date.now(),
    });
    await ctx.db.insert("instrumentState", { key: "active", version });
  },
});
export const current = query({
  args: {},
  handler: async (ctx) => {
    const state = await ctx.db
      .query("instrumentState")
      .withIndex("by_key", (q) => q.eq("key", "active"))
      .unique();
    if (!state) return null;
    const instrument = await ctx.db
      .query("instruments")
      .withIndex("by_version", (q) => q.eq("version", state.version))
      .unique();
    return instrument
      ? {
          version: instrument.version,
          questions: instrument.questions,
          options: instrument.options,
        }
      : null;
  },
});
export const history = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return (await ctx.db.query("instruments").order("desc").take(50)).map(
      ({ version, publishedAt }) => ({ version, publishedAt }),
    );
  },
});
export const publish = mutation({
  args: {
    questions: v.object({ en: v.array(v.string()), fil: v.array(v.string()) }),
    options: v.object({ en: v.array(v.string()), fil: v.array(v.string()) }),
    approved: v.boolean(),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    if (!args.approved)
      throw new ConvexError("Research-team wording approval is required.");
    for (const locale of ["en", "fil"] as const) {
      if (
        args.questions[locale].length !== 21 ||
        args.options[locale].length !== 4 ||
        [...args.questions[locale], ...args.options[locale]].some(
          (s) => !s.trim() || s.length > 1000,
        )
      )
        throw new ConvexError(
          "Keep all 21 questions and four response options in both languages.",
        );
    }
    const version = `dass21-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    await ctx.db.insert("instruments", {
      version,
      questions: args.questions,
      options: args.options,
      publishedAt: Date.now(),
      publishedBy: admin.userId,
    });
    const state = await ctx.db
      .query("instrumentState")
      .withIndex("by_key", (q) => q.eq("key", "active"))
      .unique();
    if (state) await ctx.db.patch(state._id, { version });
    else await ctx.db.insert("instrumentState", { key: "active", version });
    await ctx.db.insert("auditLog", {
      actor: admin.userId,
      action: "instrument.publish",
      target: version,
      createdAt: Date.now(),
    });
    return version;
  },
});
