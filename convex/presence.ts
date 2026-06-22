import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updatePresence = mutation({
  args: {
    tripId: v.id("trips"),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("ไม่มีสิทธิ์ในการดำเนินการนี้");

    const userId = identity.subject;

    // ตรวจสอบการมีอยู่ของทริปและสิทธิ์การเข้าถึง
    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("ไม่พบทริปดังกล่าว");

    if (!trip.isPublic && trip.userId !== userId) {
      const isCollaborator = await ctx.db
        .query("collaborators")
        .withIndex("by_tripId_userId", (q) => q.eq("tripId", args.tripId).eq("userId", userId))
        .unique();
      if (!isCollaborator) {
        throw new Error("ไม่มีสิทธิ์ในการดำเนินการนี้");
      }
    }

    const now = Date.now();

    // อัปเดต หรือ แทรกรายการใหม่ของผู้ใช้บนทริปนี้
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_tripId_userId", (q) => q.eq("tripId", args.tripId).eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        imageUrl: args.imageUrl,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("presence", {
        tripId: args.tripId,
        userId,
        name: args.name,
        imageUrl: args.imageUrl,
        updatedAt: now,
      });
    }

    // ทำความสะอาดเรคคอร์ดเก่า (ที่เก่าเกิน 30 วินาที) ของทริปนี้แบบสุ่ม (20% โอกาส) เพื่อลดโอกาสเกิด OCC retries
    if (Math.random() < 0.2) {
      const oldThreshold = now - 30000;
      const oldRecords = await ctx.db
        .query("presence")
        .withIndex("by_tripId_userId", (q) => q.eq("tripId", args.tripId))
        .collect();

      for (const rec of oldRecords) {
        if (rec.updatedAt < oldThreshold) {
          await ctx.db.delete(rec._id);
        }
      }
    }
  },
});

export const getPresence = query({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    // ตรวจสอบการมีอยู่ของทริปและสิทธิ์การเข้าถึง
    const trip = await ctx.db.get(args.tripId);
    if (!trip) throw new Error("ไม่พบทริปดังกล่าว");

    if (!trip.isPublic) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("ไม่มีสิทธิ์ในการดำเนินการนี้");

      const userId = identity.subject;
      if (trip.userId !== userId) {
        const isCollaborator = await ctx.db
          .query("collaborators")
          .withIndex("by_tripId_userId", (q) => q.eq("tripId", args.tripId).eq("userId", userId))
          .unique();
        if (!isCollaborator) {
          throw new Error("ไม่มีสิทธิ์ในการดำเนินการนี้");
        }
      }
    }

    const now = Date.now();
    const activeThreshold = now - 10000; // ออนไลน์ใน 10 วินาทีล่าสุด

    const records = await ctx.db
      .query("presence")
      .withIndex("by_tripId_userId", (q) => q.eq("tripId", args.tripId))
      .collect();

    return records.filter((rec) => rec.updatedAt >= activeThreshold);
  },
});
