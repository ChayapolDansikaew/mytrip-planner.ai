"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { Users, Check, Copy } from "lucide-react";

import type { TripData } from "@/types/trip";
import { motionEase, pressTap, springSnappy } from "@/lib/motion";

interface TripHeroProps {
  tripData: TripData;
  tripId: string;
  editToken?: string;
  ownerId: string;
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

export default function TripHero({
  tripData,
  tripId,
  editToken,
  ownerId,
}: TripHeroProps) {
  const router = useRouter();
  const setTripPublicStatus = useMutation(api.trips.setTripPublicStatus);
  const generateEditToken = useMutation(api.trips.generateTripEditToken);
  const [showInvitePopover, setShowInvitePopover] = useState(false);
  const [editUrlCopied, setEditUrlCopied] = useState(false);
  const [localEditToken, setLocalEditToken] = useState<string | undefined>(editToken);
  const { user } = useUser();
  const isOwner = user?.id === ownerId;

  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const destination = getDisplayValue(tripData.destination);

  async function handleShare() {
    const currentUrl = window.location.href;

    try {
      if (tripId) {
        await setTripPublicStatus({
          tripId: tripId as Id<"trips">,
          isPublic: true,
        });
      }
    } catch (error) {
      console.error("Failed to set trip public status:", error);
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: tripData.tripName || "AI Trip Planner",
          text: `ดูแผนการเดินทางไป ${destination} ของฉันสิ!`,
          url: currentUrl,
        });
        return; // Don't show toast if native share succeeds
      } catch (e) {
        // Fallback to clipboard if user cancels or it fails
        console.error("Native share failed, falling back to clipboard:", e);
      }
    }

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
        className="absolute left-4 top-4 z-20 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur transition-all hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 md:left-8 md:top-6"
      >
        ← กลับ
      </motion.button>

      <div className="absolute right-4 top-4 z-20 flex items-center gap-2 md:right-8 md:top-6">
        {isOwner && (
          <div className="relative">
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              onClick={async () => {
                setShowInvitePopover(!showInvitePopover);
                if (!localEditToken) {
                  try {
                    const token = await generateEditToken({ tripId: tripId as Id<"trips"> });
                    setLocalEditToken(token);
                  } catch (err) {
                    console.error("Failed to generate edit token:", err);
                  }
                }
              }}
              className="flex items-center gap-2 rounded-full border border-[#ff3f78]/30 bg-[#ff3f78]/20 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur transition-all hover:bg-[#ff3f78]/40 focus-visible:outline-none"
            >
              <Users className="h-4 w-4 text-[#ff3f78] dark:text-[#ff5a8d]" /> ชวนเพื่อนแก้ไข
            </motion.button>
            
            {/* Popover แสดงลิงก์เชิญชวน */}
            <AnimatePresence>
              {showInvitePopover && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-3 w-80 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl z-50 dark:border-white/10 dark:bg-[#0a233d]"
                >
                  <h4 className="text-sm font-bold text-gray-800 dark:text-[#e3fafc] mb-2">ลิงก์ชวนเพื่อนร่วมวางแผน ✈️</h4>
                  <p className="text-xs text-gray-500 dark:text-[#e3fafc]/70 mb-3">เพื่อนร่วมเดินทางจะสามารถเพิ่มกิจกรรม เลือกโรงแรม และวางแผนกับคุณแบบเรียลไทม์ได้ทันทีหลังจากลงทะเบียน</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={localEditToken ? `${window.location.origin}/view-trip/${tripId}?editKey=${localEditToken}` : "กำลังสร้างลิงก์..."}
                      className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-2 py-1.5 text-xs text-gray-900 focus:outline-none dark:border-white/20 dark:bg-[#081d33] dark:text-[#e3fafc]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (localEditToken) {
                          navigator.clipboard.writeText(`${window.location.origin}/view-trip/${tripId}?editKey=${localEditToken}`);
                          setEditUrlCopied(true);
                          setTimeout(() => setEditUrlCopied(false), 2000);
                        }
                      }}
                      className="rounded-lg bg-[#ff3f78] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#ff6b95]"
                    >
                      {editUrlCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <motion.button
          type="button"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...springSnappy, delay: 0.3 }}
          whileHover={shouldReduceMotion ? {} : { scale: 1.04, y: -1 }}
          whileTap={pressTap}
          onClick={handleShare}
          className="rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur transition-all hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          🔗 แชร์
        </motion.button>
      </div>

      <AnimatePresence>
        {copied ? (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.24, ease: motionEase }}
            className="fixed right-4 top-24 z-[100] rounded-full bg-gray-950/90 px-4 py-2 text-sm font-semibold text-white shadow-xl backdrop-blur md:right-8 md:top-24"
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
