"use client";

import { motion, type Variants } from "framer-motion";
import { getMapsUrl } from "@/lib/maps";
import { cardReveal, motionEase, slideInLeft, staggerSoft } from "@/lib/motion";
import type { TripDay } from "@/types/trip";

interface ItineraryProps {
  itinerary?: Partial<TripDay>[] | null;
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

export default function Itinerary({ itinerary }: ItineraryProps) {
  if (!itinerary?.length) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-[#e3fafc]">
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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-[#e3fafc]">
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
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="mb-6 flex items-center gap-3"
              >
                <motion.span
                  whileHover={{ scale: 1.1 }}
                  className={`${color} rounded-full px-4 py-1.5 text-sm font-bold text-white`}
                >
                  วันที่ {dayNumber}
                </motion.span>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-[#e3fafc]">
                  {day.theme || "-"}
                </h3>
              </motion.div>

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
                        className="smooth-card space-y-2 rounded-xl bg-white p-4 shadow-sm dark:bg-[#0f2e4f] dark:shadow-none"
                      >
                        <h4 className="font-semibold text-gray-800 dark:text-[#e3fafc]">
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

                        <motion.a
                          href={getMapsUrl(place?.name || "-", place?.coordinates)}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ x: 3 }}
                          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-500 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          🗺️ ดูบน Google Maps →
                        </motion.a>
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
    </section>
  );
}
