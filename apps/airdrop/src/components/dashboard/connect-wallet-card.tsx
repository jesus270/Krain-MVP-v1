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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" key="alert-icon" />
          <CardTitle>Connect Your Wallet</CardTitle>
        </div>
        <CardDescription>
          Connect your wallet to start earning points and participate in the
          airdrop.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" size="lg" onClick={login}>
          <WalletIcon className="h-4 w-4 mr-2" key="wallet-icon" />
          Connect Wallet
        </Button>
      </CardContent>
    </Card>
  );
}
