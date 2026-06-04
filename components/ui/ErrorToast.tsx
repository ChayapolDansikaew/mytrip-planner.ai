"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

const motionEase = [0.22, 1, 0.36, 1] as const;

export default function ErrorToast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ duration: 0.35, ease: motionEase }}
      className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-start gap-3 rounded-3xl border border-red-200 bg-white px-5 py-4 text-left text-sm text-red-700 shadow-[0_24px_80px_rgba(220,38,38,0.18)] dark:border-red-500/20 dark:bg-[#1a1020] dark:text-red-300 dark:shadow-[0_24px_80px_rgba(220,38,38,0.12)]"
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-base dark:bg-red-500/15">
        😅
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">อุ๊ปส์! เกิดข้อผิดพลาด</p>
        <p className="mt-1 leading-6 text-red-600/85 dark:text-red-300/80">{message}</p>
        <p className="mt-1.5 text-xs text-red-500/60 dark:text-red-400/50">ลองกดสร้างทริปอีกครั้งนะ</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full px-2 text-lg leading-none text-red-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
        aria-label="ปิดข้อความแจ้งเตือน"
      >
        ×
      </button>
    </motion.div>
  );
}
