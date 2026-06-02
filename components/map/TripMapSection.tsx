"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, type Variants } from "framer-motion";
import PlaceList from "./PlaceList";
import type { TripHotel, TripDay } from "@/types/trip";

const TripMap = dynamic(() => import("./TripMap"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full w-full items-center justify-center
      rounded-2xl bg-gray-100 dark:bg-[#0a233d]"
    >
      <div className="space-y-2 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500 dark:border-pink-900/30 dark:border-t-pink-500" />
        <p className="text-sm text-gray-500 dark:text-[#e3fafc]/68">กำลังโหลดแผนที่...</p>
      </div>
    </div>
  ),
});

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

interface TripMapSectionProps {
  hotels: TripHotel[];
  itinerary: TripDay[];
}

export default function TripMapSection({
  hotels,
  itinerary,
}: TripMapSectionProps) {
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [view, setView] = useState<"split" | "map" | "list">("split");

  // Only show the section if there's at least one place with coordinates
  const hasCoords =
    hotels?.some((h) => h.coordinates?.lat && h.coordinates?.lng) ||
    itinerary?.some((d) =>
      d.places?.some((p) => p.coordinates?.lat && p.coordinates?.lng),
    );

  if (!hasCoords) return null;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeIn}
      className="space-y-4"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-[#e3fafc]">
          🗺️ แผนที่การเดินทาง
        </h2>

        {/* View Toggle */}
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-[#0f2e4f]">
          {(["split", "map", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium
                transition-all cursor-pointer
                ${
                  view === v
                    ? "bg-white text-gray-800 shadow dark:bg-[#0a233d] dark:text-[#e3fafc] dark:shadow-none"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
            >
              {v === "split"
                ? "⊞ แบ่ง"
                : v === "map"
                  ? "🗺️ แผนที่"
                  : "📋 รายการ"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        className={`overflow-hidden rounded-2xl border border-gray-200 shadow-sm dark:border-white/10 dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-colors duration-300
        ${
          view === "split"
            ? "flex h-[600px] flex-col lg:flex-row"
            : "h-[500px]"
        }`}
      >
        {/* Place List Panel */}
        {(view === "split" || view === "list") && (
          <div
            className={`bg-white p-4 dark:bg-[#0a233d]/70 transition-colors duration-300
            ${
              view === "split"
                ? "h-64 w-full border-b border-gray-200 lg:h-full lg:w-80 lg:border-b-0 lg:border-r dark:border-white/10"
                : "h-full w-full"
            }`}
          >
            <PlaceList
              hotels={hotels}
              itinerary={itinerary}
              activeMarkerId={activeMarkerId}
              onPlaceClick={setActiveMarkerId}
            />
          </div>
        )}

        {/* Map Panel */}
        {(view === "split" || view === "map") && (
          <div className={view === "split" ? "flex-1" : "h-full w-full"}>
            <TripMap
              hotels={hotels}
              itinerary={itinerary}
              activeMarkerId={activeMarkerId}
              onMarkerClick={setActiveMarkerId}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
