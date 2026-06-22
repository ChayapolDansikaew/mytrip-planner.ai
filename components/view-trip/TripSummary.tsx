"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { Pencil, X, Check } from "lucide-react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { cardReveal, liftHover, springSnappy, staggerFast } from "@/lib/motion";
import type { TripData } from "@/types/trip";

interface TripSummaryProps {
  tripData: TripData;
  tripId: string;
  isEditable: boolean;
}

function formatValue(value?: string | number | null, fallback = "-") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  return String(value);
}

const cardPop: Variants = cardReveal;

export default function TripSummary({ tripData, tripId, isEditable }: TripSummaryProps) {
  const shouldReduceMotion = useReducedMotion();
  const updateTripData = useMutation(api.trips.updateTripData);
  const updateTrip = useMutation(api.trips.updateTrip);

  const [isEditing, setIsEditing] = useState(false);
  const [editedBudget, setEditedBudget] = useState(tripData.budget || "");
  const [editedTravelers, setEditedTravelers] = useState(tripData.travelers || "");
  const [editedDuration, setEditedDuration] = useState(tripData.duration || 1);
  const [editedBestTime, setEditedBestTime] = useState(tripData.bestTimeToVisit || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedTripData = {
        ...tripData,
        budget: editedBudget,
        travelers: editedTravelers,
        duration: Number(editedDuration),
        bestTimeToVisit: editedBestTime,
      };

      // อัปเดตทั้งใน tripData และฟิลด์หลักระดับบน
      await Promise.all([
        updateTripData({
          tripId: tripId as Id<"trips">,
          tripData: updatedTripData,
        }),
        updateTrip({
          tripId: tripId as Id<"trips">,
          budget: editedBudget,
          travelers: editedTravelers,
          duration: Number(editedDuration),
        }),
      ]);

      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save trip summary updates:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const summaryItems = [
    {
      icon: "📍",
      label: "ปลายทาง",
      value: formatValue(tripData.destination),
    },
    {
      icon: "📅",
      label: "ระยะเวลา",
      value: tripData.duration ? `${tripData.duration} วัน` : "-",
    },
    {
      icon: "💰",
      label: "งบประมาณ",
      value: formatValue(tripData.budget),
    },
    {
      icon: "👥",
      label: "ผู้เดินทาง",
      value: formatValue(tripData.travelers),
    },
    {
      icon: "🌤️",
      label: "ช่วงเวลาดีที่สุด",
      value: formatValue(tripData.bestTimeToVisit || tripData.bestTimeToVisit),
    },
  ];

  return (
    <section className="relative">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-semibold tracking-normal text-gray-900 dark:text-[#e3fafc]">📊 สรุปทริป</h2>
        {isEditable && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsEditing(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-600 transition-colors hover:bg-pink-200 dark:bg-pink-950/40 dark:text-pink-400 dark:hover:bg-pink-950/60"
            aria-label="แก้ไขสรุปทริป"
          >
            <Pencil className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerFast}
        className="mt-6 grid auto-cols-[minmax(140px,1fr)] grid-flow-col gap-4 overflow-x-auto pb-2 md:grid-flow-row md:grid-cols-5 md:overflow-visible md:pb-0"
      >
        {summaryItems.map((item) => (
          <motion.article
            key={item.label}
            variants={cardPop}
            whileHover={shouldReduceMotion ? {} : { ...liftHover, boxShadow: "0 12px 30px rgba(15,58,100,0.1)" }}
            transition={springSnappy}
            className="card-glow smooth-card flex min-w-[140px] flex-col items-center gap-2 rounded-2xl bg-white p-5 text-center shadow-sm dark:bg-[#0a233d] dark:shadow-none"
          >
            <motion.span
              whileHover={shouldReduceMotion ? {} : { scale: 1.16, rotate: 8 }}
              transition={springSnappy}
              className="text-3xl"
            >
              {item.icon}
            </motion.span>
            <p className="text-xs font-medium text-gray-500 dark:text-[#e3fafc]/68">
              {item.label}
            </p>
            <AnimatedCounter
              value={item.value}
              className="line-clamp-2 text-center text-sm font-semibold text-gray-800 dark:text-[#e3fafc]"
            />
          </motion.article>
        ))}
      </motion.div>

      {/* Modal แก้ไขข้อมูลสรุปทริป */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0a233d]"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/10">
                <h3 className="text-lg font-bold text-gray-900 dark:text-[#e3fafc]">แก้ไขข้อมูลสรุปทริป 📝</h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-[#e3fafc]/70">
                    ระยะเวลา (วัน)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={editedDuration}
                    onChange={(e) => setEditedDuration(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none dark:border-white/10 dark:bg-[#081d33] dark:text-[#e3fafc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-[#e3fafc]/70">
                    งบประมาณ
                  </label>
                  <input
                    type="text"
                    required
                    value={editedBudget}
                    onChange={(e) => setEditedBudget(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none dark:border-white/10 dark:bg-[#081d33] dark:text-[#e3fafc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-[#e3fafc]/70">
                    ผู้เดินทาง
                  </label>
                  <input
                    type="text"
                    required
                    value={editedTravelers}
                    onChange={(e) => setEditedTravelers(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none dark:border-white/10 dark:bg-[#081d33] dark:text-[#e3fafc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-[#e3fafc]/70">
                    ช่วงเวลาดีที่สุด
                  </label>
                  <input
                    type="text"
                    value={editedBestTime}
                    onChange={(e) => setEditedBestTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none dark:border-white/10 dark:bg-[#081d33] dark:text-[#e3fafc]"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-[#e3fafc] dark:hover:bg-white/5"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-pink-500 py-2.5 text-sm font-semibold text-white hover:bg-pink-600 disabled:opacity-50"
                  >
                    {isSaving ? (
                      "กำลังบันทึก..."
                    ) : (
                      <>
                        <Check className="h-4 w-4" /> บันทึก
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

