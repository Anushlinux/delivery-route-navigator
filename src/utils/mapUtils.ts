
import L from "leaflet";
import { Location } from "./algorithms";

// Generate a unique ID for locations
export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Create a custom icon for markers
export function createMarkerIcon(color: string = "blue"): L.Icon {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

// Get marker color based on index/role
export function getMarkerColor(index: number, total: number): string {
  if (index === 0) return "green"; // Starting point
  if (index === total - 1) return "red"; // Last point (if not returning to start)
  return "blue"; // Regular stops
}

// Format the distance in a user-friendly way
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(2)} km`;
}

// Geocoding function using OpenStreetMap Nominatim API
export async function geocodeAddress(address: string): Promise<[number, number] | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`);
    const data = await response.json();
    
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return [parseFloat(lat), parseFloat(lon)];
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Reverse geocoding to get address from coordinates
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }
    return null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

// Create polyline options for route visualization
export function createRouteStyle(color: string = "#3388ff", weight: number = 4): L.PolylineOptions {
  return {
    color,
    weight,
    opacity: 0.7,
    lineJoin: "round",
  };
}

// Convert route path to polyline points
export function routeToPolyline(route: Location[]): L.LatLngExpression[] {
  return route.map(location => [location.position[0], location.position[1]]);
}

// Calculate map bounds to fit all markers
export function getBoundsForLocations(locations: Location[]): L.LatLngBounds | null {
  if (locations.length === 0) return null;
  
  const bounds = L.latLngBounds([locations[0].position]);
  
  for (let i = 1; i < locations.length; i++) {
    bounds.extend(locations[i].position);
  }
  
  return bounds;
}
