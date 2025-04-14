
import L from "leaflet";
import { Location } from "./algorithms";

// Generate a unique ID for locations
export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Create a custom icon for markers
export function createMarkerIcon(color: string = "blue"): L.Icon {
  const colors: Record<string, string> = {
    blue: "#3b82f6",
    green: "#22c55e", 
    red: "#ef4444",
    yellow: "#eab308",
    purple: "#a855f7",
    pink: "#ec4899",
    teal: "#14b8a6",
    orange: "#f97316",
    gray: "#6b7280",
  };
  
  // Create custom SVG marker
  const svgTemplate = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="40" viewBox="0 0 24 40">
      <filter id="shadow" x="-20%" y="0" width="140%" height="130%">
        <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
      </filter>
      <path 
        d="M12 0C5.383 0 0 5.383 0 12c0 3.912 1.854 7.388 4.715 9.606L12 40l7.285-18.394C22.146 19.388 24 15.912 24 12 24 5.383 18.617 0 12 0z" 
        fill="${colors[color] || color}"
        filter="url(#shadow)"
      />
      <circle cx="12" cy="12" r="5" fill="#ffffff" />
    </svg>
  `;
  
  // Create icon from SVG
  return L.divIcon({
    html: svgTemplate,
    className: 'custom-map-marker',
    iconSize: [24, 40],
    iconAnchor: [12, 40],
    popupAnchor: [0, -40],
  });
}

// Get marker color based on index/role
export function getMarkerColor(index: number, total: number): string {
  if (index === 0) return "green"; // Starting point
  if (index === total - 1) return "orange"; // Last stop before returning
  
  // For intermediate stops, use a variety of colors
  const colors = ["blue", "purple", "teal", "pink", "yellow"];
  return colors[index % colors.length];
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
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
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
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { "Accept-Language": "en" } }
    );
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
export function createRouteStyle(
  color: string = "#3388ff", 
  weight: number = 4,
  opacity: number = 0.7,
  dashArray?: string
): L.PolylineOptions {
  return {
    color,
    weight,
    opacity,
    lineJoin: "round",
    lineCap: "round",
    dashArray,
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
  
  // Add a little padding
  const paddedBounds = bounds.pad(0.1);
  
  return paddedBounds;
}
