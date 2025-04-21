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
    <div className="min-h-screen bg-gradient-to-br from-[#fffbe9] via-[#fef7fa] to-[#dbfbff] section-padding transition-colors duration-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 animate-fade-in">
        <header className="mb-7 animate-slide-in">
          <div className="flex items-center justify-between gap-x-3">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground flex items-center drop-shadow-lg">
              <PackageOpen className="mr-2 h-10 w-10 text-primary drop-shadow-xl" />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-[#70e1bf] bg-clip-text text-transparent select-none font-playfair tracking-tight">DeliveryRoute Navigator</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-2"
                onClick={() => setShowInfoDialog(true)}
              >
                <Info className="h-6 w-6 text-amber-400 hover:text-primary transition-colors" />
              </Button>
            </h1>
            <div className="flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center rounded-full bg-amber-100/65 px-3 py-1 text-base text-foreground drop-shadow animate-scale-in">
                      <RouteIcon className="mr-1 h-5 w-5 text-primary" />
                      <span>Traveling Salesperson Problem Simulator</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-accent text-foreground border-border shadow-lg">
                    <p className="w-80 text-sm">
                      Optimizing routes with minimal distance &amp; maximum style!
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <p className="text-muted-foreground mt-3 text-xl font-medium max-w-2xl leading-relaxed animate-fade-in">
            Plan beautiful multi-stop delivery routes around the world.<br className="hidden md:inline" />
            <span className="text-primary font-bold">Fast, interactive, and fun to watch.</span>
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Map */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] overflow-hidden glass-card shadow-2xl border-0">
              <LeafletMap
                locations={locations}
                route={routeToDisplay}
                onMapClick={handleMapClick}
                currentStepPath={currentStepPath}
                evaluatingEdge={evaluatingEdge}
              />
            </Card>
          </div>
          {/* Controls */}
          <div className="space-y-8">
            <Tabs defaultValue="locations" className="animate-fade-in">
              <TabsList className="grid w-full grid-cols-2 shadow card-gradient rounded-xl text-foreground/90 font-semibold border border-accent">
                <TabsTrigger value="locations" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-colors">Locations</TabsTrigger>
                <TabsTrigger value="algorithm" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-colors">Algorithm</TabsTrigger>
              </TabsList>
              <TabsContent value="locations" className="mt-3">
                <LocationInput
                  locations={locations}
                  onAddLocation={handleAddLocation}
                  onRemoveLocation={handleRemoveLocation}
                  onClearLocations={handleClearLocations}
                />
              </TabsContent>
              <TabsContent value="algorithm" className="mt-3">
                <AlgorithmSelector
                  selectedAlgorithm={selectedAlgorithm}
                  onSelectAlgorithm={setSelectedAlgorithm}
                  onCalculateRoute={handleCalculateRoute}
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
        {/* Results */}
        {routeResult && (
          <div className="mt-10 animate-scale-in">
            <h2 className="text-2xl font-semibold mb-4 flex items-center text-foreground/90">
              <RouteIcon className="mr-2 h-6 w-6 text-primary" />
              <span>Optimal Delivery Route</span>
            </h2>
            <RouteDetails route={routeResult.path} distance={routeResult.distance} />
          </div>
        )}
      </div>
      
      {/* Info Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="max-w-3xl bg-background border-border card-gradient rounded-2xl shadow-2xl animate-fade-in">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center text-foreground gap-2">
              <Info className="h-6 w-6 text-primary" />
              About This App
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="space-y-5 text-muted-foreground max-w-2xl">
            <p>
              <strong className="text-primary">Traveling Salesperson Problem (TSP)</strong> visualizer—find the shortest route to visit all your locations and see the solution in action!
            </p>
            <h3 className="font-semibold text-accent-foreground">Tips:</h3>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Click the map or search an address to add stops.</li>
              <li>Pick an algorithm, watch the animation.</li>
              <li>See route details and metrics live!</li>
            </ol>
            <h3 className="font-semibold text-primary mt-4">How do the algorithms work?</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-bold text-accent-foreground">Brute Force:</span> Checks every possible order (slow for lots of stops—fun for geeks!)</li>
              <li><span className="font-bold text-accent-foreground">Nearest Neighbor:</span> Quick and sometimes greedy—fast but not perfect.</li>
              <li><span className="font-bold text-accent-foreground">2-Opt:</span> Keeps swapping to get shorter—a great middle ground.</li>
            </ul>
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => setShowInfoDialog(false)} className="bg-primary text-white font-bold rounded-xl py-2 px-7 shadow-xl hover:bg-amber-500/90 transition-all duration-200">Got it!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
