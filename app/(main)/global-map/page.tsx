"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import SiteHeader from "@/components/SiteHeader";
import { extractTripCoordinates, geocodeDestination } from "@/lib/coordinates";
import { fadeUp, motionEase } from "@/lib/motion";
import type { TripMarker } from "@/components/map/GlobeMap";
import type { TripData } from "@/types/trip";

// Dynamic import — Mapbox requires browser environment
const GlobeMap = dynamic(() => import("@/components/map/GlobeMap"), {
  ssr: false,
  loading: () => <GlobeMapSkeleton />,
});

function GlobeMapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-blue-900">
      <div className="space-y-3 text-center text-white/60">
        <div className="globe-spin-icon text-5xl">🌍</div>
        <p className="text-sm">กำลังโหลดแผนที่โลก...</p>
      </div>
    </div>
  );
}

export default function GlobalMapPage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [markers, setMarkers] = useState<TripMarker[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);

  const trips = useQuery(
    api.trips.getUserTrips,
    user?.id ? { userId: user.id } : "skip",
  );

  const isLoading = !isLoaded || Boolean(user?.id && trips === undefined);
  const isSignedOut = isLoaded && !user;

  // Process trips → extract/geocode coordinates
  useEffect(() => {
    if (!trips) return;

    const processTrips = async () => {
      setIsProcessing(true);
      const processed: TripMarker[] = [];

      for (const trip of trips) {
        const tripData = trip.tripData as TripData;

        // Try extracting from tripData first
        let coords = extractTripCoordinates(tripData);

        // Fallback: geocode destination name
        if (!coords) {
          coords = await geocodeDestination(trip.destination);
        }

        if (coords) {
          processed.push({
            tripId: trip._id,
            tripName: tripData?.tripName ?? trip.tripName ?? trip.destination,
            destination: trip.destination,
            duration: tripData?.duration ?? trip.duration,
            budget: tripData?.budget ?? trip.budget,
            travelers: tripData?.travelers ?? trip.travelers,
            coordinates: coords,
          });
        }
      }

      setMarkers(processed);
      setIsProcessing(false);
    };

    processTrips();
  }, [trips]);

  return (
    <>
      <SiteHeader />

      <main className="relative flex min-h-[calc(100vh-64px)] flex-col bg-gray-950">
        {/* Header bar */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex items-center justify-between border-b border-white/10 bg-gray-900/80 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
              aria-label="กลับ"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-2xl">🌍</span>
            <div>
              <h1 className="text-base font-bold text-white sm:text-lg">
                แผนที่ทริปของฉัน
              </h1>
              <p className="text-xs text-white/50">
                {isLoading || isProcessing
                  ? "กำลังโหลดตำแหน่ง..."
                  : `${markers.length} ปลายทางทั่วโลก`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Trip count badge */}
            {trips && trips.length > 0 && (
              <span className="hidden items-center gap-1 rounded-full border border-pink-500/30 bg-pink-500/20 px-3 py-1 text-xs text-pink-400 sm:inline-flex">
                ✈️ {trips.length} ทริป
              </span>
            )}

            <Link
              href="/my-trips"
              className="rounded-lg px-3 py-1.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              รายการทริป →
            </Link>
          </div>
        </motion.div>

        {/* Map area */}
        <div className="flex-1 p-3 sm:p-4">
          {/* Signed out state */}
          {isSignedOut ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex h-full flex-col items-center justify-center gap-5 rounded-2xl bg-gradient-to-br from-slate-800 to-blue-900 p-8 text-center"
            >
              <span className="text-6xl">🔐</span>
              <h2 className="text-2xl font-bold text-white">
                กรุณาเข้าสู่ระบบก่อนดูแผนที่
              </h2>
              <p className="max-w-sm text-sm text-white/60">
                เข้าสู่ระบบเพื่อดูทริปของคุณบนแผนที่โลก 3D
              </p>
              <Link
                href="/"
                className="inline-flex items-center rounded-full bg-[#ff3f78] px-8 py-3 font-semibold text-white shadow-[0_18px_55px_rgba(255,63,120,0.3)] transition hover:-translate-y-0.5 hover:bg-[#ff6b95]"
              >
                กลับไปหน้าแรก
              </Link>
            </motion.div>
          ) : isLoading ? (
            <GlobeMapSkeleton />
          ) : trips?.length === 0 ? (
            // Empty state
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex h-full flex-col items-center justify-center gap-5 rounded-2xl bg-gradient-to-br from-slate-800 to-blue-900 p-8 text-center"
            >
              <span className="text-6xl">🗺️</span>
              <h2 className="text-2xl font-bold text-white">
                ยังไม่มีทริปบนแผนที่
              </h2>
              <p className="max-w-sm text-white/60">
                สร้างทริปแรกของคุณแล้วจะเห็นมันปรากฏบนโลกทันที!
              </p>
              <Link
                href="/create-trip"
                className="inline-flex items-center rounded-full bg-[#ff3f78] px-8 py-3 font-semibold text-white shadow-[0_18px_55px_rgba(255,63,120,0.3)] transition hover:-translate-y-0.5 hover:bg-[#ff6b95]"
              >
                ✨ สร้างทริปแรก
              </Link>
            </motion.div>
          ) : (
            <GlobeMap
              trips={markers}
              onTripClick={(id) => router.push(`/view-trip/${id}`)}
            />
          )}
        </div>

        {/* Floating legend */}
        {markers.length > 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: shouldReduceMotion ? 0 : 1, duration: 0.5, ease: motionEase }}
            className="pointer-events-none absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs text-white/70 backdrop-blur-sm"
          >
            <span className={shouldReduceMotion ? "text-pink-400" : "animate-pulse text-pink-400"}>●</span>
            กดที่ ✈️ เพื่อดูรายละเอียดทริป | ลาก/ซูมเพื่อสำรวจโลก
          </motion.div>
        )}
      </main>
    </>
  );
}
