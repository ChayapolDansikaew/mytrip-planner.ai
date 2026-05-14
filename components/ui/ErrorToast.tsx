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
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-sm font-medium text-white shadow-lg animate-slide-up">
      ❌ {message}
    </div>
  );
}
