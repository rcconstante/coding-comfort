import { v, ConvexError } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";
import { severityFor, subscales } from "../app/lib/dass";
import { AI_CONSENT_VERSION } from "../app/lib/reflection";
const scoresValidator = v.object({
  depression: v.number(),
  anxiety: v.number(),
  stress: v.number(),
});
const hash = (key: string) => bytesToHex(sha256(utf8ToBytes(key)));
const validKey = (key: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    key,
  );
export const request = mutation({
  args: {
    submissionKey: v.string(),
    scores: scoresValidator,
    publicKey: v.string(),
    consent: v.boolean(),
    consentVersion: v.string(),
    gateSecret: v.string(),
    clientHash: v.string(),
  },
  handler: async (ctx, args) => {
    if (
      !process.env.REFLECTION_GATE_SECRET ||
      args.gateSecret !== process.env.REFLECTION_GATE_SECRET ||
      !/^[a-f0-9]{64}$/.test(args.clientHash)
    )
      throw new ConvexError("REQUEST_NOT_ALLOWED");
    if (!args.consent || args.consentVersion !== AI_CONSENT_VERSION)
      throw new ConvexError("REFLECTION_CONSENT_REQUIRED");
    if (!validKey(args.submissionKey))
      throw new ConvexError("INVALID_REFLECTION_SESSION");
    for (const scale of subscales) {
      severityFor(scale, args.scores[scale]);
      if (args.scores[scale] % 2 !== 0)
        throw new ConvexError("INVALID_REFLECTION_SCORE");
    }
    if (args.publicKey.length > 1500)
      throw new ConvexError("INVALID_RECOVERY_KEY");
    let key: JsonWebKey;
    try {
      key = JSON.parse(args.publicKey);
    } catch {
      throw new ConvexError("INVALID_RECOVERY_KEY");
    }
    if (
      args.publicKey.length > 1500 ||
      !key ||
      typeof key !== "object" ||
      key.kty !== "RSA" ||
      key.e !== "AQAB" ||
      typeof key.n !== "string" ||
      key.n.length !== 342 ||
      "d" in key
    )
      throw new ConvexError("INVALID_RECOVERY_KEY");
    const sessionHash = hash(args.submissionKey);
    if (
      await ctx.db
        .query("reflectionRequests")
        .withIndex("by_session", (q) => q.eq("sessionHash", sessionHash))
        .unique()
    )
      return;
    const now = Date.now();
    for (const [key, duration, maximum] of [
      ["gemini-minute", 60000, 20],
      ["gemini-day", 86400000, 500],
      [`gemini-client-${args.clientHash}`, 3600000, 10],
    ] as const) {
      const row = await ctx.db
        .query("requestWindows")
        .withIndex("by_key", (q) => q.eq("key", key))
        .unique();
      if (!row)
        await ctx.db.insert("requestWindows", {
          key,
          startedAt: now,
          count: 1,
        });
      else if (now - row.startedAt >= duration)
        await ctx.db.patch(row._id, { startedAt: now, count: 1 });
      else if (row.count >= maximum) throw new ConvexError("REFLECTION_LIMIT");
      else await ctx.db.patch(row._id, { count: row.count + 1 });
    }
    const id = await ctx.db.insert("reflectionRequests", {
      sessionHash,
      createdAt: now,
      status: "pending",
    });
    await ctx.scheduler.runAfter(0, internal.reflection_worker.perform, {
      id,
      scores: args.scores,
      publicKey: args.publicKey,
    });
    await ctx.scheduler.runAfter(86400000, internal.reflection.expire, { id });
    await ctx.scheduler.runAfter(90000, internal.reflection.finish, { id });
  },
});
export const result = query({
  args: { submissionKey: v.string() },
  handler: async (ctx, { submissionKey }) => {
    if (!validKey(submissionKey)) return null;
    const row = await ctx.db
      .query("reflectionRequests")
      .withIndex("by_session", (q) => q.eq("sessionHash", hash(submissionKey)))
      .unique();
    if (!row) return null;
    return { status: row.status ?? "expired", envelope: row.envelope ?? null };
  },
});
export const finish = internalMutation({
  args: {
    id: v.id("reflectionRequests"),
    envelope: v.optional(
      v.object({
        iv: v.string(),
        wrappedKey: v.string(),
        ciphertext: v.string(),
      }),
    ),
  },
  handler: async (ctx, { id, envelope }) => {
    const row = await ctx.db.get(id);
    if (row?.status === "pending")
      await ctx.db.patch(id, {
        status: envelope ? "ready" : "error",
        ...(envelope ? { envelope } : {}),
      });
  },
});
export const expire = internalMutation({
  args: { id: v.id("reflectionRequests") },
  handler: async (ctx, { id }) => {
    if (await ctx.db.get(id))
      await ctx.db.patch(id, { status: "expired", envelope: undefined });
  },
});
