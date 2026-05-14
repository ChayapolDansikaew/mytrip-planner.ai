"use client";

import { getMapsUrl } from "@/lib/maps";
import type { TripHotel } from "@/types/trip";

interface HotelListProps {
  hotels?: Partial<TripHotel>[] | null;
}

function renderStars(rating?: number | null) {
  const safeRating = Math.max(0, Math.min(5, rating ?? 0));
  const full = Math.floor(safeRating);
  const half = safeRating % 1 >= 0.5;

  return "⭐".repeat(full) + (half ? "✨" : "");
}

function getInitial(name?: string | null) {
  return (name?.trim().charAt(0) || "H").toUpperCase();
}

export default function HotelList({ hotels }: HotelListProps) {
  if (!hotels?.length) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-gray-900">🏨 โรงแรมแนะนำ</h2>
        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-gray-500 shadow-sm">
          ยังไม่มีข้อมูลโรงแรมแนะนำสำหรับทริปนี้
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900">🏨 โรงแรมแนะนำ</h2>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {hotels.map((hotel, index) => {
          const name = hotel.name || "-";
          const rating = hotel.rating;

          return (
            <article
              key={`${name}-${index}`}
              className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex h-40 items-center justify-center bg-gradient-to-br from-pink-400 via-cyan-400 to-lime-300 text-6xl font-black text-white">
                {getInitial(name)}
              </div>

              <div className="space-y-3 p-5">
                <div>
                  <h3 className="line-clamp-1 text-lg font-bold text-gray-900">
                    {name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm">{renderStars(rating)}</span>
                    <span className="text-sm text-gray-500">
                      {rating ? rating.toFixed(1) : "-"}
                    </span>
                  </div>
                </div>

                <p className="line-clamp-1 text-sm text-gray-500">
                  📍 {hotel.address || "-"}
                </p>

                <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-700">
                  💰 {hotel.price || "-"}
                </span>

                <p className="line-clamp-2 text-sm leading-6 text-gray-600">
                  {hotel.description || "-"}
                </p>

                <a
                  href={getMapsUrl(name, hotel.coordinates)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-blue-500 transition-colors hover:border-pink-300 hover:text-blue-700"
                >
                  🗺️ ดูบน Google Maps
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
