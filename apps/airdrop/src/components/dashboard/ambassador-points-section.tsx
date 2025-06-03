"use client";

import { Badge } from "@krain/ui/components/ui/badge";
import { Label } from "@krain/ui/components/ui/label";
import { formatNumber } from "@krain/utils";
import { AlertCircle, CheckCircle2, Trophy } from "lucide-react";
import { cn } from "@krain/ui/lib/utils";

interface AmbassadorPointsSectionProps {
  isAmbassador: boolean;
  activeMonths: number;
  ambassadorPoints: number;
  locale: string;
  isLoading: boolean;
}

export function AmbassadorPointsSection({
  isAmbassador,
  activeMonths,
  ambassadorPoints,
  locale,
  isLoading,
}: AmbassadorPointsSectionProps) {
  if (!isAmbassador) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 group">
        <Trophy className="h-5 w-5 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
        <Label className="font-medium bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
          Ambassador Points
        </Label>
      </div>
      <div className="rounded-lg border border-border/50 bg-card p-3 relative overflow-hidden group backdrop-blur-xs">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
              <span className="text-sm font-medium bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
                Ambassador Status
              </span>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "text-center relative overflow-hidden transition-colors",
                "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
              )}
            >
              Active
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Months:</span>
              <span className="font-medium">{activeMonths}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Points per Month:</span>
              <span className="font-medium">100,000</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold pt-2 border-t">
              <span>Total Ambassador Points:</span>
              <span>{formatNumber(ambassadorPoints, locale)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 