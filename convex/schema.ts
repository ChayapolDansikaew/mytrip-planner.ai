import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    clerkId: v.string(),
    isPremium: v.optional(v.boolean()),
  }).index("by_clerkId", ["clerkId"]),

  trips: defineTable({
    userId: v.string(),
    destination: v.string(),
    tripData: v.any(),
    duration: v.optional(v.number()),
    budget: v.optional(v.string()),
    travelers: v.optional(v.string()),
    tripName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isFavorite: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
    startDate: v.optional(v.string()),
    likes: v.optional(v.number()),
    editToken: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_isPublic_likes", ["isPublic", "likes"]),

  collaborators: defineTable({
    tripId: v.id("trips"),
    userId: v.string(),
    createdAt: v.number(),
  })
    .index("by_tripId_userId", ["tripId", "userId"])
    .index("by_userId", ["userId"]),

  presence: defineTable({
    tripId: v.id("trips"),
    userId: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_tripId", ["tripId"])
    .index("by_tripId_userId", ["tripId", "userId"]),
});
