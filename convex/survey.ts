import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./permissions";
import { validateSurveyUrl } from "../app/lib/survey";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query("surveySettings")
      .withIndex("by_key", (q) => q.eq("key", "external"))
      .unique();
    return row?.url || null;
  },
});

export const save = mutation({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    let url: string;
    try {
      url = validateSurveyUrl(args.url);
    } catch {
      throw new ConvexError(
        "Use a public Google Forms response link (forms.gle or docs.google.com/forms). Remove extra URL parameters. Leave blank to hide the survey.",
      );
    }
    const row = await ctx.db
      .query("surveySettings")
      .withIndex("by_key", (q) => q.eq("key", "external"))
      .unique();
    if (row) await ctx.db.patch(row._id, { url });
    else await ctx.db.insert("surveySettings", { key: "external", url });
    await ctx.db.insert("auditLog", {
      actor: admin.userId,
      action: "survey.update",
      target: "external-survey",
      createdAt: Date.now(),
    });
  },
});
