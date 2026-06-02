"use client";

import { useRef, useEffect } from "react";
import type { TripHotel, TripDay } from "@/types/trip";

const DAY_COLORS = [
  "border-pink-300 bg-pink-50/70 text-pink-900",
  "border-blue-300 bg-blue-50/70 text-blue-900",
  "border-purple-300 bg-purple-50/70 text-purple-900",
  "border-green-300 bg-green-50/70 text-green-900",
  "border-orange-300 bg-orange-50/70 text-orange-900",
  "border-teal-300 bg-teal-50/70 text-teal-900",
];

const DAY_BADGE_COLORS = [
  "bg-pink-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-teal-500",
];

interface PlaceListProps {
  hotels: TripHotel[];
  itinerary: TripDay[];
  activeMarkerId: string | null;
  onPlaceClick: (markerId: string) => void;
}

export default function PlaceList({
  hotels,
  itinerary,
  activeMarkerId,
  onPlaceClick,
}: PlaceListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to active item
  useEffect(() => {
    if (activeMarkerId && activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeMarkerId]);

  return (
    <div ref={scrollRef} className="h-full space-y-6 overflow-y-auto pr-1">
      {/* Hotels Section */}
      {hotels?.length > 0 && (
        <div>
          <h3
            className="mb-3 px-1 text-sm font-bold uppercase
            tracking-wider text-gray-500"
          >
            🏨 โรงแรมแนะนำ
          </h3>
          <div className="space-y-2">
            {hotels.map((hotel, idx) => {
              const markerId = `hotel-${idx}`;
              const isActive = activeMarkerId === markerId;
              return (
                <button
                  key={idx}
                  ref={isActive ? activeRef : undefined}
                  onClick={() => onPlaceClick(markerId)}
                  className={`w-full rounded-xl border p-3
                    text-left transition-all duration-200
                    ${
                      isActive
                        ? "border-amber-300 bg-amber-50/60 shadow-md scale-[1.01]"
                        : "border-transparent bg-gray-50 hover:bg-gray-100"
                    }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 text-lg">🏨</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {hotel.name}
                      </p>
                      {hotel.address && (
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          📍 {hotel.address}
                        </p>
                      )}
                      {hotel.price && (
                        <span
                          className="mt-1 inline-block rounded-full
                          bg-amber-100 px-2 py-0.5 text-xs text-amber-700"
                        >
                          💰 {hotel.price}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Itinerary by Day */}
      {itinerary?.map((day) => (
        <div key={day.day}>
          <div className="mb-3 flex items-center gap-2 px-1">
            <span
              className={`${DAY_BADGE_COLORS[(day.day - 1) % DAY_BADGE_COLORS.length]}
              rounded-full px-3 py-1 text-xs font-bold text-white`}
            >
              วันที่ {day.day}
            </span>
            <span className="truncate text-sm font-medium text-gray-600">
              {day.theme}
            </span>
          </div>
          <div className="space-y-2">
            {day.places?.map((place, pIdx) => {
              const markerId = `day${day.day}-place${pIdx}`;
              const isActive = activeMarkerId === markerId;
              const colorClass =
                DAY_COLORS[(day.day - 1) % DAY_COLORS.length];
              return (
                <button
                  key={pIdx}
                  ref={isActive ? activeRef : undefined}
                  onClick={() => onPlaceClick(markerId)}
                  className={`w-full rounded-xl border p-3
                    text-left transition-all duration-200
                    ${
                      isActive
                        ? `${colorClass} shadow-md scale-[1.01]`
                        : "border-transparent bg-gray-50 hover:bg-gray-100"
                    }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 text-base">📍</span>
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-semibold text-gray-800">
                        {place.name}
                      </p>
                      {place.details && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                          {place.details}
                        </p>
                      )}
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {place.ticketPrice && (
                          <span
                            className="rounded-full bg-gray-100
                            px-2 py-0.5 text-xs text-gray-600"
                          >
                            🎟️ {place.ticketPrice}
                          </span>
                        )}
                        {place.timeToVisit && (
                          <span
                            className="rounded-full bg-gray-100
                            px-2 py-0.5 text-xs text-gray-600"
                          >
                            ⏰ {place.timeToVisit}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
