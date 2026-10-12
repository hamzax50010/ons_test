/**
 * Distance and matching utilities for ONS Healthcare
 * Calculates straight line geographic distance (Haversine formula in km)
 * and ranks candidates by qualification, coverage area, and proximity.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Calculates haversine distance in kilometers between two geographic coordinates
 */
export function calculateDistanceKm(coord1: LatLng, coord2: LatLng): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const lat1 = (coord1.lat * Math.PI) / 180;
  const lat2 = (coord2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

/**
 * Estimated travel time in minutes based on Cairo / Giza city transit (~25 km/h average traffic)
 */
export function estimateDriveMinutes(distanceKm: number): number {
  const speedKmH = 28;
  const minutes = Math.round((distanceKm / speedKmH) * 60) + 10; // 10 min prep buffer
  return Math.max(15, minutes);
}
