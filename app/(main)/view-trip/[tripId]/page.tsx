"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, type Variants } from "framer-motion";

import HotelList from "@/components/view-trip/HotelList";
import SiteHeader from "@/components/SiteHeader";
import Itinerary from "@/components/view-trip/Itinerary";
import TripHero from "@/components/view-trip/TripHero";
import TripMapSection from "@/components/map/TripMapSection";
import TripPageSkeleton from "@/components/view-trip/TripPageSkeleton";
import TripSummary from "@/components/view-trip/TripSummary";
import TripActions from "@/components/view-trip/TripActions";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TripData } from "@/types/trip";

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function ViewTripPage() {
  const router = useRouter();
  const params = useParams<{ tripId?: string | string[] }>();
  const tripId = Array.isArray(params.tripId)
    ? params.tripId[0]
    : params.tripId;

  const [editKey, setEditKey] = useState<string | undefined>(undefined);
  const { user, isLoaded: isUserLoaded } = useUser();
  const joinCollab = useMutation(api.trips.joinCollaborator);

  useEffect(() => {
    if (!tripId) return;
    const urlParams = new URLSearchParams(window.location.search);
    const keyInUrl = urlParams.get("editKey");
    if (keyInUrl) {
      setTimeout(() => setEditKey(keyInUrl), 0);
      localStorage.setItem(`editKey_${tripId}`, keyInUrl);
    } else {
      const storedKey = localStorage.getItem(`editKey_${tripId}`);
      if (storedKey) {
        setTimeout(() => setEditKey(storedKey), 0);
      }
    }
  }, [tripId]);

  const trip = useQuery(
    api.trips.getTripById,
    tripId
      ? {
          tripId: tripId as Id<"trips">,
          editKey: editKey,
        }
      : "skip",
  );

  const isCollab = useQuery(
    api.trips.checkCollaboratorStatus,
    tripId && user
      ? { tripId: tripId as Id<"trips">, userId: user.id }
      : "skip"
  );

  const isEditable = user && trip ? (trip.userId === user.id || !!isCollab) : false;

  useEffect(() => {
    if (!tripId || !isUserLoaded) return;

    const currentKey = editKey || localStorage.getItem(`editKey_${tripId}`) || undefined;
    
    if (user && currentKey) {
      joinCollab({
        tripId: tripId as Id<"trips">,
        editKey: currentKey,
      })
        .then(() => {
          console.log("บันทึกสิทธิ์แก้ไขทริปเรียบร้อย");
          if (window.location.search.includes("editKey")) {
            const newUrl = window.location.pathname;
            window.history.replaceState({ path: newUrl }, "", newUrl);
          }
        })
        .catch((err) => {
          console.error("Join collaboration failed:", err);
        });
    } else if (!user && currentKey) {
      const currentUrl = window.location.href;
      router.push(`/sign-up?redirect_url=${encodeURIComponent(currentUrl)}`);
    }
  }, [tripId, isUserLoaded, user, editKey, joinCollab, router]);

  if (trip === undefined) return <TripPageSkeleton />;

  if (!trip) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center dark:bg-[#081d33] dark:text-[#e3fafc]"
      >
        <motion.span
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-6xl"
        >
          🗺️
        </motion.span>
        <h2 className="text-2xl font-bold text-gray-700 dark:text-[#e3fafc]">ไม่พบข้อมูลทริป</h2>
        <p className="text-gray-500 dark:text-[#e3fafc]/68">ทริปนี้อาจถูกลบไปแล้วหรือลิงก์ไม่ถูกต้อง</p>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/my-trips")}
          className="rounded-full bg-pink-500 px-6 py-2.5 font-semibold text-white transition-all hover:bg-pink-600"
        >
          ← กลับไปทริปของฉัน
        </motion.button>
      </motion.div>
    );
  }

  const tripData = trip.tripData as TripData;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#081d33] dark:text-[#e3fafc]">
      <SiteHeader />
      <TripHero
        tripData={tripData}
        tripId={tripId ?? ""}
        editToken={trip.editToken}
        ownerId={trip.userId}
      />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="mx-auto max-w-5xl space-y-14 px-4 py-10"
      >
        <motion.div variants={sectionReveal}>
          <TripActions tripData={tripData} />
        </motion.div>
        <motion.div variants={sectionReveal}>
          <TripSummary tripData={tripData} tripId={tripId ?? ""} isEditable={isEditable} />
        </motion.div>
        <motion.div variants={sectionReveal}>
          <TripMapSection
            hotels={tripData.hotels ?? []}
            itinerary={tripData.itinerary ?? []}
          />
        </motion.div>
        <motion.div variants={sectionReveal}>
          <HotelList hotels={tripData.hotels ?? []} tripData={tripData} tripId={tripId ?? ""} isEditable={isEditable} />
        </motion.div>
        <motion.div variants={sectionReveal}>
          <Itinerary itinerary={tripData.itinerary ?? []} tripData={tripData} tripId={tripId ?? ""} isEditable={isEditable} />
        </motion.div>
        <motion.div
          variants={sectionReveal}
          className="flex flex-col justify-center gap-3 border-t border-gray-200 pt-6 sm:flex-row dark:border-white/10"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/create-trip")}
            className="rounded-full bg-pink-500 px-8 py-3 font-semibold text-white transition-all hover:bg-pink-600"
          >
            ✨ สร้างทริปใหม่
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/my-trips")}
            className="rounded-full border border-gray-300 px-8 py-3 font-semibold text-gray-700 transition-all hover:border-pink-400 hover:text-pink-500 dark:border-white/10 dark:text-[#e3fafc] dark:hover:border-[#ff3f78]/40 dark:hover:text-[#ff5a8d]"
          >
            🗺️ ทริปทั้งหมดของฉัน
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
