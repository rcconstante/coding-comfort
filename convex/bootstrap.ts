import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  createAccount,
  modifyAccountCredentials,
  invalidateSessions,
} from "@convex-dev/auth/server";
import { v } from "convex/values";

export const grant = internalMutation({
  args: { userId: v.id("users"), account: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("researchers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    if (!existing)
      await ctx.db.insert("researchers", {
        ...args,
        role: "admin",
        active: true,
        mustChangePassword: true,
      });
  },
});
export const forcePasswordChange = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db
      .query("researchers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!user) throw new Error("Researcher access not found.");
    await ctx.db.patch(user._id, { mustChangePassword: true });
  },
});
export const provision = internalAction({
  args: {},
  handler: async (ctx): Promise<{ account: string }> => {
    const account = process.env.RESEARCHER_SETUP_ACCOUNT?.trim().toLowerCase();
    const password = process.env.RESEARCHER_SETUP_PASSWORD;
    if (!account || !password || password.length < 16)
      throw new Error(
        "Configure the one-time researcher setup credentials first.",
      );
    const { user } = await createAccount(ctx, {
      provider: "password",
      account: { id: account, secret: password },
      profile: { email: account },
      shouldLinkViaEmail: false,
      shouldLinkViaPhone: false,
    });
    await ctx.runMutation(internal.bootstrap.grant, {
      userId: user._id,
      account,
    });
    await ctx.runMutation(internal.instruments.seed, {});
    return { account };
  },
});
export const resetPassword = internalAction({
  args: {},
  handler: async (ctx): Promise<void> => {
    const account = process.env.RESEARCHER_SETUP_ACCOUNT?.trim().toLowerCase();
    const password = process.env.RESEARCHER_SETUP_PASSWORD;
    if (!account || !password || password.length < 16)
      throw new Error(
        "Configure the one-time researcher setup credentials first.",
      );
    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: account, secret: password },
    });
    const { retrieveAccount } = await import("@convex-dev/auth/server");
    const { user } = await retrieveAccount(ctx, {
      provider: "password",
      account: { id: account },
    });
    await ctx.runMutation(internal.bootstrap.forcePasswordChange, {
      userId: user._id,
    });
    await invalidateSessions(ctx, { userId: user._id });
  },
});
