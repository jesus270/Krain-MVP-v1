"use client";

import { usePrivy } from "@privy-io/react-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { AlertCircle, Wallet as WalletIcon } from "lucide-react";

export function ConnectWalletCard() {
  const { login } = usePrivy();

  return (
    <Card className="border-2 max-w-2xl mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-2">
          <CardTitle className="space-y-2 flex flex-col items-center w-full">
            <h1 className="text-2xl font-bold">$KRAIN Airdrop</h1>
            <h2 className="text-lg font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Login Required for Registration
            </h2>
          </CardTitle>
        </div>
        <CardDescription className="space-y-4 text-base">
          <div className="space-y-1">
            <p className="font-medium">Already registered your wallet?</p>
            <p className="text-muted-foreground">
              Connect your wallet to create an account, check your status, and
              earn more points!
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Haven't registered yet?</p>
            <p className="text-muted-foreground">
              You can still add your wallet to the airdrop list by connecting
              and creating an account.
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Already created an account?</p>
            <p className="text-muted-foreground">
              You can log in by connecting your wallet.
            </p>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" size="lg" onClick={login}>
          <WalletIcon className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
      </CardContent>
    </Card>
  );
}
