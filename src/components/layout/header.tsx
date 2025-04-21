import { Button } from "@/components/ui/button";
import { Info, PackageOpen, Route as RouteIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  onInfoClick: () => void;
}

export function Header({ onInfoClick }: HeaderProps) {
  return (
    <header className="mb-7 animate-slide-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground flex items-center drop-shadow-lg">
            <PackageOpen className="mr-2 h-10 w-10 text-primary drop-shadow-xl" />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-[#70e1bf] bg-clip-text text-transparent select-none font-playfair tracking-tight">
              DeliveryRoute Navigator
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={onInfoClick}
            >
              <Info className="h-6 w-6 text-amber-400 hover:text-primary transition-colors" />
            </Button>
          </h1>
        </div>
        
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
                Optimizing routes with minimal distance & maximum style!
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <p className="text-muted-foreground mt-3 text-xl font-medium max-w-2xl leading-relaxed animate-fade-in">
        Plan beautiful multi-stop delivery routes around the world.
        <br className="hidden md:inline" />
        <span className="text-primary font-bold">
          Fast, interactive, and fun to watch.
        </span>
      </p>
    </header>
  );
}