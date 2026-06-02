"use client";

import Link from "next/link";
import Image from "next/image";
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

function getDestinationImage(destination: string): string | null {
  const dest = destination.toLowerCase().trim();
  if (
    dest.includes("กรุงเทพ") ||
    dest.includes("bangkok") ||
    dest.includes("thailand") ||
    dest.includes("ไทย")
  ) {
    return "/images/bangkok.png";
  }
  if (
    dest.includes("ปารีส") ||
    dest.includes("paris") ||
    dest.includes("ฝรั่งเศส") ||
    dest.includes("france")
  ) {
    return "/images/paris.png";
  }
  if (
    dest.includes("โตเกียว") ||
    dest.includes("tokyo") ||
    dest.includes("ญี่ปุ่น") ||
    dest.includes("japan")
  ) {
    return "/images/tokyo.png";
  }
  if (
    dest.includes("นิวยอร์ก") ||
    dest.includes("new york") ||
    dest.includes("สหรัฐ") ||
    dest.includes("america") ||
    dest.includes("usa")
  ) {
    return "/images/new_york.png";
  }
  if (
    dest.includes("โรม") ||
    dest.includes("rome") ||
    dest.includes("อิตาลี") ||
    dest.includes("italy")
  ) {
    return "/images/rome.png";
  }
  return null;
}

export default function TripCard({ trip }: { trip: Trip }) {
  const deleteTrip = useMutation(api.trips.deleteTrip);

  const tripName = getTripName(trip);
  const createdAt = new Date(trip._creationTime).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const budgetLabel = getDisplayLabel(trip.budget, budgetLabels);
  const travelerLabel = getDisplayLabel(trip.travelers, travelerLabels);

  async function handleDelete() {
    await deleteTrip({ tripId: trip._id });
  }

  return (
    <Link href={`/view-trip/${trip._id}`} className="group block focus:outline-none">
      <article className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/82 shadow-[0_8px_24px_rgba(15,58,100,0.08),0_4px_0_rgba(15,58,100,0.06)] backdrop-blur transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_16px_36px_rgba(15,58,100,0.12),0_6px_0_rgba(15,58,100,0.08)] group-active:translate-y-0.5 group-active:shadow-[0_4px_12px_rgba(15,58,100,0.08),0_2px_0_rgba(15,58,100,0.06)] group-focus-visible:ring-4 group-focus-visible:ring-[#ff3f78]/25 dark:border-white/10 dark:bg-[#0a233d]/82 dark:shadow-[0_8px_24px_rgba(0,0,0,0.2),0_4px_0_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.3),0_6px_0_rgba(0,0,0,0.15)] dark:group-active:shadow-[0_4px_12px_rgba(0,0,0,0.2),0_2px_0_rgba(0,0,0,0.1)]">
        {/* Image cover with responsive zoom and text contrast gradient */}
        <div className="relative flex h-44 items-center justify-center overflow-hidden bg-slate-900">
          <Image
            src={getDestinationImage(trip.destination) || "/images/default_travel.png"}
            alt={trip.destination}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 360px"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f3a64]/10 via-transparent to-[#0f3a64]/65 group-hover:to-[#0f3a64]/75 dark:from-black/10 dark:to-black/75 dark:group-hover:to-black/85 transition-all duration-300" />
          
          <div className="absolute bottom-3 left-3 right-3 flex justify-start">
            <span className="max-w-full truncate rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-[#0a233d]/50">
              ✈️ {trip.destination}
            </span>
          </div>

          {/* Delete button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 h-9 w-9 rounded-full bg-black/30 text-white opacity-0 transition-all duration-200 hover:bg-red-500 focus-visible:opacity-100 group-hover:opacity-100"
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
          <h3 className="truncate text-lg font-bold tracking-[-0.025em] text-[#0f3a64] dark:text-[#e3fafc]">
            {tripName}
          </h3>

          <p className="flex items-center gap-1 text-sm font-bold text-[#0f3a64]/58 dark:text-[#e3fafc]/58">
            <span>📍</span>
            <span className="truncate">{trip.destination}</span>
          </p>

          <div className="flex flex-wrap gap-2">
            {trip.duration ? (
              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600 backdrop-blur-sm dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400">
                📅 {trip.duration} วัน
              </span>
            ) : null}
            {budgetLabel ? (
              <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 backdrop-blur-sm dark:border-green-500/30 dark:bg-green-500/20 dark:text-green-400">
                💰 {budgetLabel}
              </span>
            ) : null}
            {travelerLabel ? (
              <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-600 backdrop-blur-sm dark:border-purple-500/30 dark:bg-purple-500/20 dark:text-purple-400">
                👥 {travelerLabel}
              </span>
            ) : null}
          </div>

          <p className="pt-1 text-xs text-[#0f3a64]/42 dark:text-[#e3fafc]/42">สร้างเมื่อ {createdAt}</p>
        </div>
      </article>
    </Link>
  );
}
