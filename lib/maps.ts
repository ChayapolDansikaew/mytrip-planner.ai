export function getGoogleMapsDirectionsUrl(
  name: string,
  coordinates?: { lat: number; lng: number } | null,
): string {
  if (coordinates?.lat && coordinates?.lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(name)}`;
}

export function getAppleMapsDirectionsUrl(
  name: string,
  coordinates?: { lat: number; lng: number } | null,
): string {
  if (coordinates?.lat && coordinates?.lng) {
    return `http://maps.apple.com/?daddr=${coordinates.lat},${coordinates.lng}`;
  }
  return `http://maps.apple.com/?daddr=${encodeURIComponent(name)}`;
}
