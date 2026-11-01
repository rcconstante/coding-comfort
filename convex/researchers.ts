import {
  action,
  mutation,
  query,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import {
  getAuthUserId,
  getAuthSessionId,
  createAccount,
  retrieveAccount,
  modifyAccountCredentials,
  invalidateSessions,
} from "@convex-dev/auth/server";
import { v, ConvexError } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { requireAdmin } from "./permissions";
import {
  validateAccount,
  validateNewPassword,
} from "../app/lib/research-validation";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db
      .query("researchers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return user?.active
      ? {
          account: user.account,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        }
      : null;
  },
});
export const list = query({
  args: {paginationOpts:paginationOptsValidator},
  handler: async (ctx,args) => {
    await requireAdmin(ctx);
    if(args.paginationOpts.numItems>100)throw new ConvexError("Use a smaller page size.");
    return await ctx.db.query("researchers").order("desc").paginate(args.paginationOpts);
  },
});
export const authorizeAdmin = internalQuery({
  args: {},
  handler: async (ctx) => await requireAdmin(ctx),
});
export const authorizeSelf = internalQuery({
  args: {},
  handler: async (ctx) => {
    const id = await getAuthUserId(ctx);
    if (!id) throw new ConvexError("UNAUTHORIZED");
    const user = await ctx.db
      .query("researchers")
      .withIndex("by_user", (q) => q.eq("userId", id))
      .unique();
    if (!user?.active) throw new ConvexError("FORBIDDEN");
    return user;
  },
});
export const addAccess = internalMutation({
  args: {
    userId: v.id("users"),
    account: v.string(),
    role: v.union(v.literal("admin"), v.literal("researcher")),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdmin(ctx);
    const existing = await ctx.db
      .query("researchers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    if (existing)
      throw new ConvexError("That account already has researcher access.");
    await ctx.db.insert("researchers", {
      ...args,
      active: true,
      mustChangePassword: true,
    });
    await ctx.db.insert("auditLog", {
      actor: actor.userId,
      action: "user.create",
      target: args.account,
      createdAt: Date.now(),
    });
  },
});
export const create = action({
  args: {
    account: v.string(),
    password: v.string(),
    role: v.union(v.literal("admin"), v.literal("researcher")),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.runQuery(internal.researchers.authorizeAdmin, {});
    const account = validateAccount(args.account);
    validateNewPassword(args.password, account);
    const { user } = await createAccount(ctx, {
      provider: "password",
      account: { id: account, secret: args.password },
      profile: { email: account },
      shouldLinkViaEmail: false,
      shouldLinkViaPhone: false,
    });
    await ctx.runMutation(internal.researchers.addAccess, {
      userId: user._id,
      account,
      role: args.role,
    });
  },
});
export const finishPasswordChange = internalMutation({
  args: {},
  handler: async (ctx) => {
    const id = await getAuthUserId(ctx);
    if (!id) throw new ConvexError("UNAUTHORIZED");
    const user = await ctx.db
      .query("researchers")
      .withIndex("by_user", (q) => q.eq("userId", id))
      .unique();
    if (!user?.active) throw new ConvexError("FORBIDDEN");
    await ctx.db.patch(user._id, { mustChangePassword: false });
    await ctx.db.insert("auditLog", {
      actor: id,
      action: "password.change",
      target: user.account,
      createdAt: Date.now(),
    });
  },
});
export const changePassword = action({
  args: { currentPassword: v.string(), newPassword: v.string() },
  handler: async (ctx, args): Promise<void> => {
    const user = await ctx.runQuery(internal.researchers.authorizeSelf, {});
    validateNewPassword(args.newPassword, user.account);
    if (args.newPassword === args.currentPassword)
      throw new ConvexError("Choose a different password.");
    await retrieveAccount(ctx, {
      provider: "password",
      account: { id: user.account, secret: args.currentPassword },
    });
    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: user.account, secret: args.newPassword },
    });
    const sessionId = await getAuthSessionId(ctx);
    await invalidateSessions(ctx, {
      userId: user.userId,
      except: sessionId ? [sessionId] : [],
    });
    await ctx.runMutation(internal.researchers.finishPasswordChange, {});
  },
});
export const updateAccess = mutation({
  args: {
    id: v.id("researchers"),
    active: v.boolean(),
    role: v.union(v.literal("admin"), v.literal("researcher")),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdmin(ctx);
    const user = await ctx.db.get(args.id);
    if (!user) throw new ConvexError("Account not found.");
    if (user.userId === actor.userId)
      throw new ConvexError("You cannot change your own administrator access.");
    await ctx.db.patch(args.id, { active: args.active, role: args.role });
    await ctx.db.insert("auditLog", {
      actor: actor.userId,
      action: "user.access",
      target: user.account,
      createdAt: Date.now(),
    });
  },
});
