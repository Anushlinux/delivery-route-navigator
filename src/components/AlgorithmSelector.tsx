
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Play, FileQuestion } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type Algorithm = 'brute-force' | 'nearest-neighbor' | '2-opt';

interface AlgorithmSelectorProps {
  selectedAlgorithm: Algorithm;
  onSelectAlgorithm: (algorithm: Algorithm) => void;
  onCalculateRoute: () => void;
  isCalculating: boolean;
  locationsCount: number;
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  selectedAlgorithm,
  onSelectAlgorithm,
  onCalculateRoute,
  isCalculating,
  locationsCount,
}) => {
  const showBruteForceWarning = selectedAlgorithm === 'brute-force' && locationsCount > 10;
  
  // Algorithm information
  const algorithmInfo = {
    'brute-force': {
      name: 'Brute Force',
      description: 'Finds the optimal solution by checking every possible route.',
      pros: 'Guarantees the absolute shortest route',
      cons: 'Extremely slow for more than 10 locations (factorial time complexity)',
      recommended: 'For small datasets (≤ 8-10 locations)'
    },
    'nearest-neighbor': {
      name: 'Nearest Neighbor',
      description: 'A greedy algorithm that always visits the closest unvisited location next.',
      pros: 'Very fast, scales well to any number of locations',
      cons: 'Often produces suboptimal routes (can be 20-30% longer than optimal)',
      recommended: 'For quick approximations or large datasets'
    },
    '2-opt': {
      name: '2-Opt Heuristic',
      description: 'Improves an initial route by repeatedly swapping pairs of connections.',
      pros: 'Good balance of speed and route quality',
      cons: 'Can get stuck in local optima, slower than Nearest Neighbor',
      recommended: 'For a better route quality with reasonable performance'
    }
  };
  
  const currentInfo = algorithmInfo[selectedAlgorithm];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Select Algorithm</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <FileQuestion className="h-5 w-5 text-gray-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="w-80 p-4">
                <h4 className="font-bold mb-2">About This Problem</h4>
                <p className="text-sm mb-2">
                  The Traveling Salesperson Problem (TSP) is about finding the shortest possible route that visits each location exactly once and returns to the origin.
                </p>
                <p className="text-sm">
                  It's one of the most famous problems in computer science and is classified as NP-hard, meaning optimal solutions become exponentially more difficult to compute as the number of locations increases.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={selectedAlgorithm}
          onValueChange={(value: string) => onSelectAlgorithm(value as Algorithm)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select algorithm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="brute-force">Brute Force (Exact)</SelectItem>
            <SelectItem value="nearest-neighbor">Nearest Neighbor (Fast)</SelectItem>
            <SelectItem value="2-opt">2-Opt Heuristic (Balanced)</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <h3 className="font-medium text-md">{currentInfo.name}</h3>
          <p className="text-sm mt-1 text-gray-600">{currentInfo.description}</p>
          
          <div className="mt-3 space-y-1">
            <div className="text-xs">
              <span className="text-green-600 font-medium">Pros:</span> {currentInfo.pros}
            </div>
            <div className="text-xs">
              <span className="text-red-600 font-medium">Cons:</span> {currentInfo.cons}
            </div>
            <div className="text-xs font-medium mt-1">
              Recommended: {currentInfo.recommended}
            </div>
          </div>
        </div>
        
        {showBruteForceWarning && (
          <Alert className="bg-amber-50 text-amber-800 border-amber-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Performance Warning</AlertTitle>
            <AlertDescription className="text-xs">
              Brute force with {locationsCount} locations will be extremely slow 
              (calculating {factorial(locationsCount-1).toExponential(2)} possible routes). 
              Consider using a different algorithm.
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={onCalculateRoute} 
          className="w-full"
          disabled={isCalculating || locationsCount < 3}
        >
          {isCalculating ? (
            <>
              <span className="mr-2 animate-spin">⏳</span>
              Calculating...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Calculate Optimal Route
            </>
          )}
        </Button>
        
        {locationsCount < 3 && (
          <p className="text-xs text-center text-gray-500">
            Add at least 3 locations to calculate a route
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to calculate factorial (for brute force warning)
function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

export default AlgorithmSelector;
