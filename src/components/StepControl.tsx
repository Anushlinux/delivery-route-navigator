
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  SkipBack, 
  SkipForward,
  Pause,
  Play,
  ListOrdered
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StepControlProps {
  currentStep: number;
  totalSteps: number;
  isAutoPlaying: boolean;
  onStepChange: (step: number) => void;
  onToggleAutoPlay: () => void;
  stepDescription: string;
}

const StepControl: React.FC<StepControlProps> = ({
  currentStep,
  totalSteps,
  isAutoPlaying,
  onStepChange,
  onToggleAutoPlay,
  stepDescription
}) => {
  const handlePrev = () => {
    onStepChange(Math.max(0, currentStep - 1));
  };

  const handleNext = () => {
    onStepChange(Math.min(totalSteps - 1, currentStep + 1));
  };

  const handleFirst = () => {
    onStepChange(0);
  };

  const handleLast = () => {
    onStepChange(totalSteps - 1);
  };

  // Calculate progress percentage
  const progressPercentage = totalSteps > 0 
    ? ((currentStep + 1) / totalSteps) * 100 
    : 0;

  return (
    <Card className="overflow-hidden border-border/40 shadow-lg animate-fade-in">
      <CardHeader className="pb-2 bg-secondary/40">
        <CardTitle className="text-md flex items-center gap-2">
          <span className="inline-block p-1.5 rounded-full bg-primary/20">
            <ListOrdered className="h-4 w-4 text-primary" />
          </span>
          Algorithm Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="text-sm">
          <div className="flex justify-between items-center">
            <div className="font-medium">Step {currentStep + 1} of {totalSteps}</div>
            <div className="text-xs text-primary animate-pulse-slow px-2 py-0.5 rounded-full bg-primary/10">
              {isAutoPlaying ? "Auto-playing..." : "Paused"}
            </div>
          </div>
          <div className="mt-2 p-3 rounded-md bg-accent/30 text-xs border-l-2 border-primary h-16 overflow-y-auto">
            {stepDescription || "Algorithm visualization in progress..."}
          </div>
        </div>
        
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <div className="text-xs text-muted-foreground flex justify-between">
            <span>Start</span>
            <span>Completion: {progressPercentage.toFixed(0)}%</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex space-x-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleFirst}
              disabled={currentStep === 0}
              className="bg-accent/50 hover:bg-accent transition-colors"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="bg-accent/50 hover:bg-accent transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            size="sm"
            onClick={onToggleAutoPlay}
            variant={isAutoPlaying ? "secondary" : "default"}
            className={`transition-all ${isAutoPlaying ? 'bg-accent text-primary' : 'bg-primary text-secondary'}`}
          >
            {isAutoPlaying ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Play
              </>
            )}
          </Button>
          
          <div className="flex space-x-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNext}
              disabled={currentStep === totalSteps - 1}
              className="bg-accent/50 hover:bg-accent transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLast}
              disabled={currentStep === totalSteps - 1}
              className="bg-accent/50 hover:bg-accent transition-colors"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepControl;
