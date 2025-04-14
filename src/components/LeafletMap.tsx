
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '../utils/algorithms';
import { createMarkerIcon, getBoundsForLocations, getMarkerColor, routeToPolyline, createRouteStyle } from '../utils/mapUtils';

// Fix Leaflet icon paths
// This is required because Leaflet's default marker icons use absolute URLs which don't work properly
// when compiled in some environments
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapProps {
  locations: Location[];
  route: Location[] | null;
  onMapClick: (latlng: [number, number]) => void;
  currentStepPath?: Location[];
  evaluatingEdge?: [Location, Location];
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  locations,
  route,
  onMapClick,
  currentStepPath,
  evaluatingEdge,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const currentStepLayerRef = useRef<L.Polyline | null>(null);
  const evaluatingEdgeLayerRef = useRef<L.Polyline | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Initialize map on component mount
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([40, -95], 4);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
      
      mapRef.current = map;
      
      // Add map click handler
      map.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      });
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onMapClick]);
  
  // Update markers when locations change
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Remove old markers that aren't in the locations array
    Object.keys(markersRef.current).forEach(id => {
      if (!locations.find(loc => loc.id === id)) {
        if (markersRef.current[id]) {
          markersRef.current[id].remove();
          delete markersRef.current[id];
        }
      }
    });
    
    // Add new markers and update existing ones
    locations.forEach((location, index) => {
      const marker = markersRef.current[location.id];
      const color = getMarkerColor(index, locations.length);
      
      if (marker) {
        // Update existing marker position and popup
        marker.setLatLng(location.position);
        marker.bindPopup(`<b>${location.name}</b><br>Stop #${index + 1}`);
      } else {
        // Create new marker
        const icon = createMarkerIcon(color);
        const newMarker = L.marker(location.position, { icon })
          .bindPopup(`<b>${location.name}</b><br>Stop #${index + 1}`)
          .addTo(mapRef.current!);
        
        markersRef.current[location.id] = newMarker;
      }
    });
    
    // Fit bounds if we have locations
    const bounds = getBoundsForLocations(locations);
    if (bounds && mapRef.current) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations]);
  
  // Update route visualization when route changes
  useEffect(() => {
    // Remove old route
    if (routeLayerRef.current && mapRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
    
    // Add new route if available
    if (route && route.length > 1 && mapRef.current) {
      const polyline = L.polyline(routeToPolyline(route), createRouteStyle('#3388ff', 4))
        .addTo(mapRef.current);
      
      routeLayerRef.current = polyline;
    }
  }, [route]);
  
  // Update current step path visualization
  useEffect(() => {
    // Remove old step path
    if (currentStepLayerRef.current && mapRef.current) {
      currentStepLayerRef.current.remove();
      currentStepLayerRef.current = null;
    }
    
    // Add new step path if available
    if (currentStepPath && currentStepPath.length > 1 && mapRef.current && !route) {
      const polyline = L.polyline(routeToPolyline(currentStepPath), createRouteStyle('#ff7800', 3))
        .addTo(mapRef.current);
      
      currentStepLayerRef.current = polyline;
    }
  }, [currentStepPath, route]);
  
  // Update evaluating edge visualization
  useEffect(() => {
    // Remove old edge
    if (evaluatingEdgeLayerRef.current && mapRef.current) {
      evaluatingEdgeLayerRef.current.remove();
      evaluatingEdgeLayerRef.current = null;
    }
    
    // Add new edge if available
    if (evaluatingEdge && mapRef.current) {
      const [from, to] = evaluatingEdge;
      const polyline = L.polyline(
        [[from.position[0], from.position[1]], [to.position[0], to.position[1]]],
        { color: '#ff3300', weight: 2, dashArray: '5, 10', opacity: 0.6 }
      ).addTo(mapRef.current);
      
      evaluatingEdgeLayerRef.current = polyline;
    }
  }, [evaluatingEdge]);

  return (
    <div ref={mapContainerRef} className="h-full w-full rounded-lg shadow-lg" />
  );
};

export default LeafletMap;
