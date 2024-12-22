"use client";

import Link from "next/link";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { formatNumber } from "@repo/utils";
import { ArrowRight } from "lucide-react";
import { BasePointsSection } from "./base-points-section";
import { ReferralPointsSection } from "./referral-points-section";
import { ProfilePointsSection } from "./profile-points-section";
import { ProfileCompletionMessage } from "./profile-completion-message";
import { AdditionalPointsMessage } from "./additional-points-message";

interface PointsStatusCardProps {
  totalPoints: number;
  userWalletAddress: string | undefined;
  userEmailAddress: string | undefined;
  userTwitterUsername: string | undefined;
  referralsCount: number;
  walletConnectionPoints: number;
  accountCreationPoints: number;
  referralPoints: number;
  twitterPoints: number;
  emailPoints: number;
  locale: string;
  isLoadingReferrals: boolean;
}

export function PointsStatusCard({
  totalPoints,
  userWalletAddress,
  userEmailAddress,
  userTwitterUsername,
  referralsCount,
  walletConnectionPoints,
  accountCreationPoints,
  referralPoints,
  twitterPoints,
  emailPoints,
  locale,
  isLoadingReferrals,
}: PointsStatusCardProps) {
  return (
    <Card className="border-2">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-3xl font-bold">
            <h2>$KRAIN Airdrop Status</h2>
          </CardTitle>
          <Badge
            variant={totalPoints > 0 ? "secondary" : "outline"}
            className={`text-lg px-4 py-2 text-center ${isLoadingReferrals ? "animate-pulse" : ""}`}
          >
            {isLoadingReferrals
              ? "Calculating points..."
              : `${formatNumber(totalPoints, locale)} Points`}
          </Badge>
        </div>
        <CardDescription>
          <div className="space-y-4">
            <ProfileCompletionMessage
              show={!userEmailAddress || !userTwitterUsername}
            />
            <AdditionalPointsMessage />
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <BasePointsSection
          userWalletAddress={userWalletAddress}
          locale={locale}
          walletConnectionPoints={walletConnectionPoints}
          accountCreationPoints={accountCreationPoints}
        />
        <ReferralPointsSection
          referralsCount={referralsCount}
          referralPoints={referralPoints}
          locale={locale}
          isLoading={isLoadingReferrals}
        />
        <ProfilePointsSection
          userTwitterUsername={userTwitterUsername}
          userEmailAddress={userEmailAddress}
          twitterPoints={twitterPoints}
          emailPoints={emailPoints}
          locale={locale}
        />
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        {(!userEmailAddress || !userTwitterUsername) && (
          <Button className="w-full" asChild>
            <Link href="/profile">
              Complete Your Profile
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
