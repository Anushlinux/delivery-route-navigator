
// Traveling Salesperson Problem (TSP) algorithms

// Types
export interface Location {
  id: string;
  name: string;
  position: [number, number]; // [lat, lng]
}

export interface RouteResult {
  path: Location[];
  distance: number;
  iterations: number;
  executionTime: number;
}

export interface AlgorithmStep {
  currentPath: Location[];
  evaluatingEdge?: [Location, Location];
  bestPathSoFar: Location[];
  description: string;
}

// Helper function to calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
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

// Calculate total route distance
export function calculateRouteDistance(route: Location[]): number {
  let distance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    distance += calculateDistance(route[i].position, route[i + 1].position);
  }
  // Add distance back to starting point if needed
  distance += calculateDistance(
    route[route.length - 1].position,
    route[0].position
  );
  return distance;
}

// Brute Force algorithm (exact solution, factorial time complexity)
export function bruteForceTSP(
  locations: Location[],
  recordStep?: (step: AlgorithmStep) => void
): RouteResult {
  const startTime = performance.now();
  const start = locations[0]; // Keep first location (depot) fixed
  const locationsToPermute = locations.slice(1);
  let bestRoute: Location[] = [];
  let bestDistance = Infinity;
  let iterations = 0;

  // Helper function to generate all permutations
  function generatePermutations(
    arr: Location[],
    currentPerm: Location[] = []
  ): void {
    iterations++;

    // If we have a complete permutation
    if (arr.length === 0) {
      const fullRoute = [start, ...currentPerm, start]; // Complete cycle back to start
      const distance = calculateRouteDistance(fullRoute);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestRoute = [...fullRoute];
        
        if (recordStep) {
          recordStep({
            currentPath: fullRoute,
            bestPathSoFar: bestRoute,
            description: `Found new best route with distance ${distance.toFixed(2)} km`,
          });
        }
      }
      return;
    }

    // Generate permutations by taking one element at a time
    for (let i = 0; i < arr.length; i++) {
      const current = [...arr];
      const next = current.splice(i, 1);
      
      if (recordStep) {
        recordStep({
          currentPath: [start, ...currentPerm, ...next],
          bestPathSoFar: bestRoute,
          description: `Evaluating permutation ${iterations}`,
        });
      }
      
      generatePermutations(current, [...currentPerm, ...next]);
    }
  }

  // Start permutation process
  generatePermutations(locationsToPermute);
  
  const executionTime = performance.now() - startTime;
  
  return {
    path: bestRoute,
    distance: bestDistance,
    iterations,
    executionTime,
  };
}

// Nearest Neighbor algorithm (greedy heuristic)
export function nearestNeighborTSP(
  locations: Location[],
  recordStep?: (step: AlgorithmStep) => void
): RouteResult {
  const startTime = performance.now();
  const start = locations[0]; // Start at first location
  let remainingLocations = [...locations.slice(1)];
  let currentLocation = start;
  let path = [currentLocation];
  let totalDistance = 0;
  let iterations = 0;

  while (remainingLocations.length > 0) {
    iterations++;
    let nextLocation: Location | null = null;
    let shortestDistance = Infinity;

    // Find nearest unvisited location
    for (const location of remainingLocations) {
      const distance = calculateDistance(
        currentLocation.position,
        location.position
      );
      
      if (recordStep) {
        recordStep({
          currentPath: [...path],
          evaluatingEdge: [currentLocation, location],
          bestPathSoFar: [...path],
          description: `Evaluating distance to ${location.name}: ${distance.toFixed(2)} km`,
        });
      }
      
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nextLocation = location;
      }
    }

    if (nextLocation) {
      // Add nearest location to path
      totalDistance += shortestDistance;
      path.push(nextLocation);
      currentLocation = nextLocation;
      remainingLocations = remainingLocations.filter(
        (loc) => loc.id !== nextLocation!.id
      );
      
      if (recordStep) {
        recordStep({
          currentPath: [...path],
          bestPathSoFar: [...path],
          description: `Added ${nextLocation.name} to path, distance so far: ${totalDistance.toFixed(2)} km`,
        });
      }
    }
  }

  // Complete cycle by going back to start
  totalDistance += calculateDistance(
    currentLocation.position,
    start.position
  );
  path.push(start);
  
  if (recordStep) {
    recordStep({
      currentPath: [...path],
      bestPathSoFar: [...path],
      description: `Returning to start, total route distance: ${totalDistance.toFixed(2)} km`,
    });
  }

  const executionTime = performance.now() - startTime;
  
  return {
    path,
    distance: totalDistance,
    iterations,
    executionTime,
  };
}

// 2-Opt Heuristic algorithm (local improvement)
export function twoOptTSP(
  locations: Location[],
  recordStep?: (step: AlgorithmStep) => void
): RouteResult {
  const startTime = performance.now();
  
  // Start with nearest neighbor solution as initial route
  const initialSolution = nearestNeighborTSP(locations);
  let bestRoute = [...initialSolution.path];
  let bestDistance = initialSolution.distance;
  let improved = true;
  let iterations = 0;
  
  if (recordStep) {
    recordStep({
      currentPath: bestRoute,
      bestPathSoFar: bestRoute,
      description: `Starting with Nearest Neighbor solution, distance: ${bestDistance.toFixed(2)} km`,
    });
  }

  // Continue until no improvement is found
  while (improved) {
    improved = false;
    iterations++;

    // Try all possible edge swaps
    for (let i = 1; i < bestRoute.length - 2; i++) {
      for (let j = i + 1; j < bestRoute.length - 1; j++) {
        iterations++;
        
        // Create new route with 2-opt swap
        const newRoute = [...bestRoute];
        // Reverse the route between positions i and j
        const routeSegment = newRoute.slice(i, j + 1).reverse();
        newRoute.splice(i, j - i + 1, ...routeSegment);

        // Calculate new distance
        const newDistance = calculateRouteDistance(newRoute);
        
        if (recordStep) {
          recordStep({
            currentPath: newRoute,
            evaluatingEdge: [bestRoute[i-1], bestRoute[j]],
            bestPathSoFar: bestRoute,
            description: `Evaluating 2-opt swap between positions ${i} and ${j}, new distance: ${newDistance.toFixed(2)} km`,
          });
        }
        
        // If better, update best route
        if (newDistance < bestDistance) {
          bestDistance = newDistance;
          bestRoute = [...newRoute];
          improved = true;
          
          if (recordStep) {
            recordStep({
              currentPath: bestRoute,
              bestPathSoFar: bestRoute,
              description: `Improvement found! New best distance: ${bestDistance.toFixed(2)} km`,
            });
          }
          
          break;
        }
      }
      if (improved) break;
    }
  }

  const executionTime = performance.now() - startTime;
  
  return {
    path: bestRoute,
    distance: bestDistance,
    iterations,
    executionTime,
  };
}
