
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Location } from '../utils/algorithms';
import { MapPin, ArrowRight } from 'lucide-react';
import { formatDistance } from '../utils/mapUtils';

interface RouteDetailsProps {
  route: Location[];
  distance: number;
}

const RouteDetails: React.FC<RouteDetailsProps> = ({ route, distance }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center justify-between">
          <span>Route Details</span>
          <span className="text-sm font-normal text-gray-500">
            {route.length} stops • {formatDistance(distance)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="max-h-96 overflow-y-auto pr-1">
          {route.map((location, index) => (
            <div key={`${location.id}-${index}`} className="relative">
              {/* Connecting line */}
              {index < route.length - 1 && (
                <div className="absolute left-2.5 top-6 h-full w-0.5 bg-gray-200" />
              )}
              
              <div className="flex items-start mb-4 relative z-10">
                <div className="flex-shrink-0 flex items-center justify-center">
                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center ${
                      index === 0
                        ? 'bg-green-500'
                        : index === route.length - 1
                        ? 'bg-red-500'
                        : 'bg-blue-500'
                    }`}
                  >
                    <MapPin className="h-3 w-3 text-white" strokeWidth={3} />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="flex items-center">
                    <span className="font-medium">
                      {index === 0 ? 'Start: ' : ''}
                      {index === route.length - 1 && index !== 0 ? 'End: ' : ''}
                      {location.name}
                    </span>
                    {index === 0 && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 py-0.5 px-2 rounded-full">
                        Depot
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Stop #{index + 1}
                  </div>
                </div>
                
                {index < route.length - 1 && (
                  <div className="flex-1 flex justify-end items-center text-xs text-gray-500">
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
