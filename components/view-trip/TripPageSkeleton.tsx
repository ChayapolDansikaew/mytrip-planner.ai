"use client";

export default function TripPageSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-gray-50">
      <div className="h-72 w-full bg-gray-300 md:h-96" />

      <div className="mx-auto max-w-5xl space-y-14 px-4 py-10">
        <div className="flex gap-4 overflow-x-auto">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-28 min-w-[140px] rounded-2xl bg-gray-200"
            />
          ))}
        </div>

        <div>
          <div className="mb-6 h-8 w-48 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-64 rounded-2xl bg-gray-200"
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-6 h-8 w-64 rounded bg-gray-200" />
          {Array.from({ length: 3 }).map((_, dayIndex) => (
            <div key={dayIndex} className="mb-8 space-y-3">
              <div className="h-6 w-32 rounded-full bg-gray-200" />
              {Array.from({ length: 3 }).map((_, placeIndex) => (
                <div
                  key={placeIndex}
                  className="h-28 rounded-xl bg-gray-200"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
