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
    const trip = await ctx.db.get(args.tripId);
    if (!trip) return null;

    if (trip.isPublic) {
      return trip;
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== trip.userId) {
      return null;
    }

    return trip;
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

export const updateTrip = mutation({
  args: {
    tripId: v.id("trips"),
    tripName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    budget: v.optional(v.string()),
    travelers: v.optional(v.string()),
    duration: v.optional(v.number()),
    destination: v.optional(v.string()),
    startDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { tripId, ...updates } = args;
    await ctx.db.patch(tripId, updates);
  },
});

export const updateTripData = mutation({
  args: {
    tripId: v.id("trips"),
    tripData: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.tripId, {
      tripData: args.tripData,
    });
  },
});

export const toggleTripFavorite = mutation({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");
    
    await ctx.db.patch(args.tripId, {
      isFavorite: !trip.isFavorite,
    });
    return !trip.isFavorite;
  },
});

export const setTripPublicStatus = mutation({
  args: {
    tripId: v.id("trips"),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const trip = await ctx.db.get(args.tripId);
    if (!trip || trip.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.tripId, {
      isPublic: args.isPublic,
    });
  },
});

export const likeTrip = mutation({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");
    
    const currentLikes = trip.likes || 0;
    await ctx.db.patch(args.tripId, {
      likes: currentLikes + 1,
    });
    return currentLikes + 1;
  },
});

export const cloneTrip = mutation({
  args: {
    tripId: v.id("trips"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("Trip not found");
    
    const newTripId = await ctx.db.insert("trips", {
      userId: args.userId,
      destination: trip.destination,
      tripData: trip.tripData,
      duration: trip.duration,
      budget: trip.budget,
      travelers: trip.travelers,
      tripName: trip.tripName ? `${trip.tripName} (Copy)` : undefined,
      imageUrl: trip.imageUrl,
      isFavorite: false,
      isPublic: false,
      likes: 0,
    });
    
    return newTripId;
  },
});

export const getFavoriteTrips = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const trips = await ctx.db
      .query("trips")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
      
    return trips.filter((trip) => trip.isFavorite);
  },
});

export const getPublicTrips = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const trips = await ctx.db
      .query("trips")
      .withIndex("by_isPublic_likes", (q) => q.eq("isPublic", true))
      .order("desc")
      .take(args.limit || 50);
      
    return trips;
  },
});
