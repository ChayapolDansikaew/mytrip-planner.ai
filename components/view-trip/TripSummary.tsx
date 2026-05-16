"use client";

import { motion, type Variants } from "framer-motion";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import type { TripData } from "@/types/trip";

interface TripSummaryProps {
  tripData: TripData;
}

function formatValue(value?: string | number | null, fallback = "-") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value);
}

const cardPop: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function TripSummary({ tripData }: TripSummaryProps) {
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
      value: formatValue(tripData.bestTimeToVisit),
    },
  ];

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900">📊 สรุปทริป</h2>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        className="mt-6 grid auto-cols-[minmax(140px,1fr)] grid-flow-col gap-4 overflow-x-auto pb-2 md:grid-flow-row md:grid-cols-5 md:overflow-visible md:pb-0"
      >
        {summaryItems.map((item) => (
          <motion.article
            key={item.label}
            variants={cardPop}
            whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(0,0,0,0.1)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="card-glow flex min-w-[140px] flex-col items-center gap-2 rounded-2xl bg-white p-5 text-center shadow-sm"
          >
            <motion.span
              whileHover={{ scale: 1.25, rotate: 10 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="text-3xl"
            >
              {item.icon}
            </motion.span>
            <p className="text-xs font-medium text-gray-500">
              {item.label}
            </p>
            <AnimatedCounter
              value={item.value}
              className="line-clamp-2 text-center text-sm font-bold text-gray-800"
            />
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
