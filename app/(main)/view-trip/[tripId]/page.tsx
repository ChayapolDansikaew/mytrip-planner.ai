"use client";

import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";

import HotelList from "@/components/view-trip/HotelList";
import Itinerary from "@/components/view-trip/Itinerary";
import TripHero from "@/components/view-trip/TripHero";
import TripPageSkeleton from "@/components/view-trip/TripPageSkeleton";
import TripSummary from "@/components/view-trip/TripSummary";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TripData } from "@/types/trip";

export default function ViewTripPage() {
  const router = useRouter();
  const params = useParams<{ tripId?: string | string[] }>();
  const tripId = Array.isArray(params.tripId)
    ? params.tripId[0]
    : params.tripId;
  const trip = useQuery(
    api.trips.getTripById,
    tripId ? { tripId: tripId as Id<"trips"> } : "skip",
  );

  if (trip === undefined) return <TripPageSkeleton />;

  if (!trip) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
        <span className="text-6xl">🗺️</span>
        <h2 className="text-2xl font-bold text-gray-700">ไม่พบข้อมูลทริป</h2>
        <p className="text-gray-500">ทริปนี้อาจถูกลบไปแล้วหรือลิงก์ไม่ถูกต้อง</p>
        <button
          type="button"
          onClick={() => router.push("/my-trips")}
          className="rounded-full bg-pink-500 px-6 py-2.5 font-semibold text-white transition-all hover:bg-pink-600"
        >
          ← กลับไปทริปของฉัน
        </button>
      </div>
    );
  }

  const tripData = trip.tripData as TripData;

  return (
    <div className="min-h-screen bg-gray-50">
      <TripHero tripData={tripData} tripId={tripId ?? ""} />
      <div className="mx-auto max-w-5xl space-y-14 px-4 py-10">
        <TripSummary tripData={tripData} />
        <HotelList hotels={tripData.hotels ?? []} />
        <Itinerary itinerary={tripData.itinerary ?? []} />
        <div className="flex flex-col justify-center gap-3 border-t border-gray-200 pt-6 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/create-trip")}
            className="rounded-full bg-pink-500 px-8 py-3 font-semibold text-white transition-all hover:bg-pink-600"
          >
            ✨ สร้างทริปใหม่
          </button>
          <button
            type="button"
            onClick={() => router.push("/my-trips")}
            className="rounded-full border border-gray-300 px-8 py-3 font-semibold text-gray-700 transition-all hover:border-pink-400 hover:text-pink-500"
          >
            🗺️ ทริปทั้งหมดของฉัน
          </button>
        </div>
      </div>
    </div>
  );
}
