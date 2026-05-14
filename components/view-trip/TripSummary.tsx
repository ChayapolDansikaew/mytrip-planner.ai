"use client";

import type { TripData } from "@/types/trip";

interface TripSummaryProps {
  tripData: TripData;
}

function formatValue(value?: string | number | null, fallback = "-") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value);
}

export default function TripSummary({ tripData }: TripSummaryProps) {
  const summaryItems = [
    {
      icon: "📍",
      label: "ปลายทาง",
      value: formatValue(tripData.destination),
    },
    {
      icon: "📅",
      label: "ระยะเวลา",
      value: tripData.duration ? `${tripData.duration} วัน` : "-",
    },
    {
      icon: "💰",
      label: "งบประมาณ",
      value: formatValue(tripData.budget),
    },
    {
      icon: "👥",
      label: "ผู้เดินทาง",
      value: formatValue(tripData.travelers),
    },
    {
      icon: "🌤️",
      label: "ช่วงเวลาดีที่สุด",
      value: formatValue(tripData.bestTimeToVisit),
    },
  ];

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900">📊 สรุปทริป</h2>
      <div className="mt-6 grid auto-cols-[minmax(140px,1fr)] grid-flow-col gap-4 overflow-x-auto pb-2 md:grid-flow-row md:grid-cols-5 md:overflow-visible md:pb-0">
        {summaryItems.map((item) => (
          <article
            key={item.label}
            className="flex min-w-[140px] flex-col items-center gap-2 rounded-2xl bg-white p-5 text-center shadow-sm transition-all hover:shadow-md"
          >
            <span className="text-3xl">{item.icon}</span>
            <p className="text-xs font-medium text-gray-500">
              {item.label}
            </p>
            <p className="line-clamp-2 text-center text-sm font-bold text-gray-800">
              {item.value}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
