"use client";

import { useState } from "react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { formatNumber } from "@repo/utils";
import { toast } from "sonner";
import { CheckCircle2, Copy, Link as LinkIcon, Loader2 } from "lucide-react";

interface ReferralProgramCardProps {
  referralsCount: number;
  referralUrl: string;
  locale: string;
  isLoadingWallet: boolean;
  isLoadingReferrals: boolean;
}

export function ReferralProgramCard({
  referralsCount,
  referralUrl,
  locale,
  isLoadingWallet,
  isLoadingReferrals,
}: ReferralProgramCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyReferralLink = async () => {
    if (!referralUrl) return;

    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success("Referral link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy referral link:", error);
      toast.error("Failed to copy referral link");
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            <h2>Referral Program</h2>
          </CardTitle>
          <Badge
            variant={referralsCount > 0 ? "secondary" : "outline"}
            className={`text-lg px-4 py-2 text-center ${isLoadingReferrals ? "animate-pulse" : ""}`}
          >
            {isLoadingReferrals
              ? "Loading..."
              : `${formatNumber(referralsCount, locale)} Referrals`}
          </Badge>
        </div>
        <CardDescription>
          Share your referral link with friends to earn more points. Each
          referral earns you 1,000 points.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <LinkIcon
              className="h-5 w-5 text-primary"
              key="referral-link-icon"
            />
            <Label className="font-medium">Your Referral Link</Label>
            {isLoadingWallet && (
              <Loader2
                className="h-4 w-4 animate-spin ml-auto"
                key="loading-icon"
              />
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={referralUrl}
              placeholder={
                isLoadingWallet
                  ? "Loading your referral link..."
                  : "No referral link available"
              }
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="secondary"
              onClick={handleCopyReferralLink}
              className="min-w-[100px]"
              disabled={isLoadingWallet || !referralUrl}
            >
              {copied ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" key="copy-success-icon" />
                  <span>Copied</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Copy className="h-4 w-4" key="copy-icon" />
                  <span>Copy</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
