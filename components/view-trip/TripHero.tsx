"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { TripData } from "@/types/trip";
import { motionEase, pressTap, springSnappy } from "@/lib/motion";

interface TripHeroProps {
  tripData: TripData;
  tripId: string;
}

const gradients = [
  "from-pink-500 via-rose-400 to-orange-400",
  "from-blue-500 via-cyan-400 to-teal-400",
  "from-purple-500 via-violet-400 to-pink-400",
  "from-green-500 via-emerald-400 to-cyan-400",
  "from-orange-500 via-amber-400 to-yellow-400",
  "from-indigo-500 via-blue-400 to-cyan-400",
];

function getDisplayValue(value?: string | number | null, fallback = "-") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value);
}

export default function TripHero({ tripData }: TripHeroProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const destination = getDisplayValue(tripData.destination);
  const idx = destination.charCodeAt(0) % gradients.length;
  const gradient = gradients[idx];

  async function handleShare() {
    const currentUrl = window.location.href;

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(currentUrl);
    } else {
      const input = document.createElement("input");
      input.value = currentUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section
      className={`relative flex h-72 w-full overflow-hidden bg-gradient-to-br ${gradient} text-white shadow-sm md:h-96 gradient-animated`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/20" />
      <motion.div
        animate={shouldReduceMotion ? {} : { scale: [1, 1.12, 1], opacity: [0.2, 0.28, 0.2] }}
        transition={{ repeat: Infinity, duration: 10, ease: motionEase }}
        className="absolute left-8 top-12 h-28 w-28 rounded-full bg-white/20 blur-2xl"
      />
      <motion.div
        animate={shouldReduceMotion ? {} : { scale: [1, 1.16, 1], opacity: [0.15, 0.24, 0.15] }}
        transition={{ repeat: Infinity, duration: 12, ease: motionEase, delay: 2 }}
        className="absolute bottom-8 right-10 h-40 w-40 rounded-full bg-white/15 blur-3xl"
      />

      <motion.button
        type="button"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...springSnappy, delay: 0.3 }}
        whileHover={shouldReduceMotion ? {} : { scale: 1.04, y: -1 }}
        whileTap={pressTap}
        onClick={() => router.back()}
        className="absolute left-4 top-4 z-10 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur transition-all hover:bg-white/30 md:left-8 md:top-6"
      >
        ← กลับ
      </motion.button>

      <motion.button
        type="button"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...springSnappy, delay: 0.3 }}
        whileHover={shouldReduceMotion ? {} : { scale: 1.04, y: -1 }}
        whileTap={pressTap}
        onClick={handleShare}
        className="absolute right-4 top-4 z-10 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur transition-all hover:bg-white/30 md:right-8 md:top-6"
      >
        🔗 แชร์
      </motion.button>

      <AnimatePresence>
        {copied ? (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.24, ease: motionEase }}
            className="absolute right-4 top-16 z-20 rounded-full bg-gray-950/90 px-4 py-2 text-sm font-semibold text-white shadow-xl backdrop-blur md:right-8 md:top-20"
          >
            ✅ คัดลอกลิงก์แล้ว!
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...springSnappy, delay: 0.2 }}
        className="relative z-10 flex w-full flex-col items-center justify-center px-4 pb-28 pt-16 text-center md:pb-32"
      >
        <motion.span
          animate={shouldReduceMotion ? {} : { y: [0, -7, 0], rotate: [0, 4, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3.6, ease: motionEase }}
          className="text-6xl drop-shadow-lg md:text-7xl"
        >
          ✈️
        </motion.span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.56, ease: motionEase }}
        className="absolute bottom-0 left-0 right-0 z-10 p-5 md:p-8"
      >
        <div className="mx-auto max-w-5xl">
          <h1 className="line-clamp-2 text-3xl font-bold text-white drop-shadow-sm md:text-5xl">
            {getDisplayValue(tripData.tripName, destination)}
          </h1>
          <p className="mt-2 text-lg font-medium text-white/80">
            📍 {destination}
          </p>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
            className="mt-4 flex flex-wrap gap-2"
          >
            {[
              { label: tripData.duration ? `📅 ${tripData.duration} วัน` : null },
              { label: `💰 ${getDisplayValue(tripData.budget)}` },
              { label: `👥 ${getDisplayValue(tripData.travelers)}` },
            ]
              .filter((b) => b.label)
              .map((badge) => (
                <motion.span
                  key={badge.label}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                  className="rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur"
                >
                  {badge.label}
                </motion.span>
              ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
