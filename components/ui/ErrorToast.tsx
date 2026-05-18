"use client";

import { useEffect } from "react";

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
    <div
      role="alert"
      className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-start gap-3 rounded-3xl border border-red-200 bg-white px-5 py-4 text-left text-sm text-red-700 shadow-[0_24px_80px_rgba(220,38,38,0.18)] animate-slide-up"
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
        ❌
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">สร้างทริปไม่สำเร็จ</p>
        <p className="mt-1 leading-6">{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full px-2 text-lg leading-none text-red-400 transition hover:bg-red-50 hover:text-red-600"
        aria-label="ปิดข้อความแจ้งเตือน"
      >
        ×
      </button>
    </div>
  );
}
