"use client";

import { Badge } from "@krain/ui/components/ui/badge";
import { Label } from "@krain/ui/components/ui/label";
import { formatNumber } from "@krain/utils";
import { AlertCircle, CheckCircle2, Share2, User } from "lucide-react";
import { cn } from "@krain/ui/lib/utils";

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
      <div className="flex items-center gap-2 group">
        <Share2
          className="h-5 w-5 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300"
          key="referral-section-icon"
        />
        <Label className="font-medium bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
          Referral Points
        </Label>
      </div>
      <div className="rounded-lg border border-border/50 bg-card/50 p-3 relative overflow-hidden group backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <User
              className="h-4 w-4 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300"
              key="referral-icon"
            />
            <span className="text-sm font-medium bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
              Referrals
            </span>
          </div>
          <Badge
            variant={referralsCount > 0 ? "secondary" : "outline"}
            className={cn(
              "text-center relative overflow-hidden transition-colors",
              isLoading
                ? "animate-pulse bg-muted"
                : referralsCount > 0
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                  : "border border-border/50",
            )}
          >
            {isLoading
              ? "Loading..."
              : `${formatNumber(referralPoints, locale)} pts`}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-2 relative z-10">
          {isLoading ? (
            <div key="referrals-exist" className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              <p className="text-xs text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
                Loading...
              </p>
            </div>
          ) : referralsCount > 0 ? (
            <div key="referrals-exist" className="flex items-center gap-2">
              <CheckCircle2
                className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform"
                key="referral-check"
              />
              <p className="text-xs text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
                {formatNumber(referralsCount, locale)} successful{" "}
                {referralsCount === 1 ? "referral" : "referrals"}
              </p>
            </div>
          ) : (
            <div key="no-referrals" className="flex items-center gap-2">
              <AlertCircle
                className="h-4 w-4 text-yellow-500 animate-pulse"
                key="referral-alert"
              />
              <p className="text-xs text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
                Share your referral link to earn points
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
