import React, { useState, useEffect, useRef } from "react";
import AlgorithmSelector from "@/components/AlgorithmSelector";
import type { Algorithm } from "@/components/AlgorithmSelector";
import LeafletMap from "@/components/LeafletMap";
import LocationInput from "@/components/LocationInput";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import RouteDetails from "@/components/RouteDetails";
import StepControl from "@/components/StepControl";
import {
  Location,
  RouteResult,
  AlgorithmStep,
  bruteForceTSP,
  nearestNeighborTSP,
  twoOptTSP,
} from "@/utils/algorithms";
import { generateUniqueId, reverseGeocode } from "@/utils/mapUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { PackageOpen, Route as RouteIcon, Timer, Info, MapPin, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import { Header } from "@/components/layout/header";
import { MapSection } from "@/components/sections/map-section";
import { ControlPanel } from "@/components/sections/control-panel";
import { InfoDialog } from "@/components/dialogs/info-dialog";

const Index = () => {
  // State for locations, routes, and algorithm
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<Algorithm>("nearest-neighbor");
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // State for algorithm visualization
  const [algorithmSteps, setAlgorithmSteps] = useState<AlgorithmStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(500); // ms between steps
  
  // Timer for auto-playing steps
  const autoPlayTimerRef = useRef<number | null>(null);

  // Handle automatically advancing steps when auto-play is enabled
  useEffect(() => {
    if (isAutoPlaying && algorithmSteps.length > 0) {
      if (autoPlayTimerRef.current) {
        window.clearTimeout(autoPlayTimerRef.current);
      }

      if (currentStepIndex < algorithmSteps.length - 1) {
        autoPlayTimerRef.current = window.setTimeout(() => {
          setCurrentStepIndex((prev) => prev + 1);
        }, playbackSpeed);
      } else {
        // Reached the end, stop auto-play
        setIsAutoPlaying(false);
        toast.success("Algorithm visualization complete!");
      }
    }

    return () => {
      if (autoPlayTimerRef.current) {
        window.clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [isAutoPlaying, currentStepIndex, algorithmSteps, playbackSpeed]);

  // Handle adding a location when map is clicked
  const handleMapClick = async (position: [number, number]) => {
    // Don't add new locations if we're already calculating a route
    if (isCalculating) return;

    // If a route exists, clear it first
    if (routeResult) {
      resetRouteAndSteps();
    }

    // Try to reverse geocode the address
    let locationName = `Location ${locations.length + 1}`;
    try {
      const address = await reverseGeocode(position[0], position[1]);
      if (address) {
        const shortAddress = address.split(",").slice(0, 2).join(",");
        locationName = shortAddress;
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }

    // Add the new location
    const newLocation: Location = {
      id: generateUniqueId(),
      name: locationName,
      position,
    };

    setLocations((prevLocations) => [...prevLocations, newLocation]);
    
    // Show toast notification
    toast.success(
      <div className="flex items-center">
        <MapPin className="mr-2 h-4 w-4" />
        <span>Added location: {locationName}</span>
      </div>
    );
  };

  // Handle adding a location from address search
  const handleAddLocation = (location: Location) => {
    // Don't add new locations if we're already calculating a route
    if (isCalculating) return;

    // If a route exists, clear it first
    if (routeResult) {
      resetRouteAndSteps();
    }

    setLocations((prevLocations) => [...prevLocations, location]);
    toast.success(
      <div className="flex items-center">
        <MapPin className="mr-2 h-4 w-4" />
        <span>Added location: {location.name}</span>
      </div>
    );
  };

  // Handle removing a location
  const handleRemoveLocation = (id: string) => {
    // Don't remove locations if we're already calculating a route
    if (isCalculating) return;

    // If a route exists, clear it first
    if (routeResult) {
      resetRouteAndSteps();
    }

    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  };

  // Handle clearing all locations
  const handleClearLocations = () => {
    // Don't clear if we're already calculating a route
    if (isCalculating) return;

    setLocations([]);
    resetRouteAndSteps();
  };

  // Reset route and algorithm steps
  const resetRouteAndSteps = () => {
    setRouteResult(null);
    setAlgorithmSteps([]);
    setCurrentStepIndex(0);
    setIsAutoPlaying(false);
  };

  // Handle calculating the route
  const handleCalculateRoute = async () => {
    if (locations.length < 3) {
      toast.error("Add at least 3 locations to calculate a route");
      return;
    }

    // Reset any existing route
    resetRouteAndSteps();
    setIsCalculating(true);
    
    // Show loading toast
    const loadingToast = toast.loading(
      <div className="flex items-center">
        <BrainCircuit className="mr-2 h-4 w-4 animate-pulse" />
        <span>Calculating optimal route...</span>
      </div>
    );

    // Collect steps for visualization
    const steps: AlgorithmStep[] = [];
    const recordStep = (step: AlgorithmStep) => {
      steps.push({ ...step });
    };

    try {
      let result: RouteResult;

      // Use the selected algorithm
      switch (selectedAlgorithm) {
        case "brute-force":
          result = bruteForceTSP(locations, recordStep);
          break;
        case "nearest-neighbor":
          result = nearestNeighborTSP(locations, recordStep);
          break;
        case "2-opt":
          result = twoOptTSP(locations, recordStep);
          break;
        default:
          result = nearestNeighborTSP(locations, recordStep);
      }

      // Update state with results
      setAlgorithmSteps(steps);
      setRouteResult(result);
      setCurrentStepIndex(0); // Start at the first step
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(
        <div className="flex items-center">
          <RouteIcon className="mr-2 h-4 w-4" />
          <span>Route calculated successfully!</span>
        </div>
      );
      
      // Start auto-play if we have steps
      if (steps.length > 0) {
        // Adjust playback speed based on number of steps
        if (steps.length > 1000) {
          setPlaybackSpeed(50); // Very fast for large number of steps
        } else if (steps.length > 500) {
          setPlaybackSpeed(100);
        } else if (steps.length > 100) {
          setPlaybackSpeed(200);
        } else {
          setPlaybackSpeed(500); // Default speed
        }
        
        setIsAutoPlaying(true);
      }
    } catch (error) {
      console.error("Error calculating route:", error);
      toast.dismiss(loadingToast);
      toast.error("Error calculating route. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  // Get the current step for visualization
  const currentStep = algorithmSteps[currentStepIndex];
  const currentStepPath = currentStep?.currentPath || null;
  const evaluatingEdge = currentStep?.evaluatingEdge || undefined;

  // Show the final route once calculation is complete and all steps are viewed
  const routeToDisplay =
    routeResult && (!algorithmSteps.length || currentStepIndex === algorithmSteps.length - 1)
      ? routeResult.path
      : null;

  return (
    <MainLayout>
      <Header onInfoClick={() => setShowInfoDialog(true)} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <MapSection
            locations={locations}
            routeToDisplay={routeToDisplay}
            currentStepPath={currentStepPath}
            evaluatingEdge={evaluatingEdge}
            onMapClick={handleMapClick}
          />
        </div>
        
        <ControlPanel
          locations={locations}
          selectedAlgorithm={selectedAlgorithm}
          isCalculating={isCalculating}
          routeResult={routeResult}
          currentStep={currentStepIndex}
          algorithmSteps={algorithmSteps}
          isAutoPlaying={isAutoPlaying}
          onAddLocation={handleAddLocation}
          onRemoveLocation={handleRemoveLocation}
          onClearLocations={handleClearLocations}
          onSelectAlgorithm={setSelectedAlgorithm}
          onCalculateRoute={handleCalculateRoute}
          onStepChange={setCurrentStepIndex}
          onToggleAutoPlay={() => setIsAutoPlaying(!isAutoPlaying)}
        />
      </div>

      {routeResult && (
        <div className="mt-10 animate-scale-in">
          <RouteDetails 
            route={routeResult.path} 
            distance={routeResult.distance} 
          />
        </div>
      )}

      <InfoDialog 
        open={showInfoDialog} 
        onOpenChange={setShowInfoDialog} 
      />
    </MainLayout>
  );
};

export default Index;
