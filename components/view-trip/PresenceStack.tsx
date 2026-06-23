"use client";

import { useEffect, useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import type { Id } from "@/convex/_generated/dataModel";

interface PresenceStackProps {
  tripId: string;
}

export default function PresenceStack({ tripId }: PresenceStackProps) {
  const { user, isLoaded } = useUser();
  const updatePresence = useMutation(api.presence.updatePresence);
  const activeUsers = useQuery(api.presence.getPresence, { tripId: tripId as Id<"trips"> });
  const prevUsersRef = useRef<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  // 1. ส่ง Heartbeat ทุกๆ 5 วินาที
  useEffect(() => {
    if (!isLoaded || !user) return;

    const sendHeartbeat = () => {
      updatePresence({
        tripId: tripId as Id<"trips">,
        name: user.fullName || user.username || "เพื่อนนักเดินทาง",
        imageUrl: user.imageUrl || undefined,
      }).catch((err) => console.error("Heartbeat error:", err));
    };

    // ส่งทันที
    sendHeartbeat();

    const interval = setInterval(sendHeartbeat, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [isLoaded, user, tripId, updatePresence]);

  // 2. แสดง Toast เมื่อมีคนเข้าหรือออก
  useEffect(() => {
    if (!activeUsers) return;

    const currentIds = activeUsers.map((u) => u.userId);
    const currentNames = activeUsers.reduce(
      (acc, u) => {
        acc[u.userId] = u.name;
        return acc;
      },
      {} as Record<string, string>
    );

    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevUsersRef.current = currentIds;
      return;
    }

    const prevUsers = prevUsersRef.current;

    // เช็คคนเข้าใหม่ (ยกเว้นตัวเอง)
    if (user?.id) {
      const joined = currentIds.filter((id) => !prevUsers.includes(id) && id !== user.id);
      const left = prevUsers.filter((id) => !currentIds.includes(id) && id !== user.id);

      if (joined.length > 0) {
        const joinerName = currentNames[joined[0]] || "เพื่อนนักเดินทาง";
        setToast(`🔔 ${joinerName} เข้าร่วมวางแผนการเดินทางแล้ว`);
        const timer = setTimeout(() => setToast(null), 3000);
        prevUsersRef.current = currentIds;
        return () => clearTimeout(timer);
      } else if (left.length > 0) {
        setToast(`🚪 มีผู้ออกจากหน้าวางแผนการท่องเที่ยว`);
        const timer = setTimeout(() => setToast(null), 3000);
        prevUsersRef.current = currentIds;
        return () => clearTimeout(timer);
      }
    }

    prevUsersRef.current = currentIds;
  }, [activeUsers, user?.id]);

  if (!activeUsers || activeUsers.length <= 1) return null; // ไม่แสดงอะไรเลยถ้ามีแค่เราคนเดียว

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2 overflow-hidden">
        {activeUsers.map((activeUser) => (
          <motion.div
            key={activeUser.userId}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="relative inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#081d33]"
            title={activeUser.name}
          >
            {activeUser.imageUrl ? (
              <img
                src={activeUser.imageUrl}
                alt={activeUser.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-cyan-500 text-xs font-semibold text-white">
                {activeUser.name.charAt(0)}
              </div>
            )}
            <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-1 ring-white" />
          </motion.div>
        ))}
      </div>

      {/* Toast แจ้งเตือนสถานะการเข้าร่วม */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 rounded-2xl bg-gray-900/90 px-4 py-3 text-sm font-semibold text-white shadow-xl backdrop-blur-md dark:bg-white/95 dark:text-[#0f3a64]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
