"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getGoogleMapsDirectionsUrl, getAppleMapsDirectionsUrl } from "@/lib/maps";
import { Navigation, ChevronDown, ExternalLink } from "lucide-react";

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
  variant?: "compact" | "full";
}

export function NavigateDropdown({
  name,
  coordinates,
  variant = "compact",
}: NavigateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isFullWidth = variant === "full";

  return (
    <div className={isFullWidth ? "w-full" : "inline-block"}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`
          group inline-flex items-center justify-center gap-1.5
          rounded-full border text-xs font-semibold
          cursor-pointer select-none
          transition-all duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1
          ${isFullWidth ? "w-full py-2.5 px-4 text-sm" : "px-3 py-1.5"}
          ${isOpen
            ? "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
            : "border-gray-200 bg-white text-blue-500 hover:border-blue-200 hover:bg-blue-50/60 dark:border-white/10 dark:bg-[#0f2e4f] dark:text-[#e3fafc] dark:hover:bg-[#143c66] dark:hover:border-white/20"
          }
        `}
        aria-label={`นำทางไปยัง ${name}`}
        aria-expanded={isOpen}
      >
        <Navigation className={`${isFullWidth ? "h-4 w-4" : "h-3.5 w-3.5"} transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`} />
        นำทาง
        <ChevronDown className={`h-3 w-3 opacity-50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Inline expand panel — no floating, no z-index issues */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className={`flex gap-2 ${isFullWidth ? "pt-3" : "pt-2"}`}>
              <a
                href={getGoogleMapsDirectionsUrl(name, coordinates)}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  group/link flex flex-1 items-center justify-center gap-2
                  rounded-lg border border-gray-150 bg-gray-50/80
                  text-xs font-medium text-gray-700
                  transition-all duration-200
                  hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600
                  dark:border-white/8 dark:bg-white/5 dark:text-[#e3fafc]/90
                  dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-300
                  ${isFullWidth ? "py-2.5 text-sm" : "py-2"}
                `}
              >
                <GoogleMapsIcon className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                Google Maps
                <ExternalLink className="h-3 w-3 opacity-0 transition-opacity duration-150 group-hover/link:opacity-50" />
              </a>
              <a
                href={getAppleMapsDirectionsUrl(name, coordinates)}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  group/link flex flex-1 items-center justify-center gap-2
                  rounded-lg border border-gray-150 bg-gray-50/80
                  text-xs font-medium text-gray-700
                  transition-all duration-200
                  hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900
                  dark:border-white/8 dark:bg-white/5 dark:text-[#e3fafc]/90
                  dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-[#e3fafc]
                  ${isFullWidth ? "py-2.5 text-sm" : "py-2"}
                `}
              >
                <AppleIcon className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
                Apple Maps
                <ExternalLink className="h-3 w-3 opacity-0 transition-opacity duration-150 group-hover/link:opacity-50" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
