import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '../utils/algorithms';
import { createMarkerIcon, getBoundsForLocations, getMarkerColor, routeToPolyline, createRouteStyle } from '../utils/mapUtils';

// Fix Leaflet icon paths
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
  
  // Initialize map on component mount with dark mode
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      // Set initial view to Mumbai
      const map = L.map(mapContainerRef.current).setView([19.076, 72.8777], 12);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20,
      }).addTo(map);
      
      mapRef.current = map;
      
      // Add map click handler
      map.on('click', (e: L.LeafletMouseEvent) => {
        // Create a creative ripple effect in the new color
        const ripple = L.divIcon({
          html: `<div class="ripple"></div>`,
          className: 'ripple-container',
          iconSize: [20, 20]
        });
        
        const rippleMark = L.marker(e.latlng, { icon: ripple })
          .addTo(map)
          .on('add', () => {
            setTimeout(() => {
              map.removeLayer(rippleMark);
            }, 800);
          });
        
        onMapClick([e.latlng.lat, e.latlng.lng]);
      });

      // Light style for ripple
      if (!document.getElementById('leaflet-ripple-style')) {
        const style = document.createElement('style');
        style.id = 'leaflet-ripple-style';
        style.innerHTML = `
          .ripple-container { background: transparent; }
          .ripple {
            position: absolute;
            width: 24px;
            height: 24px;
            background: rgba(85,178,255,0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: ripple-animation 0.8s cubic-bezier(0.28,0.85,0.42,1.02);
          }
          @keyframes ripple-animation {
            0% { width: 0; height: 0; opacity: 1; }
            100% { width: 100px; height: 100px; opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }
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
    
    // Add new markers and update existing ones with animation
    locations.forEach((location, index) => {
      const marker = markersRef.current[location.id];
      const color = getMarkerColor(index, locations.length);
      
      if (marker) {
        // Update existing marker position and popup
        marker.setLatLng(location.position);
        marker.bindPopup(`
          <div style="color:#29313b;font-weight:bold;font-size:1rem;">
            <span style="display:inline-block;width:12px;height:12px;border-radius:6px;background:${color};margin-right:5px;"></span>
            ${location.name}<br/><span style="color:#6c757d;font-weight:400;">Stop #${index + 1}</span>
          </div>
        `, { className: "custom-popup" });
      } else {
        // Create new marker with animation
        const icon = createMarkerIcon(color);
        const newMarker = L.marker(location.position, { 
          icon,
          opacity: 0 // Start invisible for animation
        })
        .bindPopup(`
          <div style="color:#29313b;font-weight:bold;font-size:1rem;">
            <span style="display:inline-block;width:12px;height:12px;border-radius:6px;background:${color};margin-right:5px;"></span>
            ${location.name}<br/><span style="color:#6c757d;font-weight:400;">Stop #${index + 1}</span>
          </div>
        `, { className: "custom-popup" })
        .addTo(mapRef.current!);
        
        // Animate marker appearance
        setTimeout(() => {
          newMarker.setOpacity(1);
        }, index * 100);
        
        markersRef.current[location.id] = newMarker;
        
        // Add a pulsing effect to the first marker (depot)
        if (index === 0) {
          const pulsingIcon = L.divIcon({
            html: `<div class="pulse-ring"></div>`,
            className: 'pulse-icon',
            iconSize: [36, 36]
          });
          
          const pulsingMarker = L.marker(location.position, { 
            icon: pulsingIcon,
            zIndexOffset: -1
          }).addTo(mapRef.current!);
          
          // Light color palette for pulse
          if (!document.getElementById('pulse-marker-style')) {
            const style = document.createElement('style');
            style.id = 'pulse-marker-style';
            style.innerHTML = `
              .pulse-icon { background: transparent; }
              .pulse-ring {
                position: absolute;
                width: 36px; height: 36px;
                border-radius: 50%;
                background: rgba(100,150,255,0.15);
                border: 2px solid rgba(50,100,200,0.20);
                transform: translate(-50%, -50%);
                animation: pulse-animation 1.4s infinite cubic-bezier(0.4,0,0.6,1);
              }
              @keyframes pulse-animation {
                0% { transform: translate(-50%,-50%) scale(0.7); opacity: 0.8;}
                100% { transform: translate(-50%,-50%) scale(1.7); opacity: 0;}
              }
            `;
            document.head.appendChild(style);
          }
        }
      }
    });
    
    // Fit bounds if we have locations
    const bounds = getBoundsForLocations(locations);
    if (bounds && mapRef.current) {
      mapRef.current.fitBounds(bounds, { 
        padding: [30, 30],
        animate: true,
        duration: 0.5
      });
    }
  }, [locations]);
  
  // Update route visualization when route changes
  useEffect(() => {
    // Remove old route
    if (routeLayerRef.current && mapRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
    
    // Add new route if available with animation
    if (route && route.length > 1 && mapRef.current) {
      const routePoints = routeToPolyline(route);
      
      // Create animated polyline
      const polyline = L.polyline([], createRouteStyle('#417bfa', 5))
        .addTo(mapRef.current);
      
      routeLayerRef.current = polyline;
      
      // Animate the route drawing
      let i = 0;
      const drawRoute = () => {
        if (i < routePoints.length) {
          const currentPath = routePoints.slice(0, i + 1);
          polyline.setLatLngs(currentPath);
          i++;
          setTimeout(drawRoute, 45);
        }
      };
      
      drawRoute();
      
      // Add direction arrows
      setTimeout(() => {
        if (mapRef.current && routeLayerRef.current && (L as any).polylineDecorator) {
          const decorator = (L as any).polylineDecorator(polyline, {
            patterns: [
              {
                offset: 25,
                repeat: 80,
                symbol: (L as any).Symbol.arrowHead({
                  pixelSize: 14,
                  polygon: false,
                  pathOptions: { color: "#417bfa", weight: 3, opacity: 0.92 }
                })
              }
            ]
          }).addTo(mapRef.current);
        }
      }, routePoints.length * 45 + 100);
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
      const polyline = L.polyline(routeToPolyline(currentStepPath), createRouteStyle('#ff7800', 3, 0.7, [5, 10]))
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
    
    // Add new edge if available with animation
    if (evaluatingEdge && mapRef.current) {
      const [from, to] = evaluatingEdge;
      
      // Create a dashed line with animation
      const polyline = L.polyline(
        [[from.position[0], from.position[1]], [to.position[0], to.position[1]]],
        { 
          color: '#ff3300', 
          weight: 2, 
          dashArray: '5, 10', 
          opacity: 0,
          className: 'evaluating-edge'
        }
      ).addTo(mapRef.current);
      
      // Add CSS animation for the dashed line
      if (!document.getElementById('evaluating-edge-style')) {
        const style = document.createElement('style');
        style.id = 'evaluating-edge-style';
        style.innerHTML = `
          .evaluating-edge {
            stroke-dashoffset: 0;
            animation: dash 1s linear, fade-in 0.3s forwards;
          }
          @keyframes dash {
            to {
              stroke-dashoffset: -30;
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      // Fade in the line
      setTimeout(() => {
        if (polyline) {
          polyline.setStyle({ opacity: 0.6 });
        }
      }, 10);
      
      evaluatingEdgeLayerRef.current = polyline;
    }
  }, [evaluatingEdge]);

  return (
    <div ref={mapContainerRef} className="h-full w-full rounded-2xl shadow-xl bg-white/40 glassy-map transition-all duration-300 border border-blue-100" />
  );
};

// Add the polyline decorator dependency
declare module "leaflet" {
  namespace Symbol {
    function arrowHead(options: any): any;
  }
  
  function polylineDecorator(polyline: L.Polyline, options: any): any;
}

export default LeafletMap;
