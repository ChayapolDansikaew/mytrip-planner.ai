"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { NavigateDropdown } from "@/components/map/NavigateDropdown";
import { cardReveal, liftHover, pressTap, springSnappy, staggerSoft } from "@/lib/motion";
import type { TripHotel } from "@/types/trip";

interface HotelListProps {
  hotels?: Partial<TripHotel>[] | null;
}

function renderStars(rating?: number | null) {
  const safeRating = Math.max(0, Math.min(5, rating ?? 0));
  const full = Math.floor(safeRating);
  const half = safeRating % 1 >= 0.5;

  return "⭐".repeat(full) + (half ? "✨" : "");
}

function getInitial(name?: string | null) {
  return (name?.trim().charAt(0) || "H").toUpperCase();
}

const cardVariant: Variants = cardReveal;

export default function HotelList({ hotels }: HotelListProps) {
  const shouldReduceMotion = useReducedMotion();

  if (!hotels?.length) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-[#e3fafc]">🏨 โรงแรมแนะนำ</h2>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-gray-500 shadow-sm dark:border-white/10 dark:bg-[#0a233d] dark:text-[#e3fafc]/68"
        >
          ยังไม่มีข้อมูลโรงแรมแนะนำสำหรับทริปนี้
        </motion.div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-normal text-gray-900 dark:text-[#e3fafc]">🏨 โรงแรมแนะนำ</h2>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={staggerSoft}
        className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        {hotels.map((hotel, index) => {
          const name = hotel.name || "-";
          const rating = hotel.rating;

          return (
            <motion.article
              key={`${name}-${index}`}
              variants={cardVariant}
              whileHover={shouldReduceMotion ? {} : { ...liftHover, boxShadow: "0 20px 50px rgba(15,58,100,0.12)" }}
              className="card-glow smooth-card rounded-2xl bg-white shadow-sm dark:bg-[#0a233d] dark:shadow-none"
            >
              <div className="flex h-40 items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br from-pink-400 via-cyan-400 to-lime-300 text-6xl font-black text-white gradient-animated">
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                >
                  {getInitial(name)}
                </motion.span>
              </div>

              <div className="space-y-3 p-5">
                <div>
                  <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 dark:text-[#e3fafc]">
                    {name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm">{renderStars(rating)}</span>
                    <span className="text-sm text-gray-500 dark:text-[#e3fafc]/68">
                      {rating ? rating.toFixed(1) : "-"}
                    </span>
                  </div>
                </div>

                <p className="line-clamp-1 text-sm text-gray-500 dark:text-[#e3fafc]/68">
                  📍 {hotel.address || "-"}
                </p>

                <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-300">
                  💰 {hotel.price || "-"}
                </span>

                <p className="line-clamp-2 text-sm leading-6 text-gray-600 dark:text-[#e3fafc]/80">
                  {hotel.description || "-"}
                </p>

                <div className="pt-2">
                  <NavigateDropdown
                    name={name}
                    coordinates={hotel.coordinates}
                    variant="full"
                  />
                </div>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
}
