import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export async function researchDataState(ctx: MutationCtx | QueryCtx) {
  return ctx.db
    .query("dataMaintenance")
    .withIndex("by_key", (q) => q.eq("key", "pilot"))
    .unique();
}
export async function assertDataWritable(ctx: MutationCtx) {
  if ((await researchDataState(ctx))?.status === "resetting")
    throw new ConvexError(
      "Pilot data is being reset. Please try again after it finishes.",
    );
}
