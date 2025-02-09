"use client";

import { Badge } from "@krain/ui/components/ui/badge";
import { Label } from "@krain/ui/components/ui/label";
import { formatNumber } from "@krain/utils";
import { XLogo } from "@krain/ui/components/icons/XLogo";
import { AlertCircle, CheckCircle2, Mail, User } from "lucide-react";
import { cn } from "@krain/ui/lib/utils";

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
      <div className="flex items-center gap-2 group">
        <User
          className="h-5 w-5 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300"
          key="profile-section-icon"
        />
        <Label className="font-medium bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
          Profile Points
        </Label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border/50 bg-card/50 p-3 relative overflow-hidden group backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <XLogo
                className="h-4 w-4 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300"
                key="twitter-icon"
              />
              <span className="text-sm font-medium bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
                X Account
              </span>
            </div>
            <Badge
              variant={twitterPoints ? "secondary" : "outline"}
              className={cn(
                "text-center relative overflow-hidden transition-colors",
                twitterPoints
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                  : "border border-border/50",
              )}
            >
              {formatNumber(twitterPoints, locale)} pts
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2 relative z-10">
            {userTwitterUsername ? (
              <div key="twitter-connected" className="flex items-center gap-2">
                <CheckCircle2
                  className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform"
                  key="twitter-check"
                />
                <p className="text-xs text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
                  X account connected
                </p>
              </div>
            ) : (
              <div
                key="twitter-not-connected"
                className="flex items-center gap-2"
              >
                <AlertCircle
                  className="h-4 w-4 text-yellow-500 animate-pulse"
                  key="twitter-alert"
                />
                <p className="text-xs text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
                  Connect X to earn 2,000 points
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/50 p-3 relative overflow-hidden group backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <Mail
                className="h-4 w-4 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300"
                key="email-icon"
              />
              <span className="text-sm font-medium bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
                Email
              </span>
            </div>
            <Badge
              variant={emailPoints ? "secondary" : "outline"}
              className={cn(
                "text-center relative overflow-hidden transition-colors",
                emailPoints
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                  : "border border-border/50",
              )}
            >
              {formatNumber(emailPoints, locale)} pts
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2 relative z-10">
            {userEmailAddress ? (
              <div key="email-connected" className="flex items-center gap-2">
                <CheckCircle2
                  className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform"
                  key="email-check"
                />
                <p className="text-xs text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
                  Email address connected
                </p>
              </div>
            ) : (
              <div
                key="email-not-connected"
                className="flex items-center gap-2"
              >
                <AlertCircle
                  className="h-4 w-4 text-yellow-500 animate-pulse"
                  key="email-alert"
                />
                <p className="text-xs text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
                  Connect email to earn 1,000 points
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
