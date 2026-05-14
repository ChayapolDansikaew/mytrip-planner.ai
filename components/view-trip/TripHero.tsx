"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { TripData } from "@/types/trip";

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
      className={`relative flex h-72 w-full overflow-hidden bg-gradient-to-br ${gradient} text-white shadow-sm md:h-96`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/20" />
      <div className="absolute left-8 top-12 h-28 w-28 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute bottom-8 right-10 h-40 w-40 rounded-full bg-white/15 blur-3xl" />

      <button
        type="button"
        onClick={() => router.back()}
        className="absolute left-4 top-4 z-10 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur transition-all hover:bg-white/30 md:left-8 md:top-6"
      >
        ← กลับ
      </button>

      <button
        type="button"
        onClick={handleShare}
        className="absolute right-4 top-4 z-10 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur transition-all hover:bg-white/30 md:right-8 md:top-6"
      >
        🔗 แชร์
      </button>

      {copied ? (
        <div className="absolute right-4 top-16 z-20 rounded-full bg-gray-950/90 px-4 py-2 text-sm font-semibold text-white shadow-xl backdrop-blur md:right-8 md:top-20">
          ✅ คัดลอกลิงก์แล้ว!
        </div>
      ) : null}

      <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 pb-28 pt-16 text-center md:pb-32">
        <span className="text-6xl drop-shadow-lg md:text-7xl">✈️</span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-5 md:p-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="line-clamp-2 text-3xl font-bold text-white drop-shadow-sm md:text-5xl">
            {getDisplayValue(tripData.tripName, destination)}
          </h1>
          <p className="mt-2 text-lg font-medium text-white/80">
            📍 {destination}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">
              📅 {tripData.duration ? `${tripData.duration} วัน` : "-"}
            </span>
            <span className="rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">
              💰 {getDisplayValue(tripData.budget)}
            </span>
            <span className="rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur">
              👥 {getDisplayValue(tripData.travelers)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
