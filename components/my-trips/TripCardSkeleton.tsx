export default function TripCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/82 shadow-[0_18px_60px_rgba(15,58,100,0.12)] backdrop-blur">
      <div className="h-44 animate-pulse bg-gradient-to-br from-slate-200 via-white to-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}
