"use client";

export default function TripPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#081d33]">
      {/* Hero skeleton with shimmer */}
      <div className="relative h-72 w-full overflow-hidden bg-gray-300 md:h-96 dark:bg-[#0a233d]">
        <div className="skeleton-shimmer absolute inset-0" />
      </div>

      <div className="mx-auto max-w-5xl space-y-14 px-4 py-10">
        {/* Summary cards skeleton */}
        <div className="flex gap-4 overflow-x-auto">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="relative h-28 min-w-[140px] overflow-hidden rounded-2xl bg-gray-200 dark:bg-[#0f2e4f]/60"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="skeleton-shimmer absolute inset-0" />
            </div>
          ))}
        </div>

        {/* Hotels skeleton */}
        <div>
          <div className="relative mb-6 h-8 w-48 overflow-hidden rounded bg-gray-200 dark:bg-[#0f2e4f]/60">
            <div className="skeleton-shimmer absolute inset-0" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="relative h-64 overflow-hidden rounded-2xl bg-gray-200 dark:bg-[#0a233d]/60"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="skeleton-shimmer absolute inset-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Itinerary skeleton */}
        <div>
          <div className="relative mb-6 h-8 w-64 overflow-hidden rounded bg-gray-200 dark:bg-[#0f2e4f]/60">
            <div className="skeleton-shimmer absolute inset-0" />
          </div>
          {Array.from({ length: 3 }).map((_, dayIndex) => (
            <div key={dayIndex} className="mb-8 space-y-3">
              <div className="relative h-6 w-32 overflow-hidden rounded-full bg-gray-200 dark:bg-[#0f2e4f]/60">
                <div className="skeleton-shimmer absolute inset-0" />
              </div>
              {Array.from({ length: 3 }).map((_, placeIndex) => (
                <div
                  key={placeIndex}
                  className="relative h-28 overflow-hidden rounded-xl bg-gray-200 dark:bg-[#0a233d]/60"
                  style={{ animationDelay: `${(dayIndex * 3 + placeIndex) * 0.08}s` }}
                >
                  <div className="skeleton-shimmer absolute inset-0" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
