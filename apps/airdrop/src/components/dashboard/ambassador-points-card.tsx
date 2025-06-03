"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@krain/ui/components/ui/card";
import { Badge } from "@krain/ui/components/ui/badge";
import { formatNumber } from "@krain/utils";
import { Trophy } from "lucide-react";

interface AmbassadorPointsCardProps {
  ambassadorInfo: {
    isAmbassador: boolean;
    activeMonths: number;
    ambassadorPoints: number;
  };
  locale?: string;
}

export function AmbassadorPointsCard({ ambassadorInfo, locale = "en" }: AmbassadorPointsCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isAmbassador, activeMonths, ambassadorPoints } = ambassadorInfo;

  if (!isAmbassador) {
    return null;
  }

  return (
    <Card className="border-2 max-w-2xl mx-auto my-4 border-2 max-w-2xl mx-auto relative overflow-hidden backdrop-blur-sm bg-background/95 border-border/50 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary/80" />
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Ambassador Points</CardTitle>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">Ambassador</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
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
      </CardContent>
    </Card>
  );
} 