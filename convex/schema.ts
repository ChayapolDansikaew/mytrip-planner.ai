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
  })
    .index("by_userId", ["userId"])
    .index("by_isPublic_likes", ["isPublic", "likes"]),
});
