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
import { log } from "@/lib/logger";

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      log.error(error, {
        operation: "copy_referral_link",
        entity: "CLIENT",
      });
      toast.error("Failed to copy referral link");
    }
  };

  return (
    <Card
      className={`border-2 max-w-2xl mx-auto ${isLoadingWallet || isLoadingReferrals ? "opacity-80" : ""}`}
    >
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Referral Program</CardTitle>
        <CardDescription>
          Share your referral link to earn more points! You'll earn 1,000 points
          for each successful referral.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Your Referral Link</Label>
            <Badge
              variant={referralsCount > 0 ? "secondary" : "outline"}
              className={isLoadingReferrals ? "animate-pulse bg-muted" : ""}
            >
              {isLoadingReferrals
                ? "Loading..."
                : `${formatNumber(referralsCount, locale)} ${
                    referralsCount === 1 ? "Referral" : "Referrals"
                  }`}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Input
              value={referralUrl}
              readOnly
              placeholder={
                isLoadingWallet
                  ? "Loading..."
                  : "Connect wallet to get your referral link"
              }
              className={isLoadingWallet ? "animate-pulse bg-muted" : ""}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              disabled={!referralUrl || isLoadingWallet}
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : isLoadingWallet ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            <Label>How It Works</Label>
          </div>
          <div className="grid gap-4">
            <div className="rounded-lg border bg-card/50 p-3">
              <p className="text-sm">
                Share your unique referral link with friends. When they connect
                their wallet and create an account using your link, you'll earn
                1,000 points for each successful referral.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
