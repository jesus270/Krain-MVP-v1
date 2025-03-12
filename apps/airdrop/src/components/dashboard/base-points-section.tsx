"use client";

import { Badge } from "@krain/ui/components/ui/badge";
import { Label } from "@krain/ui/components/ui/label";
import { formatNumber } from "@krain/utils";
import {
  AlertCircle,
  CheckCircle2,
  Coins,
  User,
  Wallet as WalletIcon,
} from "lucide-react";
import { cn } from "@krain/ui/lib/utils";

interface BasePointsSectionProps {
  userWalletAddress: string | undefined;
  locale: string;
  walletConnectionPoints: number;
  accountCreationPoints: number;
}

export function BasePointsSection({
  userWalletAddress,
  locale,
  walletConnectionPoints,
  accountCreationPoints,
}: BasePointsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 group">
        <Coins className="h-5 w-5 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
        <Label className="font-medium bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
          Base Points
        </Label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border/50 bg-card p-3 relative overflow-hidden group backdrop-blur-xs">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <WalletIcon className="h-4 w-4 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
              <span className="text-sm font-medium bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
                Add Wallet
              </span>
            </div>
            <Badge
              variant={walletConnectionPoints ? "secondary" : "outline"}
              className={cn(
                "text-center relative overflow-hidden transition-colors",
                walletConnectionPoints
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                  : "border border-border/50",
              )}
            >
              {formatNumber(walletConnectionPoints, locale)} pts
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2 relative z-10">
            {userWalletAddress ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform" />
                <p className="text-xs text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
                  Wallet successfully connected
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />
                <p className="text-xs text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
                  Connect your wallet to earn points
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-border/50 bg-card p-3 relative overflow-hidden group backdrop-blur-xs">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
              <span className="text-sm font-medium bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
                Create Account
              </span>
            </div>
            <Badge
              variant={accountCreationPoints ? "secondary" : "outline"}
              className={cn(
                "text-center relative overflow-hidden transition-colors",
                accountCreationPoints
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                  : "border border-border/50",
              )}
            >
              {formatNumber(accountCreationPoints, locale)} pts
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2 relative z-10">
            <CheckCircle2 className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform" />
            <p className="text-xs text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
              Account successfully created
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
