import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LocationInput from "@/components/LocationInput";
import  AlgorithmSelector  from "@/components/AlgorithmSelector";
import  PerformanceMetrics  from "@/components/PerformanceMetrics";
import  StepControl  from "@/components/StepControl";
import type { Location, RouteResult, AlgorithmStep } from "@/utils/algorithms";
import type { Algorithm } from "@/components/AlgorithmSelector";

interface ControlPanelProps {
  locations: Location[];
  selectedAlgorithm: Algorithm;
  isCalculating: boolean;
  routeResult: RouteResult | null;
  currentStep: number;
  algorithmSteps: AlgorithmStep[];
  isAutoPlaying: boolean;
  onAddLocation: (location: Location) => void;
  onRemoveLocation: (id: string) => void;
  onClearLocations: () => void;
  onSelectAlgorithm: (algorithm: Algorithm) => void;
  onCalculateRoute: () => void;
  onStepChange: (step: number) => void;
  onToggleAutoPlay: () => void;
}

export function ControlPanel({
  locations,
  selectedAlgorithm,
  isCalculating,
  routeResult,
  currentStep,
  algorithmSteps,
  isAutoPlaying,
  onAddLocation,
  onRemoveLocation,
  onClearLocations,
  onSelectAlgorithm,
  onCalculateRoute,
  onStepChange,
  onToggleAutoPlay,
}: ControlPanelProps) {
  return (
    <div className="space-y-8">
      <Tabs defaultValue="locations" className="animate-fade-in">
        <TabsList className="grid w-full grid-cols-2 shadow card-gradient rounded-xl text-foreground/90 font-semibold border border-accent">
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="algorithm">Algorithm</TabsTrigger>
        </TabsList>
        
        <TabsContent value="locations" className="mt-3">
          <LocationInput
            locations={locations}
            onAddLocation={onAddLocation}
            onRemoveLocation={onRemoveLocation}
            onClearLocations={onClearLocations}
          />
        </TabsContent>
        
        <TabsContent value="algorithm" className="mt-3">
          <AlgorithmSelector
            selectedAlgorithm={selectedAlgorithm as Algorithm}
            onSelectAlgorithm={onSelectAlgorithm}
            onCalculateRoute={onCalculateRoute}
            isCalculating={isCalculating}
            locationsCount={locations.length}
          />
        </TabsContent>
      </Tabs>

      {routeResult && (
        <>
          <PerformanceMetrics
            distance={routeResult.distance}
            executionTime={routeResult.executionTime}
            iterations={routeResult.iterations}
          />
          {algorithmSteps.length > 0 && (
            <StepControl
              currentStep={currentStep}
              totalSteps={algorithmSteps.length}
              isAutoPlaying={isAutoPlaying}
              onStepChange={onStepChange}
              onToggleAutoPlay={onToggleAutoPlay}
              stepDescription={algorithmSteps[currentStep]?.description || ""}
            />
          )}
        </>
      )}
    </div>
  );
}




