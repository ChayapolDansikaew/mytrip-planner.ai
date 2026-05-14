import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createTrip = mutation({
  args: {
    userId: v.string(),
    destination: v.string(),
    tripData: v.any(),
    duration: v.optional(v.number()),
    budget: v.optional(v.string()),
    travelers: v.optional(v.string()),
    tripName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tripId = await ctx.db.insert("trips", {
      userId: args.userId,
      destination: args.destination,
      tripData: args.tripData,
      duration: args.duration,
      budget: args.budget,
      travelers: args.travelers,
      tripName: args.tripName,
      imageUrl: args.imageUrl,
    });

    return tripId;
  },
});

export const getUserTrips = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trips")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getTripById = query({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tripId);
  },
});

export const getTodayTripCount = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const trips = await ctx.db
      .query("trips")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("_creationTime"), startOfDay.getTime()))
      .collect();

    return trips.length;
  },
});

export const deleteTrip = mutation({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.tripId);
  },
});
