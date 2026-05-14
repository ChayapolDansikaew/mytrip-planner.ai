export function getMapsUrl(
  name: string,
  coordinates?: { lat: number; lng: number } | null,
): string {
  if (coordinates?.lat && coordinates?.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
}
