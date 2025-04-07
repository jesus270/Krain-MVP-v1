"use client";

import Link from "next/link";
import { Badge } from "@krain/ui/components/ui/badge";
import { Button } from "@krain/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@krain/ui/components/ui/card";
import { formatNumber } from "@krain/utils";
import { ArrowRight } from "lucide-react";
import { BasePointsSection } from "./base-points-section";
import { ReferralPointsSection } from "./referral-points-section";
import { ProfilePointsSection } from "./profile-points-section";
import { ProfileCompletionMessage } from "./profile-completion-message";
import { AdditionalPointsMessage } from "./additional-points-message";
import { cn } from "@krain/ui/lib/utils";
import { TelegramPointsSection } from "./telegram-points-section";
import { Skeleton } from "@krain/ui/components/ui/skeleton";
import { Separator } from "@krain/ui/components/ui/separator";
import { Users, MessageCircle, Trophy } from "lucide-react";
import { TelegramLogo } from "@krain/ui/components/icons/logo-telegram";

const POINTS_PER_REFERRAL = 1000;
const POINTS_PER_TELEGRAM_COMMUNITY = 5000;
const POINTS_PER_TELEGRAM_ANNOUNCEMENT = 5000;

export interface PointsStatusCardProps {
  referralsCount: number;
  hasJoinedTelegramCommunity: boolean;
  hasJoinedTelegramAnnouncement: boolean;
  messagePoints: number;
  isLoadingReferrals: boolean;
  isLoadingMessagePoints: boolean;
  userEmailAddress?: string;
  userTwitterUsername?: string;
  userWalletAddress?: string;
  locale?: string;
  walletConnectionPoints?: number;
  accountCreationPoints?: number;
  twitterPoints?: number;
  emailPoints?: number;
}

export function PointsStatusCard({
  referralsCount,
  hasJoinedTelegramCommunity,
  hasJoinedTelegramAnnouncement,
  messagePoints,
  isLoadingReferrals,
  isLoadingMessagePoints,
  userEmailAddress,
  userTwitterUsername,
  userWalletAddress,
  locale = "en",
  walletConnectionPoints = 0,
  accountCreationPoints = 0,
  twitterPoints = 0,
  emailPoints = 0,
}: PointsStatusCardProps) {
  // Calculate points
  const referralPoints = referralsCount * POINTS_PER_REFERRAL;
  const communityPoints = hasJoinedTelegramCommunity
    ? POINTS_PER_TELEGRAM_COMMUNITY
    : 0;
  const announcementPoints = hasJoinedTelegramAnnouncement
    ? POINTS_PER_TELEGRAM_ANNOUNCEMENT
    : 0;
  const totalPoints =
    walletConnectionPoints +
    accountCreationPoints +
    referralPoints +
    communityPoints +
    announcementPoints +
    messagePoints +
    twitterPoints +
    emailPoints;

  return (
    <Card className="border-2 max-w-2xl mx-auto relative overflow-hidden backdrop-blur-sm bg-background/95 border-border/50">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
      <CardHeader className="space-y-4 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-3xl font-bold">
            <h2 className="bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
              $KRAIN Airdrop Status
            </h2>
          </CardTitle>
          <Badge
            variant={
              totalPoints < 0 || isLoadingReferrals ? "outline" : "secondary"
            }
            className={cn(
              "text-lg px-4 py-2 text-center relative overflow-hidden transition-colors",
              isLoadingReferrals
                ? "animate-pulse bg-muted"
                : totalPoints > 0
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                  : "border border-border/50",
            )}
          >
            {isLoadingReferrals
              ? "Loading..."
              : `${formatNumber(totalPoints, "en")} Points`}
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
      <CardContent className="space-y-6 relative">
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
        <TelegramPointsSection
          hasJoinedCommunity={hasJoinedTelegramCommunity}
          hasJoinedAnnouncements={hasJoinedTelegramAnnouncement}
          communityPoints={communityPoints}
          announcementPoints={announcementPoints}
          messagePoints={messagePoints}
          locale={locale}
          isLoadingMessagePoints={isLoadingMessagePoints}
        />
      </CardContent>
      {userWalletAddress && (
        <CardFooter className="relative">
          <Button
            asChild
            className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
          >
            <Link href="/profile" className="flex items-center justify-center">
              Complete Your Profile
              <ArrowRight className="ml-2 h-4 w-4 group-hover:scale-110 duration-300" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
