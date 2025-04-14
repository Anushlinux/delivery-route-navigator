
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  SkipBack, 
  SkipForward,
  Pause,
  Play
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Algorithm Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <div className="font-medium">Step {currentStep + 1} of {totalSteps}</div>
          <div className="text-gray-500 text-xs mt-1 h-12 overflow-y-auto">
            {stepDescription || "Algorithm visualization in progress..."}
          </div>
        </div>
        
        <Progress value={progressPercentage} className="h-2" />
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleFirst}
              disabled={currentStep === 0}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            size="sm"
            onClick={onToggleAutoPlay}
            variant={isAutoPlaying ? "secondary" : "default"}
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
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLast}
              disabled={currentStep === totalSteps - 1}
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
