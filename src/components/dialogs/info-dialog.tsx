import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InfoDialog: React.FC<InfoDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>About This Application</DialogTitle>
          <DialogDescription>
            This is a Traveling Salesperson Problem (TSP) solver that helps visualize
            different algorithms for finding the shortest possible route between multiple locations.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};