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
import { CheckCircle2, Copy, Link as LinkIcon } from "lucide-react";

interface ReferralProgramCardProps {
  referralsCount: number;
  referralUrl: string;
  locale: string;
}

export function ReferralProgramCard({
  referralsCount,
  referralUrl,
  locale,
}: ReferralProgramCardProps) {
  const [copied, setCopied] = useState(false);
  const isLoading = !referralUrl;

  const handleCopyReferralLink = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success("Referral link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">
              <h2>Referral Program</h2>
            </CardTitle>
            <CardDescription>
              Invite friends to earn 1,000 points per referral
            </CardDescription>
          </div>
          {referralsCount > 0 && (
            <Badge variant="secondary" className="px-4 py-2">
              {formatNumber(referralsCount, locale)} Referrals
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            <Label className="font-medium">Your Referral Link</Label>
          </div>
          <div className="flex gap-2">
            <Input
              value={referralUrl}
              placeholder={
                isLoading
                  ? "Loading your referral link..."
                  : "No referral link available"
              }
              readOnly
              className={`font-mono text-sm ${isLoading ? "animate-pulse" : ""}`}
            />
            <Button
              variant="secondary"
              onClick={handleCopyReferralLink}
              className="min-w-[100px]"
              disabled={isLoading}
            >
              {copied ? (
                <div key="copied" className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Copied</span>
                </div>
              ) : (
                <div key="copy" className="flex items-center gap-2">
                  <Copy className="h-4 w-4" />
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
