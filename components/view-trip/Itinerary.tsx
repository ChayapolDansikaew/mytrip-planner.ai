"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ArrowUp, ArrowDown, Trash2, Plus, X, Check } from "lucide-react";
import { NavigateDropdown } from "@/components/map/NavigateDropdown";
import { cardReveal, motionEase, slideInLeft, staggerSoft } from "@/lib/motion";
import type { TripData, TripDay, TripPlace } from "@/types/trip";

interface ItineraryProps {
  itinerary?: TripDay[] | null;
  tripData: TripData;
  tripId: string;
  isEditable: boolean;
}

const dayColors = [
  "bg-pink-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-teal-500",
];

const dayReveal: Variants = cardReveal;
const placeSlide: Variants = slideInLeft;

function Chip({ icon, label }: { icon: string; label?: string | null }) {
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-[#0a233d] dark:text-[#e3fafc]/68">
      {icon} {label}
    </span>
  );
}

export default function Itinerary({ itinerary, tripData, tripId, isEditable }: ItineraryProps) {
  const updateTripData = useMutation(api.trips.updateTripData);

  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: "",
    details: "",
    ticketPrice: "",
    timeToVisit: "",
    travelTime: "",
  });

  const handleAddPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeDayIndex === null) return;
    setIsSaving(true);

    try {
      const addedPlace: TripPlace = {
        name: newPlace.name,
        details: newPlace.details,
        ticketPrice: newPlace.ticketPrice || "",
        timeToVisit: newPlace.timeToVisit || "",
        travelTime: newPlace.travelTime || "",
        coordinates: { lat: 13.7563, lng: 100.5018 },
      };

      const updatedItinerary = [...(itinerary || [])];
      const targetDay = updatedItinerary[activeDayIndex];

      if (targetDay) {
        const places = [...(targetDay.places || []), addedPlace];
        updatedItinerary[activeDayIndex] = {
          ...targetDay,
          places,
        };
      }

      await updateTripData({
        tripId: tripId as Id<"trips">,
        tripData: {
          ...tripData,
          itinerary: updatedItinerary,
        },
      });

      setShowAddModal(false);
      setNewPlace({ name: "", details: "", ticketPrice: "", timeToVisit: "", travelTime: "" });
    } catch (err) {
      console.error("Failed to add place:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlace = async (dayIndex: number, placeIndex: number) => {
    if (!window.confirm("คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?")) return;
    try {
      const updatedItinerary = [...(itinerary || [])];
      const targetDay = updatedItinerary[dayIndex];

      if (targetDay && targetDay.places) {
        const places = targetDay.places.filter((_, i) => i !== placeIndex);
        updatedItinerary[dayIndex] = {
          ...targetDay,
          places,
        };
      }

      await updateTripData({
        tripId: tripId as Id<"trips">,
        tripData: {
          ...tripData,
          itinerary: updatedItinerary,
        },
      });
    } catch (err) {
      console.error("Failed to delete place:", err);
    }
  };

  const handleMovePlace = async (dayIndex: number, placeIndex: number, direction: "up" | "down") => {
    try {
      const updatedItinerary = [...(itinerary || [])];
      const targetDay = updatedItinerary[dayIndex];

      if (targetDay && targetDay.places) {
        const places = [...targetDay.places];
        if (direction === "up" && placeIndex > 0) {
          [places[placeIndex], places[placeIndex - 1]] = [places[placeIndex - 1], places[placeIndex]];
        } else if (direction === "down" && placeIndex < places.length - 1) {
          [places[placeIndex], places[placeIndex + 1]] = [places[placeIndex + 1], places[placeIndex]];
        }

        updatedItinerary[dayIndex] = {
          ...targetDay,
          places,
        };
      }

      await updateTripData({
        tripId: tripId as Id<"trips">,
        tripData: {
          ...tripData,
          itinerary: updatedItinerary,
        },
      });
    } catch (err) {
      console.error("Failed to move place:", err);
    }
  };

  if (!itinerary?.length) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#e3fafc]">
          🗓️ แผนการเดินทางรายวัน
        </h2>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-gray-500 shadow-sm dark:border-white/10 dark:bg-[#0a233d] dark:text-[#e3fafc]/68"
        >
          ยังไม่มีข้อมูลแผนการเดินทางรายวันสำหรับทริปนี้
        </motion.div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-normal text-gray-900 dark:text-[#e3fafc]">
        🗓️ แผนการเดินทางรายวัน
      </h2>

      <div className="mt-6 space-y-10">
        {itinerary.map((day, dayIndex) => {
          const dayNumber = day.day ?? dayIndex + 1;
          const color = dayColors[(dayNumber - 1) % dayColors.length];

          return (
            <motion.article
              key={`${dayNumber}-${day.theme ?? "day"}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={dayReveal}
              className="rounded-2xl bg-white/70 p-5 shadow-sm backdrop-blur sm:p-6 dark:bg-[#0a233d]/45 dark:shadow-none transition-colors duration-300"
            >
              <div className="mb-6 flex items-center justify-between">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3"
                >
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    className={`${color} rounded-full px-4 py-1.5 text-sm font-semibold text-white`}
                  >
                    วันที่ {dayNumber}
                  </motion.span>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-[#e3fafc]">
                    {day.theme || "-"}
                  </h3>
                </motion.div>

                {isEditable && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setActiveDayIndex(dayIndex);
                      setShowAddModal(true);
                    }}
                    className="flex items-center gap-1 rounded-full bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-600 hover:bg-pink-100 dark:bg-pink-950/20 dark:text-pink-400 dark:hover:bg-pink-950/40"
                  >
                    <Plus className="h-3.5 w-3.5" /> เพิ่มกิจกรรม
                  </motion.button>
                )}
              </div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerSoft}
                className="relative space-y-6 pl-6"
              >
                {/* Animated timeline line */}
                <div className="absolute bottom-0 left-2 top-0 w-0.5 overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="w-full bg-gray-200 dark:bg-[#0f2e4f]"
                  />
                </div>

                {day.places?.length ? (
                  day.places.map((place, placeIndex) => (
                    <motion.div
                      key={`${place?.name ?? "place"}-${placeIndex}`}
                      variants={placeSlide}
                      className="relative"
                    >
                      {/* Animated timeline dot */}
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: placeIndex * 0.08 + 0.24, type: "spring", stiffness: 360, damping: 24 }}
                        className={`absolute -left-4 top-1.5 h-3 w-3 rounded-full border-2 border-white shadow ${color}`}
                      />

                      <motion.div
                        whileHover={{ x: 3, boxShadow: "0 12px 32px rgba(15,58,100,0.1)" }}
                        transition={{ duration: 0.22, ease: motionEase }}
                        className="smooth-card relative space-y-2 rounded-xl bg-white p-4 shadow-sm dark:bg-[#0f2e4f] dark:shadow-none"
                      >
                        {/* Edit Buttons Bar */}
                        {isEditable && (
                          <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={placeIndex === 0}
                              onClick={() => handleMovePlace(dayIndex, placeIndex, "up")}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                              title="เลื่อนขึ้น"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={placeIndex === (day.places?.length || 1) - 1}
                              onClick={() => handleMovePlace(dayIndex, placeIndex, "down")}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                              title="เลื่อนลง"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePlace(dayIndex, placeIndex)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-50 text-gray-500 hover:bg-red-500 hover:text-white dark:bg-gray-800 dark:text-gray-400"
                              title="ลบสถานที่"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}

                        <h4 className="font-semibold text-gray-800 pr-24 dark:text-[#e3fafc]">
                          {place?.name || "-"}
                        </h4>
                        <p className="text-sm leading-6 text-gray-600 dark:text-[#e3fafc]/80">
                          {place?.details || "-"}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1">
                          <Chip icon="🎟️" label={place?.ticketPrice} />
                          <Chip icon="⏰" label={place?.timeToVisit} />
                          <Chip icon="🚗" label={place?.travelTime} />
                        </div>

                        <div className="mt-2 pt-1">
                          <NavigateDropdown
                            name={place?.name || "-"}
                            coordinates={place?.coordinates}
                          />
                        </div>
                      </motion.div>
                    </motion.div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-500 dark:border-white/10 dark:bg-[#0a233d] dark:text-[#e3fafc]/68">
                    ยังไม่มีสถานที่สำหรับวันนี้
                  </div>
                )}
              </motion.div>
            </motion.article>
          );
        })}
      </div>

      {/* Modal เพิ่มสถานที่ */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0a233d]"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/10">
                <h3 className="text-lg font-bold text-gray-900 dark:text-[#e3fafc]">
                  เพิ่มกิจกรรมของ วันที่ {activeDayIndex !== null ? activeDayIndex + 1 : ""} ✈️
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddPlace} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-[#e3fafc]/70">
                    ชื่อสถานที่ / กิจกรรม
                  </label>
                  <input
                    type="text"
                    required
                    value={newPlace.name}
                    onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none dark:border-white/10 dark:bg-[#081d33] dark:text-[#e3fafc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-[#e3fafc]/70">
                    รายละเอียดกิจกรรม
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newPlace.details}
                    onChange={(e) => setNewPlace({ ...newPlace, details: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none dark:border-white/10 dark:bg-[#081d33] dark:text-[#e3fafc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-[#e3fafc]/70">
                    ค่าเข้าชม (เช่น ฟรี, 100 บาท)
                  </label>
                  <input
                    type="text"
                    value={newPlace.ticketPrice}
                    onChange={(e) => setNewPlace({ ...newPlace, ticketPrice: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none dark:border-white/10 dark:bg-[#081d33] dark:text-[#e3fafc]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-[#e3fafc]/70">
                      เวลาเข้าชม (เช่น 1 ชั่วโมง)
                    </label>
                    <input
                      type="text"
                      value={newPlace.timeToVisit}
                      onChange={(e) => setNewPlace({ ...newPlace, timeToVisit: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none dark:border-white/10 dark:bg-[#081d33] dark:text-[#e3fafc]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-[#e3fafc]/70">
                      เวลาในการเดินทาง (เช่น 15 นาที)
                    </label>
                    <input
                      type="text"
                      value={newPlace.travelTime}
                      onChange={(e) => setNewPlace({ ...newPlace, travelTime: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none dark:border-white/10 dark:bg-[#081d33] dark:text-[#e3fafc]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
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
