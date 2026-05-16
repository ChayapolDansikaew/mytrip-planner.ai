export default function TripCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/82 shadow-[0_18px_60px_rgba(15,58,100,0.12)] backdrop-blur">
      {/* Gradient cover skeleton with shimmer */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-slate-200 via-white to-slate-200">
        <div className="skeleton-shimmer absolute inset-0" />
        {/* Destination badge skeleton */}
        <div className="absolute bottom-3 left-3">
          <div className="relative h-6 w-28 overflow-hidden rounded-full bg-white/30">
            <div className="skeleton-shimmer absolute inset-0" />
          </div>
        </div>
      </div>

      {/* Card body skeleton */}
      <div className="space-y-3 p-4">
        {/* Title */}
        <div className="relative h-5 w-3/4 overflow-hidden rounded bg-slate-200">
          <div className="skeleton-shimmer absolute inset-0" />
        </div>
        {/* Destination */}
        <div className="relative h-4 w-1/2 overflow-hidden rounded bg-slate-200">
          <div className="skeleton-shimmer absolute inset-0" />
        </div>
        {/* Badges */}
        <div className="flex gap-2">
          {[16, 16, 16].map((w, i) => (
            <div key={i} className="relative h-6 w-16 overflow-hidden rounded-full bg-slate-200">
              <div className="skeleton-shimmer absolute inset-0" />
            </div>
          ))}
        </div>
        {/* Created date */}
        <div className="relative h-3 w-1/3 overflow-hidden rounded bg-slate-200">
          <div className="skeleton-shimmer absolute inset-0" />
        </div>
      </div>
    </div>
  );
}
