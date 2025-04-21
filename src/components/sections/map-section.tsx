import { Card } from "@/components/ui/card";
import  LeafletMap  from "@/components/LeafletMap";
import type { Location } from "@/utils/algorithms";

interface MapSectionProps {
  locations: Location[];
  routeToDisplay: Location[] | null;
  currentStepPath: Location[] | null;
  evaluatingEdge?: [Location, Location];
  onMapClick: (position: [number, number]) => void;
}

export function MapSection({
  locations,
  routeToDisplay,
  currentStepPath,
  evaluatingEdge,
  onMapClick,
}: MapSectionProps) {
  return (
    <Card className="h-[600px] overflow-hidden glass-card shadow-2xl border-0">
      <LeafletMap
        locations={locations}
        route={routeToDisplay}
        onMapClick={onMapClick}
        currentStepPath={currentStepPath}
        evaluatingEdge={evaluatingEdge}
      />
    </Card>
  );
}

