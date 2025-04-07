"use client";

import { Badge } from "@krain/ui/components/ui/badge";
import { Label } from "@krain/ui/components/ui/label";
import { formatNumber } from "@krain/utils";
import { AlertCircle, CheckCircle2, MessageCircle } from "lucide-react";
import { cn } from "@krain/ui/lib/utils";

interface TelegramPointsSectionProps {
  hasJoinedCommunity: boolean;
  hasJoinedAnnouncements: boolean;
  communityPoints: number;
  announcementPoints: number;
  messagePoints: number;
  locale: string;
  isLoadingMessagePoints: boolean;
}

export function TelegramPointsSection({
  hasJoinedCommunity,
  hasJoinedAnnouncements,
  communityPoints,
  announcementPoints,
  messagePoints,
  locale,
  isLoadingMessagePoints,
}: TelegramPointsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 group">
        <MessageCircle className="h-5 w-5 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
        <Label className="font-medium bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
          Telegram Points
        </Label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border/50 bg-card/50 p-3 relative overflow-hidden group backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
              <span className="text-sm font-medium bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
                Community Channel
              </span>
            </div>
            <Badge
              variant={hasJoinedCommunity ? "secondary" : "outline"}
              className={cn(
                "text-center relative overflow-hidden transition-colors",
                hasJoinedCommunity
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                  : "border border-border/50",
              )}
            >
              {formatNumber(communityPoints + messagePoints, locale)} pts
            </Badge>
          </div>
          <div className="flex flex-col gap-2 mt-2 relative z-10">
            {hasJoinedCommunity ? (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform" />
                  <p className="text-xs text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
                    Community channel joined (+5,000 pts)
                  </p>
                </div>
                {isLoadingMessagePoints ? (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />
                    <p className="text-xs text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
                      Loading message points...
                    </p>
                  </div>
                ) : messagePoints > 0 ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform" />
                    <p className="text-xs text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
                      {formatNumber(messagePoints / 250, locale)} messages sent
                      (+{formatNumber(messagePoints, locale)} pts)
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />
                    <p className="text-xs text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
                      Send messages in the community channel to earn points.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />
                <p className="text-xs text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
                  Join community to earn 5,000 points + 250 pts per message
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
              <MessageCircle className="h-4 w-4 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
              <span className="text-sm font-medium bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
                Announcements Channel
              </span>
            </div>
            <Badge
              variant={hasJoinedAnnouncements ? "secondary" : "outline"}
              className={cn(
                "text-center relative overflow-hidden transition-colors",
                hasJoinedAnnouncements
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                  : "border border-border/50",
              )}
            >
              {formatNumber(announcementPoints, locale)} pts
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2 relative z-10">
            {hasJoinedAnnouncements ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform" />
                <p className="text-xs text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
                  Announcements channel joined
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />
                <p className="text-xs text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
                  Join announcements to earn 5,000 points
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
