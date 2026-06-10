"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TripData } from "@/types/trip";
import { generateICS, downloadBlob } from "@/lib/export";
import { pressTap, springSnappy } from "@/lib/motion";

interface TripActionsProps {
  tripData: TripData;
}

export default function TripActions({ tripData }: TripActionsProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "warning" } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    }
    
    if (showDatePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDatePicker]);

  const showToast = (text: string, type: "success" | "error" | "warning" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSyncCalendar = () => {
    if (!startDate) {
      showToast("กรุณาเลือกวันเริ่มต้นเดินทาง", "warning");
      return;
    }
    try {
      const icsString = generateICS(tripData, startDate);
      downloadBlob(icsString, `${tripData.destination}-trip.ics`, "text/calendar;charset=utf-8");
      setShowDatePicker(false);
      showToast("ดาวน์โหลดไฟล์ปฏิทินสำเร็จ!", "success");
    } catch (error) {
      console.error("Failed to generate calendar file", error);
      showToast("เกิดข้อผิดพลาดในการสร้างไฟล์", "error");
    }
  };

  return (
    <section className="print:hidden mt-8 mb-4">
      <div className="flex flex-wrap items-center gap-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={pressTap}
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm border border-gray-200 transition-colors hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 dark:border-white/10 dark:bg-[#0a233d] dark:text-[#e3fafc] dark:hover:bg-[#112d4e]"
        >
          <span className="text-lg">📄</span> ดาวน์โหลด PDF
        </motion.button>

        <div className="relative" ref={popoverRef}>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={pressTap}
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
          >
            <span className="text-lg">📅</span> ซิงค์ปฏิทิน
          </motion.button>

          <AnimatePresence>
            {showDatePicker && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={springSnappy}
                className="absolute left-0 top-full mt-3 w-72 rounded-2xl border border-gray-200 bg-white p-5 shadow-xl z-50 dark:border-white/10 dark:bg-[#0a233d]"
              >
                <div className="flex flex-col gap-3">
                  <label htmlFor="startDate" className="text-sm font-medium text-gray-700 dark:text-[#e3fafc]">
                    เลือกวันเริ่มต้นเดินทาง:
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-white/20 dark:bg-[#081d33] dark:text-[#e3fafc]"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(false)}
                      className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={handleSyncCalendar}
                      className="flex-1 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-600"
                    >
                      ดาวน์โหลด .ics
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={springSnappy}
            className={`fixed right-4 top-24 z-[100] rounded-full px-4 py-2 text-sm font-semibold text-white shadow-xl backdrop-blur md:right-8 md:top-24 ${
              toastMessage.type === "error" ? "bg-red-500/90" : toastMessage.type === "warning" ? "bg-yellow-500/90" : "bg-gray-950/90"
            }`}
          >
            {toastMessage.type === "success" && "✅ "}
            {toastMessage.type === "error" && "❌ "}
            {toastMessage.type === "warning" && "⚠️ "}
            {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
