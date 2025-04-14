
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
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto animate-fade-in">
        <header className="mb-6 animate-slide-in">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <PackageOpen className="mr-2 h-8 w-8 text-primary" />
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                DeliveryRoute Navigator
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-2"
                onClick={() => setShowInfoDialog(true)}
              >
                <Info className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </Button>
            </h1>
            
            <div className="flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center rounded-full bg-accent/50 px-3 py-1 text-sm text-foreground">
                      <RouteIcon className="mr-1 h-4 w-4 text-primary" />
                      <span>Traveling Salesperson Problem Simulator</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-secondary text-foreground border-border">
                    <p className="w-80 text-sm">
                      This application demonstrates the Traveling Salesperson Problem, a classic
                      optimization challenge focused on finding the shortest possible route that visits
                      each location exactly once and returns to the origin.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <p className="text-muted-foreground mt-1">
            Optimize delivery routes by finding the shortest path between multiple locations
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Map */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] overflow-hidden border-border/40 shadow-lg glass-card">
              <LeafletMap
                locations={locations}
                route={routeToDisplay}
                onMapClick={handleMapClick}
                currentStepPath={currentStepPath}
                evaluatingEdge={evaluatingEdge}
              />
            </Card>
          </div>

          {/* Right column - Controls */}
          <div className="space-y-6">
            <Tabs defaultValue="locations" className="animate-fade-in">
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                <TabsTrigger value="locations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Locations
                </TabsTrigger>
                <TabsTrigger value="algorithm" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Algorithm
                </TabsTrigger>
              </TabsList>
              <TabsContent value="locations" className="mt-2">
                <LocationInput
                  locations={locations}
                  onAddLocation={handleAddLocation}
                  onRemoveLocation={handleRemoveLocation}
                  onClearLocations={handleClearLocations}
                />
              </TabsContent>
              <TabsContent value="algorithm" className="mt-2">
                <AlgorithmSelector
                  selectedAlgorithm={selectedAlgorithm}
                  onSelectAlgorithm={setSelectedAlgorithm}
                  onCalculateRoute={handleCalculateRoute}
                  isCalculating={isCalculating}
                  locationsCount={locations.length}
                />
              </TabsContent>
            </Tabs>

            {/* Only show metrics and controls if we have a route result */}
            {routeResult && (
              <>
                <PerformanceMetrics
                  distance={routeResult.distance}
                  executionTime={routeResult.executionTime}
                  iterations={routeResult.iterations}
                />

                {/* Only show step controls if we have steps to show */}
                {algorithmSteps.length > 0 && (
                  <StepControl
                    currentStep={currentStepIndex}
                    totalSteps={algorithmSteps.length}
                    isAutoPlaying={isAutoPlaying}
                    onStepChange={setCurrentStepIndex}
                    onToggleAutoPlay={() => setIsAutoPlaying(!isAutoPlaying)}
                    stepDescription={currentStep?.description || ""}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Results section - only show if we have a route */}
        {routeResult && (
          <div className="mt-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center">
              <RouteIcon className="mr-2 h-5 w-5 text-primary" />
              Optimal Route Plan
            </h2>
            <RouteDetails route={routeResult.path} distance={routeResult.distance} />
          </div>
        )}
      </div>
      
      {/* Information Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="max-w-3xl bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center text-foreground">
              <Info className="mr-2 h-5 w-5 text-primary" />
              About The Traveling Salesperson Problem
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="space-y-4 text-muted-foreground">
            <p>
              The <strong className="text-foreground">Traveling Salesperson Problem (TSP)</strong> is a classic algorithmic puzzle that seeks to find the shortest possible route that visits a set of locations exactly once and returns to the origin.
            </p>
            
            <h3 className="font-semibold text-foreground">In this simulation:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Add delivery locations by clicking on the map or searching for addresses</li>
              <li>Select an optimization algorithm based on your needs</li>
              <li>Calculate the route and watch the algorithm work step-by-step</li>
              <li>View performance metrics and the optimized delivery sequence</li>
            </ol>
            
            <h3 className="font-semibold text-foreground">About the Algorithms:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Brute Force:</strong> Checks every possible route to find the guaranteed optimal solution. Only practical for small numbers of locations (≤10) due to factorial time complexity.</li>
              <li><strong className="text-foreground">Nearest Neighbor:</strong> A greedy algorithm that always moves to the closest unvisited location next. Fast but may produce suboptimal routes.</li>
              <li><strong className="text-foreground">2-Opt:</strong> Improves an initial route by swapping pairs of connections when doing so would shorten the total distance. Good balance of speed and quality.</li>
            </ul>
            
            <p className="text-sm text-muted-foreground/80">
              Note: The TSP is an NP-hard problem, which means finding the exact optimal solution becomes computationally infeasible as the number of locations increases.
            </p>
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => setShowInfoDialog(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
