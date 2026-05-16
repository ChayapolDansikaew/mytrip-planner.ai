"use client";

import Link from "next/link";
import { useMutation } from "convex/react";
import { Trash2 } from "lucide-react";

import type { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Trip = Doc<"trips">;

const gradients = [
  "from-pink-400 to-orange-400",
  "from-blue-400 to-cyan-400",
  "from-purple-400 to-pink-400",
  "from-green-400 to-teal-400",
  "from-yellow-400 to-orange-400",
  "from-indigo-400 to-purple-400",
];

const budgetLabels: Record<string, string> = {
  cheap: "ประหยัด",
  moderate: "กลาง",
  luxury: "หรูหรา",
};

const travelerLabels: Record<string, string> = {
  solo: "เดินทางคนเดียว",
  couple: "คู่รัก",
  family: "ครอบครัว",
  friends: "เพื่อน",
};

function getTripName(trip: Trip) {
  const tripData =
    trip.tripData && typeof trip.tripData === "object"
      ? (trip.tripData as { tripName?: unknown })
      : null;

  if (typeof tripData?.tripName === "string" && tripData.tripName.trim()) {
    return tripData.tripName;
  }

  return trip.destination;
}

function getDisplayLabel(value: string | undefined, labels: Record<string, string>) {
  if (!value) {
    return null;
  }

  return labels[value] ?? value;
}

export default function TripCard({ trip }: { trip: Trip }) {
  const deleteTrip = useMutation(api.trips.deleteTrip);

  const tripName = getTripName(trip);
  const createdAt = new Date(trip._creationTime).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const destinationInitial = trip.destination.trim().charAt(0).toUpperCase() || "✈";
  const gradientIndex = destinationInitial.charCodeAt(0) % gradients.length;
  const budgetLabel = getDisplayLabel(trip.budget, budgetLabels);
  const travelerLabel = getDisplayLabel(trip.travelers, travelerLabels);

  async function handleDelete() {
    await deleteTrip({ tripId: trip._id });
  }

  return (
    <Link href={`/view-trip/${trip._id}`} className="group block focus:outline-none">
      <article className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/82 shadow-[0_18px_60px_rgba(15,58,100,0.12)] backdrop-blur transition-all duration-300 group-hover:shadow-[0_28px_90px_rgba(15,58,100,0.2)] group-focus-visible:ring-4 group-focus-visible:ring-[#ff3f78]/25">
        {/* Gradient cover */}
        <div
          className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${gradients[gradientIndex]}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(255,255,255,0.36),transparent_28%),radial-gradient(circle_at_82%_80%,rgba(255,255,255,0.22),transparent_26%)]" />
          <span className="relative text-6xl font-bold text-white/45">
            {destinationInitial}
          </span>
          <div className="absolute bottom-3 left-3 right-3 flex justify-start">
            <span className="max-w-full truncate rounded-full bg-white/22 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur">
              ✈️ {trip.destination}
            </span>
          </div>

          {/* Delete button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 h-9 w-9 rounded-full bg-black/30 text-white opacity-0 transition-all hover:bg-red-500 group-hover:opacity-100"
                onClick={(e) => e.preventDefault()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>ลบทริปนี้?</AlertDialogTitle>
                <AlertDialogDescription>
                  การกระทำนี้ไม่สามารถย้อนกลับได้ ทริป &ldquo;{tripName}&rdquo;
                  จะถูกลบอย่างถาวร
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 shadow-[0_18px_60px_rgba(239,68,68,0.3)] hover:bg-red-600"
                  onClick={handleDelete}
                >
                  ลบทริป
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Card body */}
        <div className="space-y-3 p-4">
          <h3 className="truncate text-lg font-bold tracking-[-0.025em] text-[#0f3a64]">
            {tripName}
          </h3>

          <p className="flex items-center gap-1 text-sm text-[#0f3a64]/58">
            <span>📍</span>
            <span className="truncate">{trip.destination}</span>
          </p>

          <div className="flex flex-wrap gap-2">
            {trip.duration ? (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                📅 {trip.duration} วัน
              </span>
            ) : null}
            {budgetLabel ? (
              <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                💰 {budgetLabel}
              </span>
            ) : null}
            {travelerLabel ? (
              <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-600">
                👥 {travelerLabel}
              </span>
            ) : null}
          </div>

          <p className="pt-1 text-xs text-[#0f3a64]/42">สร้างเมื่อ {createdAt}</p>
        </div>
      </article>
    </Link>
  );
}
