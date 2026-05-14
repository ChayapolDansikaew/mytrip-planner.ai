"use client";

import { getMapsUrl } from "@/lib/maps";
import type { TripDay } from "@/types/trip";

interface ItineraryProps {
  itinerary?: Partial<TripDay>[] | null;
}

const dayColors = [
  "bg-pink-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-teal-500",
];

function Chip({ icon, label }: { icon: string; label?: string | null }) {
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
      {icon} {label}
    </span>
  );
}

export default function Itinerary({ itinerary }: ItineraryProps) {
  if (!itinerary?.length) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-900">
          🗓️ แผนการเดินทางรายวัน
        </h2>
        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-gray-500 shadow-sm">
          ยังไม่มีข้อมูลแผนการเดินทางรายวันสำหรับทริปนี้
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900">
        🗓️ แผนการเดินทางรายวัน
      </h2>

      <div className="mt-6 space-y-10">
        {itinerary.map((day, dayIndex) => {
          const dayNumber = day.day ?? dayIndex + 1;
          const color = dayColors[(dayNumber - 1) % dayColors.length];

          return (
            <article
              key={`${dayNumber}-${day.theme ?? "day"}`}
              className="rounded-2xl bg-white/70 p-5 shadow-sm backdrop-blur sm:p-6"
            >
              <div className="mb-6 flex items-center gap-3">
                <span className={`${color} rounded-full px-4 py-1.5 text-sm font-bold text-white`}>
                  วันที่ {dayNumber}
                </span>
                <h3 className="text-lg font-semibold text-gray-800">
                  {day.theme || "-"}
                </h3>
              </div>

              <div className="relative space-y-6 pl-6">
                <div className="absolute bottom-0 left-2 top-0 w-0.5 bg-gray-200" />

                {day.places?.length ? (
                  day.places.map((place, placeIndex) => (
                    <div
                      key={`${place?.name ?? "place"}-${placeIndex}`}
                      className="relative"
                    >
                      <div className={`absolute -left-4 top-1.5 h-3 w-3 rounded-full border-2 border-white shadow ${color}`} />

                      <div className="space-y-2 rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md">
                        <h4 className="font-semibold text-gray-800">
                          {place?.name || "-"}
                        </h4>
                        <p className="text-sm leading-6 text-gray-600">
                          {place?.details || "-"}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1">
                          <Chip icon="🎟️" label={place?.ticketPrice} />
                          <Chip icon="⏰" label={place?.timeToVisit} />
                          <Chip icon="🚗" label={place?.travelTime} />
                        </div>

                        <a
                          href={getMapsUrl(place?.name || "-", place?.coordinates)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-500 transition-colors hover:text-blue-700"
                        >
                          🗺️ ดูบน Google Maps →
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-500">
                    ยังไม่มีสถานที่สำหรับวันนี้
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
