"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Label } from "@repo/ui/components/ui/label";
import { formatNumber } from "@repo/utils";
import { XLogo } from "@repo/ui/components/icons/XLogo";
import { AlertCircle, CheckCircle2, Mail, User } from "lucide-react";

interface ProfilePointsSectionProps {
  userTwitterUsername: string | undefined;
  userEmailAddress: string | undefined;
  twitterPoints: number;
  emailPoints: number;
  locale: string;
}

export function ProfilePointsSection({
  userTwitterUsername,
  userEmailAddress,
  twitterPoints,
  emailPoints,
  locale,
}: ProfilePointsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5 text-primary" key="profile-section-icon" />
        <Label className="font-medium">Profile Points</Label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XLogo className="h-4 w-4 text-primary" key="twitter-icon" />
              <span className="text-sm font-medium">X Account</span>
            </div>
            <Badge
              variant={twitterPoints ? "secondary" : "outline"}
              className="text-center"
            >
              {formatNumber(twitterPoints, locale)} pts
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {userTwitterUsername ? (
              <div key="twitter-connected" className="flex items-center gap-2">
                <CheckCircle2
                  className="h-4 w-4 text-green-500"
                  key="twitter-check"
                />
                <p className="text-xs text-muted-foreground">
                  X account connected
                </p>
              </div>
            ) : (
              <div
                key="twitter-not-connected"
                className="flex items-center gap-2"
              >
                <AlertCircle
                  className="h-4 w-4 text-yellow-500"
                  key="twitter-alert"
                />
                <p className="text-xs text-muted-foreground">
                  Connect X to earn 2,000 points
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-lg border bg-card/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" key="email-icon" />
              <span className="text-sm font-medium">Email</span>
            </div>
            <Badge
              variant={emailPoints ? "secondary" : "outline"}
              className="text-center"
            >
              {formatNumber(emailPoints, locale)} pts
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {userEmailAddress ? (
              <div key="email-connected" className="flex items-center gap-2">
                <CheckCircle2
                  className="h-4 w-4 text-green-500"
                  key="email-check"
                />
                <p className="text-xs text-muted-foreground">
                  Email address connected
                </p>
              </div>
            ) : (
              <div
                key="email-not-connected"
                className="flex items-center gap-2"
              >
                <AlertCircle
                  className="h-4 w-4 text-yellow-500"
                  key="email-alert"
                />
                <p className="text-xs text-muted-foreground">
                  Connect Email to earn 3,000 points
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
