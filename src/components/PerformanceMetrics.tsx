
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, Ruler, RotateCw } from 'lucide-react';
import { formatDistance } from '../utils/mapUtils';

interface PerformanceMetricsProps {
  distance: number;
  executionTime: number;
  iterations: number;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  distance,
  executionTime,
  iterations
}) => {
  // Format execution time in a readable way
  const formatExecutionTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)} ms`;
    return `${(ms / 1000).toFixed(2)} seconds`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center rounded-full bg-blue-100 p-2 mb-2">
              <Ruler className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500">Total Distance</span>
            <span className="text-lg font-bold">{formatDistance(distance)}</span>
          </div>

          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center rounded-full bg-green-100 p-2 mb-2">
              <Timer className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-xs text-gray-500">Execution Time</span>
            <span className="text-lg font-bold">{formatExecutionTime(executionTime)}</span>
          </div>

          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center rounded-full bg-purple-100 p-2 mb-2">
              <RotateCw className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-xs text-gray-500">Iterations</span>
            <span className="text-lg font-bold">{iterations.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;
