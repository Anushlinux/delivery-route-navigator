
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Location } from '../utils/algorithms';
import { AlertCircle, MapPin, Plus, Search, Trash2 } from 'lucide-react';
import { geocodeAddress, generateUniqueId } from '../utils/mapUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LocationInputProps {
  locations: Location[];
  onAddLocation: (location: Location) => void;
  onClearLocations: () => void;
  onRemoveLocation: (id: string) => void;
}

const LocationInput: React.FC<LocationInputProps> = ({
  locations,
  onAddLocation,
  onClearLocations,
  onRemoveLocation,
}) => {
  const [address, setAddress] = useState('');
  const [locationName, setLocationName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle address search
  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const coordinates = await geocodeAddress(address);
      
      if (!coordinates) {
        setError('Unable to find this address. Please try a different search term.');
        return;
      }
      
      const newLocation: Location = {
        id: generateUniqueId(),
        name: locationName || address,
        position: coordinates,
      };
      
      onAddLocation(newLocation);
      
      // Reset form
      setAddress('');
      setLocationName('');
    } catch (err) {
      setError('An error occurred during address search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleAddressSearch} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="locationName" className="text-sm font-medium">
              Location Name (optional)
            </label>
            <Input
              id="locationName"
              type="text"
              placeholder="e.g., Warehouse, Customer A"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">
              Address or Place Name
            </label>
            <div className="flex space-x-2">
              <Input
                id="address"
                type="text"
                placeholder="Enter an address to search"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isSearching || !address.trim()}>
                {isSearching ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2">Search</span>
              </Button>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="text-sm text-gray-500">
            <p>You can also click directly on the map to add a location.</p>
          </div>
        </form>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            Delivery Locations ({locations.length})
          </h3>
          
          {locations.length === 0 ? (
            <div className="text-gray-500 text-sm">
              No locations added yet. Add locations by searching or clicking on the map.
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {locations.map((location, index) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <MapPin
                        className={`h-5 w-5 ${
                          index === 0
                            ? 'text-green-500'
                            : 'text-blue-500'
                        }`}
                      />
                    </div>
                    <div className="ml-2">
                      <div className="font-medium">
                        {index === 0 ? '🏠 ' : ''}{location.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {location.position[0].toFixed(4)}, {location.position[1].toFixed(4)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveLocation(location.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 flex space-x-2">
            {locations.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearLocations}
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationInput;
