"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Mapbox GL initialization will set the access token inside useEffect

export interface TripMarker {
  tripId: string;
  tripName: string;
  destination: string;
  duration?: number;
  budget?: string;
  travelers?: string;
  coordinates: [number, number]; // [lng, lat]
}

interface GlobeMapProps {
  trips: TripMarker[];
  onTripClick?: (tripId: string) => void;
}

export default function GlobeMap({ trips, onTripClick }: GlobeMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const animationRef = useRef<number>(0);
  const isUserInteracting = useRef(false);

  // Rotate one frame — slowly spins the globe eastwards on its axis
  const rotateFrame = useCallback(() => {
    if (!map.current || isUserInteracting.current) return;
    
    // Only auto-rotate if zoomed out (viewing the whole globe)
    if (map.current.getZoom() > 3) return;

    const center = map.current.getCenter();
    map.current.jumpTo({
      center: [center.lng - 0.15, center.lat],
    });
  }, []);

  // Start continuous rotation loop
  const startRotation = useCallback(() => {
    const tick = () => {
      rotateFrame();
      animationRef.current = requestAnimationFrame(tick);
    };
    animationRef.current = requestAnimationFrame(tick);
  }, [rotateFrame]);

  // Stop rotation
  const stopRotation = useCallback(() => {
    cancelAnimationFrame(animationRef.current);
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      projection: "globe",
      zoom: 1.5,
      center: [100.5, 13.7], // Default center on Bangkok
      pitch: 23.5, // 23.5 degrees physical globe tilt
      bearing: 0,
      dragRotate: false, // Lock stand (disable right-click rotation)
      touchPitch: false, // Lock stand (disable touch pitch modification)
    });

    map.current.on("load", () => {
      if (!map.current) return;

      // Atmosphere & fog for 3D globe effect
      map.current.setFog({
        color: "rgb(186, 210, 235)",
        "high-color": "rgb(36, 92, 223)",
        "horizon-blend": 0.02,
        "space-color": "rgb(11, 11, 25)",
        "star-intensity": 0.8,
      });

      // Start auto-rotation
      startRotation();
    });

    let idleTimeout: NodeJS.Timeout;

    // Pause rotation on user interaction
    const pauseRotation = () => {
      isUserInteracting.current = true;
      stopRotation();
      if (idleTimeout) clearTimeout(idleTimeout);
    };

    const resumeRotation = () => {
      isUserInteracting.current = false;
      if (idleTimeout) clearTimeout(idleTimeout);
      
      // Resume slow auto-spin after 6 seconds of inactivity
      idleTimeout = setTimeout(() => {
        if (!isUserInteracting.current) {
          startRotation();
        }
      }, 6000);
    };

    map.current.on("mousedown", pauseRotation);
    map.current.on("mouseup", resumeRotation);
    map.current.on("touchstart", pauseRotation);
    map.current.on("touchend", resumeRotation);

    return () => {
      if (idleTimeout) clearTimeout(idleTimeout);
      stopRotation();
      map.current?.remove();
      map.current = null;
    };
  }, [startRotation, stopRotation]);

  // Add markers when trips change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    trips.forEach((trip) => {
      if (
        !trip.coordinates ||
        !trip.coordinates[0] ||
        !trip.coordinates[1]
      )
        return;

      // Custom marker element
      const el = document.createElement("div");
      el.className = "globe-trip-marker";
      el.innerHTML = `
        <div class="globe-marker-pin">
          <span class="globe-marker-icon">✈️</span>
          <span class="globe-marker-pulse"></span>
        </div>
      `;

      // Popup content element
      const popupEl = document.createElement("div");
      popupEl.className = "trip-popup-inner";
      popupEl.innerHTML = `
        <div class="trip-popup-title">
          ${trip.tripName ?? trip.destination}
        </div>
        <div class="trip-popup-destination">
          📍 ${trip.destination}
        </div>
        <div class="trip-popup-badges">
          ${
            trip.duration
              ? `<span class="trip-badge trip-badge-blue">📅 ${trip.duration} วัน</span>`
              : ""
          }
          ${
            trip.budget
              ? `<span class="trip-badge trip-badge-green">💰 ${trip.budget}</span>`
              : ""
          }
          ${
            trip.travelers
              ? `<span class="trip-badge trip-badge-purple">👥 ${trip.travelers}</span>`
              : ""
          }
        </div>
      `;

      // Create click listener for view trip button using Next.js routing instead of hard refresh
      const viewBtn = document.createElement("button");
      viewBtn.className = "trip-popup-button";
      viewBtn.textContent = "ดูทริปนี้ →";
      viewBtn.addEventListener("click", () => {
        onTripClick?.(trip.tripId);
      });
      popupEl.appendChild(viewBtn);

      const popup = new mapboxgl.Popup({
        offset: 30,
        closeButton: true,
        className: "trip-popup",
        maxWidth: "280px",
      }).setDOMContent(popupEl);

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(trip.coordinates)
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);

      el.addEventListener("click", () => {
        // Fly to marker with smooth animation
        map.current?.flyTo({
          center: trip.coordinates,
          zoom: 4,
          pitch: 45,
          bearing: 0,
          duration: 2000,
          essential: true,
        });
      });
    });
  }, [trips, onTripClick]);

  return (
    <div className="absolute inset-3 sm:inset-4">
      <div ref={mapContainer} className="h-full w-full rounded-2xl" />
    </div>
  );
}
