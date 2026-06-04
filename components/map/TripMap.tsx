"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { TripHotel, TripDay } from "@/types/trip";

// Mapbox GL initialization will set the access token inside useEffect

// Day color palette — matches Itinerary.tsx day badge colors
const DAY_COLORS = [
  "#ec4899", // pink-500
  "#3b82f6", // blue-500
  "#a855f7", // purple-500
  "#22c55e", // green-500
  "#f97316", // orange-500
  "#14b8a6", // teal-500
];

export interface MapMarker {
  id: string;
  type: "hotel" | "place";
  name: string;
  description?: string;
  coordinates: [number, number]; // [lng, lat]
  day?: number;
  extra?: string; // price for hotel, ticketPrice for place
}

interface TripMapProps {
  hotels: TripHotel[];
  itinerary: TripDay[];
  activeMarkerId?: string | null;
  onMarkerClick?: (markerId: string) => void;
}

export default function TripMap({
  hotels,
  itinerary,
  activeMarkerId,
  onMarkerClick,
}: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const popupsRef = useRef<Map<string, mapboxgl.Popup>>(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Monitor document theme class changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialDark = document.documentElement.classList.contains("dark");
    const timer = setTimeout(() => {
      setIsDark(initialDark);
    }, 0);

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // Update map style dynamically
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const styleUrl = isDark
      ? "mapbox://styles/mapbox/dark-v11"
      : "mapbox://styles/mapbox/streets-v12";

    map.current.setStyle(styleUrl);
  }, [isDark, mapLoaded]);

  // Stable callback ref so marker effect doesn't re-run
  const onMarkerClickRef = useRef(onMarkerClick);
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    const initialDark = document.documentElement.classList.contains("dark");

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: initialDark
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/streets-v12",
      zoom: 10,
      center: [100.5, 13.7], // Default to Bangkok
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right",
    );
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

    map.current.on("load", () => setMapLoaded(true));

    const currentMarkers = markersRef.current;
    const currentPopups = popupsRef.current;

    return () => {
      currentMarkers.forEach((m) => m.remove());
      currentMarkers.clear();
      currentPopups.clear();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Build markers list
  const buildMarkers = useCallback((): MapMarker[] => {
    const allMarkers: MapMarker[] = [];

    hotels?.forEach((hotel, idx) => {
      if (!hotel.coordinates?.lat || !hotel.coordinates?.lng) return;
      allMarkers.push({
        id: `hotel-${idx}`,
        type: "hotel",
        name: hotel.name,
        description: hotel.address,
        coordinates: [hotel.coordinates.lng, hotel.coordinates.lat],
        extra: hotel.price,
      });
    });

    itinerary?.forEach((day) => {
      day.places?.forEach((place, pIdx) => {
        if (!place.coordinates?.lat || !place.coordinates?.lng) return;
        allMarkers.push({
          id: `day${day.day}-place${pIdx}`,
          type: "place",
          name: place.name,
          description: place.details,
          coordinates: [place.coordinates.lng, place.coordinates.lat],
          day: day.day,
          extra: place.ticketPrice,
        });
      });
    });

    return allMarkers;
  }, [hotels, itinerary]);

  // Add markers when map is loaded + data changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();
    popupsRef.current.clear();

    const allMarkers = buildMarkers();
    const bounds = new mapboxgl.LngLatBounds();
    let hasValidCoords = false;

    allMarkers.forEach((marker) => {
      const isHotel = marker.type === "hotel";
      const dayColor = marker.day
        ? DAY_COLORS[(marker.day - 1) % DAY_COLORS.length]
        : "#6b7280";

      // Marker element
      const el = document.createElement("div");
      el.id = `marker-${marker.id}`;
      el.className = "trip-marker-element";
      el.innerHTML = isHotel
        ? `<div class="trip-marker-inner trip-marker-hotel">🏨</div>`
        : `<div class="trip-marker-inner trip-marker-place" style="background:${dayColor}">${marker.day}</div>`;

      // Popup
      const popup = new mapboxgl.Popup({
        offset: 20,
        closeButton: true,
        maxWidth: "260px",
        className: "trip-place-popup",
      }).setHTML(`
        <div style="padding:4px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <span>${isHotel ? "🏨" : `📍 วันที่ ${marker.day}`}</span>
            <span style="font-size:11px;color:#6b7280">
              ${isHotel ? "โรงแรม" : "สถานที่"}
            </span>
          </div>
          <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:#1f2937;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
            ${marker.name}
          </div>
          ${
            marker.description
              ? `<div style="font-size:12px;color:#6b7280;margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
              ${marker.description}
            </div>`
              : ""
          }
          ${
            marker.extra
              ? `<span style="display:inline-block;background:${isHotel ? "#fef3c7" : "#f0fdf4"};color:${isHotel ? "#92400e" : "#166534"};font-size:11px;padding:2px 8px;border-radius:999px;font-weight:600">
              ${isHotel ? "💰" : "🎟️"} ${marker.extra}
            </span>`
              : ""
          }
          <a href="https://www.google.com/maps/search/?api=1&query=${marker.coordinates[1]},${marker.coordinates[0]}"
            target="_blank" rel="noopener noreferrer"
            style="display:block;margin-top:8px;text-align:center;background:#ec4899;color:white;font-size:12px;font-weight:600;padding:6px 12px;border-radius:999px;text-decoration:none;transition:opacity 0.2s"
            onmouseover="this.style.opacity='0.85'"
            onmouseout="this.style.opacity='1'">
            🗺️ เปิด Google Maps
          </a>
        </div>
      `);

      const mapboxMarker = new mapboxgl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat(marker.coordinates)
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener("click", () => {
        // Close other popups
        popupsRef.current.forEach((p) => p.remove());

        map.current?.flyTo({
          center: marker.coordinates,
          zoom: 14,
          duration: 1200,
          essential: true,
        });

        onMarkerClickRef.current?.(marker.id);
        popup.addTo(map.current!);
      });

      markersRef.current.set(marker.id, mapboxMarker);
      popupsRef.current.set(marker.id, popup);

      bounds.extend(marker.coordinates);
      hasValidCoords = true;
    });

    // Fit map to show all markers
    if (hasValidCoords && allMarkers.length > 0) {
      map.current.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        maxZoom: 13,
        duration: 1500,
      });
    }
  }, [mapLoaded, buildMarkers]);

  // Highlight active marker
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement();
      const inner = el.querySelector(".trip-marker-inner") as HTMLElement;
      if (!inner) return;

      if (id === activeMarkerId) {
        inner.style.transform = "scale(1.35)";
        inner.style.zIndex = "10";

        // Open popup for active marker
        const popup = popupsRef.current.get(id);
        if (popup && map.current) {
          popupsRef.current.forEach((p) => p.remove());
          popup.addTo(map.current);
          map.current.flyTo({
            center: marker.getLngLat(),
            zoom: 14,
            duration: 1000,
          });
        }
      } else {
        inner.style.transform = "scale(1)";
        inner.style.zIndex = "0";
      }
    });
  }, [activeMarkerId]);

  return (
    <div className="relative h-full min-h-[400px] w-full">
      <div ref={mapContainer} className="h-full w-full rounded-2xl" />

      {/* Map Legend */}
      <div
        className="pointer-events-none absolute bottom-4 left-4 space-y-1.5
        rounded-xl bg-white/90 p-3 text-xs font-medium shadow-lg backdrop-blur-sm
        dark:bg-[#0a233d]/90 dark:shadow-none"
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center
            rounded-full bg-amber-400 text-xs shadow"
          >
            🏨
          </div>
          <span className="text-gray-700 dark:text-[#e3fafc]">โรงแรมแนะนำ</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center
            rounded-full bg-pink-500 text-xs font-semibold text-white shadow"
          >
            1
          </div>
          <span className="text-gray-700 dark:text-[#e3fafc]">สถานที่ตามวัน</span>
        </div>
      </div>
    </div>
  );
}
