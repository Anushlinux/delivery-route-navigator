
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
    <Card className="overflow-hidden border-border/40 shadow-lg animate-fade-in">
      <CardHeader className="pb-2 bg-secondary/40">
        <CardTitle className="text-md flex items-center gap-2">
          <span className="inline-block p-1.5 rounded-full bg-primary/20">
            <Timer className="h-4 w-4 text-primary" />
          </span>
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-3 bg-accent/30 rounded-lg transition-all hover:bg-accent/50 duration-300">
            <div className="flex items-center justify-center rounded-full bg-blue-900/40 p-2 mb-2">
              <Ruler className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-xs text-muted-foreground">Total Distance</span>
            <span className="text-lg font-bold text-foreground">{formatDistance(distance)}</span>
          </div>

          <div className="flex flex-col items-center p-3 bg-accent/30 rounded-lg transition-all hover:bg-accent/50 duration-300">
            <div className="flex items-center justify-center rounded-full bg-green-900/40 p-2 mb-2">
              <Timer className="h-4 w-4 text-green-400" />
            </div>
            <span className="text-xs text-muted-foreground">Execution Time</span>
            <span className="text-lg font-bold text-foreground">{formatExecutionTime(executionTime)}</span>
          </div>

          <div className="flex flex-col items-center p-3 bg-accent/30 rounded-lg transition-all hover:bg-accent/50 duration-300">
            <div className="flex items-center justify-center rounded-full bg-purple-900/40 p-2 mb-2">
              <RotateCw className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-xs text-muted-foreground">Iterations</span>
            <span className="text-lg font-bold text-foreground">{iterations.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;
