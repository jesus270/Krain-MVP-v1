"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Label } from "@repo/ui/components/ui/label";
import { formatNumber } from "@repo/utils";
import {
  AlertCircle,
  CheckCircle2,
  Share2,
  Users,
  Loader2,
} from "lucide-react";

interface ReferralPointsSectionProps {
  referralsCount: number;
  referralPoints: number;
  locale: string;
  isLoading: boolean;
}

export function ReferralPointsSection({
  referralsCount,
  referralPoints,
  locale,
  isLoading,
}: ReferralPointsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <Label className="font-medium">Referral Points</Label>
      </div>
      <div className="rounded-lg border bg-card/50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Referrals</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={referralsCount > 0 ? "secondary" : "outline"}
              className="text-center"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading...
                </span>
              ) : (
                `${formatNumber(referralPoints, locale)} pts`
              )}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {isLoading ? (
            <>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <p className="text-xs text-muted-foreground">
                Loading referral data...
              </p>
            </>
          ) : referralsCount > 0 ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <p className="text-xs text-muted-foreground">
                You've referred {formatNumber(referralsCount, locale)} friend
                {referralsCount === 1 ? "" : "s"}
              </p>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <p className="text-xs text-muted-foreground">
                Invite friends to earn points
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
