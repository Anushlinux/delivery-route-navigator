
import React, { useEffect, useRef } from 'react';
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

  // --- Always start in Mumbai by default
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [19.076, 72.8777],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20,
      }).addTo(map);

      mapRef.current = map;

      // Click ripple
      map.on('click', (e: L.LeafletMouseEvent) => {
        // Creative ripple
        const ripple = L.divIcon({
          html: `<div class="ripple"></div>`,
          className: 'ripple-container',
          iconSize: [20, 20]
        });

        const rippleMark = L.marker(e.latlng, { icon: ripple })
          .addTo(map)
          .on('add', () => {
            setTimeout(() => map.removeLayer(rippleMark), 800);
          });

        onMapClick([e.latlng.lat, e.latlng.lng]);
      });

      // Ripple animation style
      if (!document.getElementById('leaflet-ripple-style')) {
        const style = document.createElement('style');
        style.id = 'leaflet-ripple-style';
        style.innerHTML = `
          .ripple-container { background: transparent; }
          .ripple {
            position: absolute;
            width: 24px;
            height: 24px;
            background: rgba(230,162,62,0.28);
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

  // --- Markers, Map View, Marker Animations
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    Object.keys(markersRef.current).forEach(id => {
      if (!locations.find(loc => loc.id === id)) {
        if (markersRef.current[id]) {
          markersRef.current[id].remove();
          delete markersRef.current[id];
        }
      }
    });

    // Add or update markers
    locations.forEach((location, index) => {
      const marker = markersRef.current[location.id];
      const color = getMarkerColor(index, locations.length);

      if (marker) {
        marker.setLatLng(location.position);
        marker.bindPopup(`
          <div style="color:#74450d;font-weight:bold;font-size:1rem;">
            <span style="display:inline-block;width:12px;height:12px;border-radius:6px;background:${color};margin-right:5px;"></span>
            ${location.name}<br/><span style="color:#c38746;font-weight:400;">Stop #${index + 1}</span>
          </div>
        `, { className: "custom-popup" });
      } else {
        const icon = createMarkerIcon(color);
        const newMarker = L.marker(location.position, { 
          icon,
          opacity: 0
        })
        .bindPopup(`
          <div style="color:#74450d;font-weight:bold;font-size:1rem;">
            <span style="display:inline-block;width:12px;height:12px;border-radius:6px;background:${color};margin-right:5px;"></span>
            ${location.name}<br/><span style="color:#c38746;font-weight:400;">Stop #${index + 1}</span>
          </div>
        `, { className: "custom-popup" })
        .addTo(mapRef.current!);

        // Animate appearance
        setTimeout(() => {
          newMarker.setOpacity(1);
        }, index * 90);

        markersRef.current[location.id] = newMarker;

        // Pulsing depot effect
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

          // Only insert style once
          if (!document.getElementById('pulse-marker-style')) {
            const style = document.createElement('style');
            style.id = 'pulse-marker-style';
            style.innerHTML = `
              .pulse-icon { background: transparent; }
              .pulse-ring {
                position: absolute;
                width: 36px; height: 36px;
                border-radius: 50%;
                background: rgba(255,202,90,0.16);
                border: 2px solid rgba(255,184,64,0.19);
                transform: translate(-50%, -50%);
                animation: pulse-animation 1.5s infinite cubic-bezier(0.4,0,0.6,1);
              }
              @keyframes pulse-animation {
                0% { transform: translate(-50%,-50%) scale(0.80); opacity: 0.9;}
                100% { transform: translate(-50%,-50%) scale(1.8); opacity: 0;}
              }
            `;
            document.head.appendChild(style);
          }
        }
      }
    });

    // Auto-fit bounds
    const bounds = getBoundsForLocations(locations);
    if (bounds && mapRef.current) {
      mapRef.current.fitBounds(bounds, { 
        padding: [38, 38],
        animate: true,
        duration: 0.6
      });
    }
  }, [locations]);

  // --- Route Animation, Polyline Decorator Build Error FIX
  useEffect(() => {
    // Remove old route
    if (routeLayerRef.current && mapRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    // Add new route if available with animation
    if (route && route.length > 1 && mapRef.current) {
      const routePoints = routeToPolyline(route);

      // Route polyline styling
      const polyline = L.polyline([], createRouteStyle('#ffa84b', 5))
        .addTo(mapRef.current);

      routeLayerRef.current = polyline;

      // Animate route draw
      let i = 0;
      const drawRoute = () => {
        if (i < routePoints.length) {
          polyline.setLatLngs(routePoints.slice(0, i + 1));
          i++;
          setTimeout(drawRoute, 40);
        }
      };
      drawRoute();

      // Direction arrows (polylineDecorator expects latlngs as array, not string)
      setTimeout(() => {
        if (mapRef.current && routeLayerRef.current && (L as any).polylineDecorator) {
          (L as any).polylineDecorator(routePoints, {
            patterns: [
              {
                offset: 30,
                repeat: 80,
                symbol: (L as any).Symbol.arrowHead({
                  pixelSize: 15,
                  polygon: false,
                  pathOptions: { color: "#ffa72e", weight: 3, opacity: 0.94 }
                })
              }
            ]
          }).addTo(mapRef.current);
        }
      }, routePoints.length * 40 + 110);
    }
  }, [route]);

  // --- Current Path Step Animation
  useEffect(() => {
    // Remove old step path
    if (currentStepLayerRef.current && mapRef.current) {
      currentStepLayerRef.current.remove();
      currentStepLayerRef.current = null;
    }

    // Add new step path if available
    if (currentStepPath && currentStepPath.length > 1 && mapRef.current && !route) {
      const polyline = L.polyline(routeToPolyline(currentStepPath), createRouteStyle('#fa881a', 3, 0.72, [7, 13]))
        .addTo(mapRef.current);

      currentStepLayerRef.current = polyline;
    }
  }, [currentStepPath, route]);

  // --- Evaluating Edge Animation
  useEffect(() => {
    // Remove old edge
    if (evaluatingEdgeLayerRef.current && mapRef.current) {
      evaluatingEdgeLayerRef.current.remove();
      evaluatingEdgeLayerRef.current = null;
    }

    // Add new edge w/ animated line
    if (evaluatingEdge && mapRef.current) {
      const [from, to] = evaluatingEdge;
      const polyline = L.polyline(
        [from.position, to.position],
        { 
          color: '#ee6040', 
          weight: 2, 
          dashArray: '6, 12', 
          opacity: 0,
          className: 'evaluating-edge'
        }
      ).addTo(mapRef.current);

      // Dashed line animation CSS, only insert once
      if (!document.getElementById('evaluating-edge-style')) {
        const style = document.createElement('style');
        style.id = 'evaluating-edge-style';
        style.innerHTML = `
          .evaluating-edge {
            stroke-dashoffset: 0;
            animation: dash 1s linear, fade-in 0.34s forwards;
          }
          @keyframes dash {
            to {
              stroke-dashoffset: -36;
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
      }, 12);

      evaluatingEdgeLayerRef.current = polyline;
    }
  }, [evaluatingEdge]);

  return (
    <div ref={mapContainerRef}
      className="h-full w-full rounded-3xl shadow-xl glassy-map border border-yellow-100 transition-all duration-400"
    />
  );
};

// Correct typing for leaflet-polyline-decorator add-on
declare module "leaflet" {
  namespace Symbol {
    function arrowHead(options: any): any;
  }
  function polylineDecorator(latlngs: L.LatLngExpression[], options: any): any;
}

export default LeafletMap;
