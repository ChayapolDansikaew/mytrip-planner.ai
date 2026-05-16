"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

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

  // Rotate one frame — reads refs directly, no circular dependency
  const rotateFrame = useCallback(() => {
    if (!map.current || isUserInteracting.current) return;
    map.current.easeTo({
      bearing: map.current.getBearing() + 0.3,
      duration: 100,
      easing: (t: number) => t,
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

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      projection: "globe",
      zoom: 1.5,
      center: [100.5, 13.7], // Default center on Bangkok
      pitch: 0,
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

    // Pause rotation on user interaction
    const pauseRotation = () => {
      isUserInteracting.current = true;
      stopRotation();
    };
    const resumeRotation = () => {
      isUserInteracting.current = false;
      startRotation();
    };

    map.current.on("mousedown", pauseRotation);
    map.current.on("mouseup", resumeRotation);
    map.current.on("touchstart", pauseRotation);
    map.current.on("touchend", resumeRotation);

    return () => {
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

      // Popup content
      const popup = new mapboxgl.Popup({
        offset: 30,
        closeButton: true,
        className: "trip-popup",
        maxWidth: "280px",
      }).setHTML(`
        <div class="trip-popup-inner">
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
          <button 
            onclick="window.location.href='/view-trip/${trip.tripId}'"
            class="trip-popup-button">
            ดูทริปนี้ →
          </button>
        </div>
      `);

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
        onTripClick?.(trip.tripId);
      });
    });
  }, [trips, onTripClick]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full rounded-2xl" />
    </div>
  );
}
