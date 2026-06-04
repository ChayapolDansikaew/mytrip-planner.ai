"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { TripData } from "@/types/trip";
import { motionEase, pressTap, springSnappy } from "@/lib/motion";

interface TripHeroProps {
  tripData: TripData;
  tripId: string;
}



function getDisplayValue(value?: string | number | null, fallback = "-") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value);
}

function getDestinationImage(destination: string): string | null {
  const dest = destination.toLowerCase().trim();
  if (
    dest.includes("กรุงเทพ") ||
    dest.includes("bangkok") ||
    dest.includes("thailand") ||
    dest.includes("ไทย")
  ) {
    return "/images/bangkok.png";
  }
  if (
    dest.includes("ปารีส") ||
    dest.includes("paris") ||
    dest.includes("ฝรั่งเศส") ||
    dest.includes("france")
  ) {
    return "/images/paris.png";
  }
  if (
    dest.includes("โตเกียว") ||
    dest.includes("tokyo") ||
    dest.includes("ญี่ปุ่น") ||
    dest.includes("japan")
  ) {
    return "/images/tokyo.png";
  }
  if (
    dest.includes("นิวยอร์ก") ||
    dest.includes("new york") ||
    dest.includes("สหรัฐ") ||
    dest.includes("america") ||
    dest.includes("usa")
  ) {
    return "/images/new_york.png";
  }
  if (
    dest.includes("โรม") ||
    dest.includes("rome") ||
    dest.includes("อิตาลี") ||
    dest.includes("italy")
  ) {
    return "/images/rome.png";
  }
  return null;
}

export default function TripHero({ tripData }: TripHeroProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const destination = getDisplayValue(tripData.destination);

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

  const imageUrl = getDestinationImage(destination);

  return (
    <section
      className="relative flex h-72 w-full overflow-hidden bg-slate-900 text-white shadow-sm md:h-96"
    >
      <Image
        src={imageUrl || "/images/default_travel.png"}
        alt={destination}
        fill
        className="object-cover transition-transform duration-[15s] ease-out scale-105"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/25" />

      <motion.button
        type="button"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...springSnappy, delay: 0.3 }}
        whileHover={shouldReduceMotion ? {} : { scale: 1.04, y: -1 }}
        whileTap={pressTap}
        onClick={() => {
          if (typeof window !== "undefined" && document.referrer.includes(window.location.host)) {
            router.back();
          } else {
            router.push("/my-trips");
          }
        }}
        className="absolute left-4 top-4 z-20 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur transition-all hover:bg-white/30 md:left-8 md:top-6"
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
        className="absolute right-4 top-4 z-20 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur transition-all hover:bg-white/30 md:right-8 md:top-6"
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
            className="absolute right-4 top-16 z-30 rounded-full bg-gray-950/90 px-4 py-2 text-sm font-semibold text-white shadow-xl backdrop-blur md:right-8 md:top-20"
          >
            ✅ คัดลอกลิงก์แล้ว!
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.56, ease: motionEase }}
        className="absolute bottom-0 left-0 right-0 z-10 p-5 md:p-8"
      >
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...springSnappy, delay: 0.2 }}
            className="mb-3 inline-block"
          >
            <motion.span
              animate={shouldReduceMotion ? {} : { y: [0, -4, 0], rotate: [0, 3, -3, 0] }}
              transition={{ repeat: Infinity, duration: 3.6, ease: motionEase }}
              className="inline-block text-4xl drop-shadow-lg md:text-5xl"
            >
              ✈️
            </motion.span>
          </motion.div>
          <h1 className="line-clamp-2 text-3xl font-semibold tracking-normal text-white drop-shadow-lg md:text-6xl">
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
