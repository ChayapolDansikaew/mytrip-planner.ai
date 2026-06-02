"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { cardReveal, liftHover, springSnappy, staggerFast } from "@/lib/motion";
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

const cardPop: Variants = cardReveal;

export default function TripSummary({ tripData }: TripSummaryProps) {
  const shouldReduceMotion = useReducedMotion();
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
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-[#e3fafc]">📊 สรุปทริป</h2>
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
              className="line-clamp-2 text-center text-sm font-bold text-gray-800 dark:text-[#e3fafc]"
            />
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
