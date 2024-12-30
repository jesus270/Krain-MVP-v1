"use client";

import { Badge } from "@krain/ui/components/ui/badge";
import { Label } from "@krain/ui/components/ui/label";
import { formatNumber } from "@krain/utils";
import { AlertCircle, CheckCircle2, Share2, User } from "lucide-react";

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
        <Share2 className="h-5 w-5 text-primary" key="referral-section-icon" />
        <Label className="font-medium">Referral Points</Label>
      </div>
      <div className="rounded-lg border bg-card/50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" key="referral-icon" />
            <span className="text-sm font-medium">Referrals</span>
          </div>
          <Badge
            variant={referralsCount > 0 ? "secondary" : "outline"}
            className={`text-center ${isLoading ? "animate-pulse bg-muted" : ""}`}
          >
            {isLoading
              ? "Loading..."
              : `${formatNumber(referralPoints, locale)} pts`}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {isLoading ? (
            <div key="referrals-exist" className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          ) : referralsCount > 0 ? (
            <div key="referrals-exist" className="flex items-center gap-2">
              <CheckCircle2
                className="h-4 w-4 text-green-500"
                key="referral-check"
              />
              <p className="text-xs text-muted-foreground">
                {formatNumber(referralsCount, locale)} successful{" "}
                {referralsCount === 1 ? "referral" : "referrals"}
              </p>
            </div>
          ) : (
            <div key="no-referrals" className="flex items-center gap-2">
              <AlertCircle
                className="h-4 w-4 text-yellow-500"
                key="referral-alert"
              />
              <p className="text-xs text-muted-foreground">
                Share your referral link to earn points
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
