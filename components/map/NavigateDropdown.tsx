"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getGoogleMapsDirectionsUrl, getAppleMapsDirectionsUrl } from "@/lib/maps";
import { MapPin } from "lucide-react";

function GoogleMapsIcon({ className }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M11.984 0A8.932 8.932 0 0 0 3.06 8.905c0 4.195 2.502 7.822 5.534 11.234 1.157 1.306 2.41 2.536 3.425 3.86.353.46.903.415 1.25.04.811-1.285 2.05-2.428 3.018-3.642 3.123-3.67 6.643-7.234 6.643-11.492A8.948 8.948 0 0 0 11.984 0Zm.052 13.063a4.048 4.048 0 1 1 0-8.096 4.048 4.048 0 0 1 0 8.096Z"/>
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z"/>
    </svg>
  );
}

interface NavigateDropdownProps {
  name: string;
  coordinates?: { lat: number; lng: number } | null;
  className?: string;
  buttonClassName?: string;
  dropdownAlign?: "left" | "right" | "top";
}

export function NavigateDropdown({ 
  name, 
  coordinates, 
  className = "", 
  buttonClassName = "inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-500 transition-colors hover:bg-blue-50 hover:border-blue-200 focus:outline-none dark:border-white/10 dark:bg-[#0f2e4f] dark:text-[#e3fafc] dark:hover:bg-[#143c66] dark:hover:border-white/20",
  dropdownAlign = "left"
}: NavigateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const alignClass = dropdownAlign === "right" 
    ? "right-0 origin-top-right" 
    : dropdownAlign === "top" 
      ? "bottom-full left-0 origin-bottom-left mb-2" 
      : "left-0 origin-top-left";

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={buttonClassName}
        aria-label={`นำทางไปยัง ${name}`}
        aria-expanded={isOpen}
      >
        <MapPin className="h-3.5 w-3.5" />
        นำทาง
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: dropdownAlign === "top" ? 4 : -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropdownAlign === "top" ? 4 : -4, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute z-50 mt-2 w-48 rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl shadow-black/5 outline-none dark:border-white/10 dark:bg-[#0a233d] ${alignClass}`}
          >
            <div className="flex flex-col gap-1">
              <a
                href={getGoogleMapsDirectionsUrl(name, coordinates)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-[#e3fafc] dark:hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                <GoogleMapsIcon className="h-4 w-4 text-blue-500" />
                Google Maps
              </a>
              <a
                href={getAppleMapsDirectionsUrl(name, coordinates)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-[#e3fafc] dark:hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                <AppleIcon className="h-4 w-4 text-gray-800 dark:text-gray-200" />
                Apple Maps
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
