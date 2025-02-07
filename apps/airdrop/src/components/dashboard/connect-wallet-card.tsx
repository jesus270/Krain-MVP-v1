"use client";

import { usePrivy } from "@privy-io/react-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@krain/ui/components/ui/card";
import { Button } from "@krain/ui/components/ui/button";
import { AlertCircle, Wallet as WalletIcon } from "lucide-react";

export function ConnectWalletCard() {
  const { login, authenticated } = usePrivy();

  // Don't show the card if already authenticated
  if (authenticated) {
    return null;
  }

  return (
    <Card className="border-2 max-w-2xl mx-auto relative overflow-hidden backdrop-blur-sm bg-background/95 border-border/50">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
      <CardHeader className="space-y-4 relative">
        <div className="flex items-center gap-2">
          <CardTitle className="space-y-2 flex flex-col items-center w-full">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
              $KRAIN Airdrop
            </h1>
            <h2 className="text-lg font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />
              <span className="bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
                Login Required for Registration
              </span>
            </h2>
          </CardTitle>
        </div>
        <CardDescription className="space-y-4 text-base">
          <div className="space-y-1 group">
            <p className="font-bold text-lg bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
              Already registered your wallet?
            </p>
            <p className="text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
              Connect your wallet to create an account, check your status, and
              earn more points!
            </p>
          </div>
          <div className="space-y-1 group">
            <p className="font-bold text-lg bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
              Haven't registered yet?
            </p>
            <p className="text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
              You can still add your wallet to the airdrop list by connecting
              and creating an account.
            </p>
          </div>
          <div className="space-y-1 group">
            <p className="font-bold text-lg bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
              Already created an account?
            </p>
            <p className="text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
              You can log in by connecting your wallet.
            </p>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <Button
          className="w-full group relative overflow-hidden"
          size="lg"
          onClick={login}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <WalletIcon className="h-4 w-4 mr-2 relative z-10 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
          <span className="relative z-10 bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-blue-500 transition-all">
            Connect Wallet
          </span>
        </Button>
      </CardContent>
    </Card>
  );
}
