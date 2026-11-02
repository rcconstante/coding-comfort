import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const score = v.object({
  raw: v.number(),
  score: v.number(),
  severity: v.union(
    v.literal("normal"),
    v.literal("mild"),
    v.literal("moderate"),
    v.literal("severe"),
    v.literal("extremelySevere"),
  ),
});
export default defineSchema({
  ...authTables,
  researchers: defineTable({
    firstName: v.optional(v.string()),
    userId: v.id("users"),
    account: v.string(),
    role: v.union(v.literal("admin"), v.literal("researcher")),
    active: v.boolean(),
    mustChangePassword: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_account", ["account"]),
  participants: defineTable({
    tokenHash: v.string(),
    consentVersion: v.string(),
    consentedAt: v.number(),
  }).index("by_token", ["tokenHash"]),
  screenings: defineTable({
    updatedAt: v.optional(v.number()),
    participantId: v.id("participants"),
    submissionKey: v.string(),
    locale: v.union(v.literal("en"), v.literal("fil")),
    answers: v.array(v.number()),
    depression: score,
    anxiety: score,
    stress: score,
    submittedAt: v.number(),
    consentVersion: v.string(),
    instrumentVersion: v.string(),
  })
    .index("by_submission", ["participantId", "submissionKey"])
    .index("by_submitted", ["submittedAt"]),
  evaluations: defineTable({
    updatedAt: v.optional(v.number()),
    participantId: v.id("participants"),
    submissionKey: v.string(),
    locale: v.union(v.literal("en"), v.literal("fil")),
    ease: v.number(),
    clarity: v.number(),
    overall: v.number(),
    comment: v.string(),
    submittedAt: v.number(),
    consentVersion: v.string(),
  })
    .index("by_submission", ["participantId", "submissionKey"])
    .index("by_submitted", ["submittedAt"]),
  statistics: defineTable({
    key: v.string(),
    participants: v.number(),
    screenings: v.number(),
    evaluations: v.number(),
    easeTotal: v.number(),
    clarityTotal: v.number(),
    overallTotal: v.number(),
    severities: v.object({
      depression: v.array(v.number()),
      anxiety: v.array(v.number()),
      stress: v.array(v.number()),
    }),
  }).index("by_key", ["key"]),
  requestWindows: defineTable({
    key: v.string(),
    startedAt: v.number(),
    count: v.number(),
  }).index("by_key", ["key"]),
  reflectionRequests: defineTable({
    sessionHash: v.string(),
    createdAt: v.number(),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("ready"),
        v.literal("error"),
        v.literal("expired"),
      ),
    ),
    envelope: v.optional(
      v.object({
        iv: v.string(),
        wrappedKey: v.string(),
        ciphertext: v.string(),
      }),
    ),
  }).index("by_session", ["sessionHash"]),
  instruments: defineTable({
    version: v.string(),
    questions: v.object({ en: v.array(v.string()), fil: v.array(v.string()) }),
    options: v.object({ en: v.array(v.string()), fil: v.array(v.string()) }),
    publishedAt: v.number(),
    publishedBy: v.optional(v.id("users")),
  }).index("by_version", ["version"]),
  instrumentState: defineTable({ key: v.string(), version: v.string() }).index(
    "by_key",
    ["key"],
  ),
  auditLog: defineTable({
    actor: v.id("users"),
    action: v.string(),
    target: v.string(),
    createdAt: v.number(),
  }),
  surveySettings: defineTable({ key: v.string(), url: v.string() }).index(
    "by_key",
    ["key"],
  ),
  recordRevisions: defineTable({
    recordId: v.string(),
    kind: v.union(v.literal("screenings"), v.literal("evaluations")),
    before: v.string(),
    reason: v.string(),
    actor: v.id("users"),
    createdAt: v.number(),
  }).index("by_record", ["recordId"]),
  dataMaintenance: defineTable({
    key: v.string(),
    status: v.union(v.literal("resetting"), v.literal("complete")),
    stage: v.number(),
    deleted: v.number(),
    requestedAt: v.number(),
    completedAt: v.optional(v.number()),
    actor: v.id("users"),
  }).index("by_key", ["key"]),
});
