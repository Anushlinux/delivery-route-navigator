
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Location } from '../utils/algorithms';
import { MapPin, ArrowRight, Route as RouteIcon } from 'lucide-react';
import { formatDistance } from '../utils/mapUtils';

interface RouteDetailsProps {
  route: Location[];
  distance: number;
}

const RouteDetails: React.FC<RouteDetailsProps> = ({ route, distance }) => {
  return (
    <Card className="border-border/40 shadow-lg animate-fade-in">
      <CardHeader className="pb-2 bg-secondary/40">
        <CardTitle className="text-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block p-1.5 rounded-full bg-primary/20">
              <RouteIcon className="h-4 w-4 text-primary" />
            </span>
            <span>Route Details</span>
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            {route.length} stops • {formatDistance(distance)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="max-h-96 overflow-y-auto pr-1 space-y-1">
          {route.map((location, index) => (
            <div 
              key={`${location.id}-${index}`} 
              className="relative animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Connecting line */}
              {index < route.length - 1 && (
                <div className="absolute left-2.5 top-6 h-full w-0.5 bg-accent" />
              )}
              
              <div className="flex items-start mb-4 relative z-10 p-2 rounded-md hover:bg-accent/30 transition-colors">
                <div className="flex-shrink-0 flex items-center justify-center">
                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center ${
                      index === 0
                        ? 'bg-green-500'
                        : index === route.length - 1
                        ? 'bg-red-500'
                        : 'bg-primary'
                    } transition-all hover:scale-110 duration-200`}
                  >
                    <MapPin className="h-3 w-3 text-white" strokeWidth={3} />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <span className="font-medium">
                      {index === 0 ? 'Start: ' : ''}
                      {index === route.length - 1 && index !== 0 ? 'End: ' : ''}
                      {location.name}
                    </span>
                    {index === 0 && (
                      <span className="ml-2 text-xs bg-green-900/40 text-green-400 py-0.5 px-2 rounded-full">
                        Depot
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Stop #{index + 1}
                  </div>
                </div>
                
                {index < route.length - 1 && (
                  <div className="text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded-full">
                    {formatDistance(
                      calculateSegmentDistance(
                        route[index].position,
                        route[index + 1].position
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Calculate distance between two points using the Haversine formula
function calculateSegmentDistance(
  [lat1, lng1]: [number, number],
  [lat2, lng2]: [number, number]
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default RouteDetails;
