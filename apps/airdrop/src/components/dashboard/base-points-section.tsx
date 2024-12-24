"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Label } from "@repo/ui/components/ui/label";
import { formatNumber } from "@repo/utils";
import {
  AlertCircle,
  CheckCircle2,
  Coins,
  User,
  Wallet as WalletIcon,
} from "lucide-react";

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
      <div className="flex items-center gap-2">
        <Coins className="h-5 w-5 text-primary" key="base-points-icon" />
        <Label className="font-medium">Base Points</Label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WalletIcon className="h-4 w-4 text-primary" key="wallet-icon" />
              <span className="text-sm font-medium">Add Wallet</span>
            </div>
            <Badge
              variant={walletConnectionPoints ? "secondary" : "outline"}
              className="text-center"
            >
              {formatNumber(walletConnectionPoints, locale)} pts
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {userWalletAddress ? (
              <div key="wallet-connected" className="flex items-center gap-2">
                <CheckCircle2
                  className="h-4 w-4 text-green-500"
                  key="wallet-check"
                />
                <p className="text-xs text-muted-foreground">
                  Wallet successfully connected
                </p>
              </div>
            ) : (
              <div
                key="wallet-not-connected"
                className="flex items-center gap-2"
              >
                <AlertCircle
                  className="h-4 w-4 text-yellow-500"
                  key="wallet-alert"
                />
                <p className="text-xs text-muted-foreground">
                  Connect your wallet to earn points
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-lg border bg-card/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" key="account-icon" />
              <span className="text-sm font-medium">Create Account</span>
            </div>
            <Badge
              variant={accountCreationPoints ? "secondary" : "outline"}
              className="text-center"
            >
              {formatNumber(accountCreationPoints, locale)} pts
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Earned by creating your account
          </p>
        </div>
      </div>
    </div>
  );
}
