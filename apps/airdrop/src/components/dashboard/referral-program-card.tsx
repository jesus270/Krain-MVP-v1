"use client";

import { useState } from "react";
import { Badge } from "@krain/ui/components/ui/badge";
import { Button } from "@krain/ui/components/ui/button";
import { Input } from "@krain/ui/components/ui/input";
import { Label } from "@krain/ui/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@krain/ui/components/ui/card";
import { formatNumber } from "@krain/utils";
import { toast } from "sonner";
import { CheckCircle2, Copy, Link as LinkIcon, Loader2 } from "lucide-react";
import { log } from "@krain/utils";
import { cn } from "@krain/ui/lib/utils";

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
      className={cn(
        "border-2 max-w-2xl mx-auto relative overflow-hidden backdrop-blur-sm bg-background/95 border-border/50",
        (isLoadingWallet || isLoadingReferrals) && "opacity-80",
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
      <CardHeader className="relative">
        <CardTitle className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
            Referral Program
          </span>
        </CardTitle>
        <CardDescription className="text-muted-foreground/90">
          Share your referral link to earn more points! You'll earn 1,000 points
          for each successful referral.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 relative">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
              Your Referral Link
            </Label>
            <Badge
              variant={referralsCount > 0 ? "secondary" : "outline"}
              className={cn(
                "text-center relative overflow-hidden transition-colors",
                isLoadingReferrals
                  ? "animate-pulse bg-muted"
                  : referralsCount > 0
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                    : "border border-border/50",
              )}
            >
              {isLoadingReferrals
                ? "Loading..."
                : `${formatNumber(referralsCount, locale)} ${
                    referralsCount === 1 ? "Referral" : "Referrals"
                  }`}
            </Badge>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x opacity-50 rounded-md pointer-events-none" />
              <Input
                value={referralUrl}
                readOnly
                placeholder={
                  isLoadingWallet
                    ? "Loading..."
                    : "Connect wallet to get your referral link"
                }
                className={cn(
                  "relative z-10 bg-transparent backdrop-blur-sm border-border/50",
                  isLoadingWallet && "animate-pulse bg-muted",
                )}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              disabled={!referralUrl || isLoadingWallet}
              className="group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {copied ? (
                <CheckCircle2 className="h-4 w-4 relative z-10 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
              ) : isLoadingWallet ? (
                <Loader2 className="h-4 w-4 animate-spin relative z-10 text-primary/80" />
              ) : (
                <Copy className="h-4 w-4 relative z-10 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
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
