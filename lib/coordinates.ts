import { TripData } from "@/types/trip";

/**
 * Extract coordinates from tripData.
 * Tries the first hotel, then falls back to the first itinerary place.
 * Returns [lng, lat] for Mapbox or null if nothing is found.
 */
export function extractTripCoordinates(
  tripData: TripData,
): [number, number] | null {
  // Try first hotel coordinates
  const firstHotel = tripData?.hotels?.[0];
  if (firstHotel?.coordinates?.lat && firstHotel?.coordinates?.lng) {
    return [firstHotel.coordinates.lng, firstHotel.coordinates.lat];
  }

  // Try first itinerary place coordinates
  const firstPlace = tripData?.itinerary?.[0]?.places?.[0];
  if (firstPlace?.coordinates?.lat && firstPlace?.coordinates?.lng) {
    return [firstPlace.coordinates.lng, firstPlace.coordinates.lat];
  }

  return null;
}

/**
 * Geocode a destination name using the Mapbox Geocoding API.
 * Returns [lng, lat] for Mapbox or null on failure.
 */
export async function geocodeDestination(
  destination: string,
): Promise<[number, number] | null> {
  try {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("NEXT_PUBLIC_MAPBOX_TOKEN is not set");
      return null;
    }

    const encoded = encodeURIComponent(destination);
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json` +
        `?access_token=${token}&limit=1&types=place,country,region`,
    );
    const data = await res.json();
    const coords = data?.features?.[0]?.center;
    if (coords && coords.length === 2) {
      return [coords[0], coords[1]]; // [lng, lat]
    }
  } catch (e) {
    console.error("Geocoding error:", e);
  }
  return null;
}
