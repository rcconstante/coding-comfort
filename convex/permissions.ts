import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";

export async function requireResearcher(ctx: QueryCtx | MutationCtx) {
  const id = await getAuthUserId(ctx);
  if (!id) throw new ConvexError("UNAUTHORIZED");
  const researcher = await ctx.db
    .query("researchers")
    .withIndex("by_user", (q) => q.eq("userId", id))
    .unique();
  if (!researcher || !researcher.active) throw new ConvexError("FORBIDDEN");
  if (researcher.mustChangePassword)
    throw new ConvexError("PASSWORD_CHANGE_REQUIRED");
  return researcher;
}
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await requireResearcher(ctx);
  if (user.role !== "admin") throw new ConvexError("FORBIDDEN");
  return user;
}
