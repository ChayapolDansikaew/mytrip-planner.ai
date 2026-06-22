import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

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
    // 1. ดึงทริปที่เป็นเจ้าของ
    const ownTrips = await ctx.db
      .query("trips")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // 2. ดึงรายการ collaborators ของผู้ใช้นี้
    const collabRecords = await ctx.db
      .query("collaborators")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const collabTrips: Doc<"trips">[] = [];
    for (const rec of collabRecords) {
      const trip = await ctx.db.get(rec.tripId);
      if (trip) {
        collabTrips.push(trip);
      }
    }

    // รวมสองลิสต์
    const allTrips = [...ownTrips, ...collabTrips];
    // กำจัดค่าซ้ำ (ถ้ามี)
    const uniqueTrips = allTrips.filter(
      (trip, index, self) => self.findIndex((t) => t._id === trip._id) === index
    );
    
    return uniqueTrips;
  },
});

export const getTripById = query({
  args: {
    tripId: v.id("trips"),
    editKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) return null;

    if (trip.isPublic) {
      return trip;
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // หากผู้ใช้ยังไม่ล็อกอิน แต่ส่ง editKey มาตรงกัน ยินยอมให้อ่านได้ชั่วคราวเพื่อให้ดึงข้อมูลหน้าล็อกอินได้
      if (args.editKey && trip.editToken && args.editKey === trip.editToken) {
        return trip;
      }
      return null;
    }

    // 1. ตรวจสอบความเป็นเจ้าของ
    if (identity.subject === trip.userId) {
      return trip;
    }

    // 2. ตรวจสอบว่าส่ง editKey มาตรงกับของทริปหรือไม่
    if (args.editKey && trip.editToken && args.editKey === trip.editToken) {
      return trip;
    }

    // 3. ตรวจสอบว่าบันทึกเป็นผู้ร่วมทริปหรือไม่
    const isCollab = await ctx.db
      .query("collaborators")
      .withIndex("by_tripId_userId", (q) => q.eq("tripId", args.tripId).eq("userId", identity.subject))
      .unique();

    if (isCollab) {
      return trip;
    }

    return null;
  },
});

export const generateTripEditToken = mutation({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("ไม่มีสิทธิ์ในการดำเนินการนี้");

    const trip = await ctx.db.get(args.tripId);
    if (!trip || trip.userId !== identity.subject) {
      throw new Error("ไม่มีสิทธิ์ในการดำเนินการนี้");
    }

    if (trip.editToken) {
      return trip.editToken;
    }

    const randomToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await ctx.db.patch(args.tripId, {
      editToken: randomToken,
    });
    return randomToken;
  },
});

export const joinCollaborator = mutation({
  args: {
    tripId: v.id("trips"),
    editKey: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("ไม่มีสิทธิ์ในการดำเนินการนี้");

    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("ไม่พบทริปดังกล่าว");

    if (!trip.editToken || trip.editToken !== args.editKey) {
      throw new Error("คีย์เชิญชวนไม่ถูกต้อง");
    }

    // เช็คว่าเคยแอดไปแล้วหรือยัง
    const existing = await ctx.db
      .query("collaborators")
      .withIndex("by_tripId_userId", (q) => q.eq("tripId", args.tripId).eq("userId", identity.subject))
      .unique();

    if (!existing) {
      await ctx.db.insert("collaborators", {
        tripId: args.tripId,
        userId: identity.subject,
        createdAt: Date.now(),
      });
    }
    return true;
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("ไม่มีสิทธิ์ในการดำเนินการนี้");

    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("ไม่พบทริปดังกล่าว");

    if (trip.userId !== identity.subject) {
      throw new Error("เฉพาะเจ้าของทริปเท่านั้นที่สามารถลบได้");
    }

    await ctx.db.delete(args.tripId);
  },
});

// Helper สำหรับเช็คสิทธิ์แก้
async function checkEditPermission(ctx: MutationCtx, tripId: Id<"trips">) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("ไม่มีสิทธิ์ในการดำเนินการนี้");
  
  const trip = await ctx.db.get(tripId);
  if (!trip) throw new Error("ไม่พบทริปดังกล่าว");
  
  if (trip.userId === identity.subject) return true;
  
  const collab = await ctx.db
    .query("collaborators")
    .withIndex("by_tripId_userId", (q) => q.eq("tripId", tripId).eq("userId", identity.subject))
    .unique();
    
  if (!collab) throw new Error("ไม่มีสิทธิ์ในการดำเนินการนี้");
  return true;
}

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
    await checkEditPermission(ctx, args.tripId);
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
    await checkEditPermission(ctx, args.tripId);
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
