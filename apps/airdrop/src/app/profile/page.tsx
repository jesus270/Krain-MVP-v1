"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Badge } from "@repo/ui/components/ui/badge";
import { Separator } from "@repo/ui/components/ui/separator";
import {
  Wallet,
  Mail,
  AlertCircle,
  CheckCircle2,
  XCircle,
  User,
} from "lucide-react";
import { XLogo } from "@repo/ui/components/icons/XLogo";
import { redirect } from "next/navigation";
import { toast } from "sonner";

export default function Profile() {
  const {
    ready,
    authenticated,
    user,
    linkEmail,
    connectWallet,
    unlinkEmail,
    unlinkWallet,
    linkTwitter,
    unlinkTwitter,
  } = usePrivy();

  if (ready && !authenticated) {
    return redirect("/");
  }

  const { wallets: solanaWallets } = useSolanaWallets();

  const handleConnectWallet = async () => {
    try {
      await connectWallet({
        walletList: ["phantom", "detected_solana_wallets"],
      });
      if (solanaWallets[0]) {
        await solanaWallets[0].loginOrLink();
      }
      toast.success("Wallet connected successfully");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet");
    }
  };

  if (!ready) {
    return (
      <main className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={`skeleton-${i}`} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    );
  }

  if (ready && !authenticated) {
    return redirect("/");
  }

  const numAccounts = user?.linkedAccounts?.length || 0;
  const canRemoveAccount = numAccounts > 1;

  const email = user?.email;
  const wallet = user?.wallet;
  const twitterSubject = user?.twitter?.subject || null;

  const totalPoints =
    5000 + // Base points for having an account
    (wallet ? 1000 : 0) + // Additional points for wallet connection
    (twitterSubject ? 2000 : 0) + // Points for Twitter
    (email ? 3000 : 0); // Points for email

  return (
    <main className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold">
              Account Integrations
            </CardTitle>
            <Badge
              variant="secondary"
              className="text-lg px-4 py-2 text-center"
            >
              {totalPoints.toLocaleString()} Points
            </Badge>
          </div>
          <CardDescription>
            Connect your accounts to earn points and unlock features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" key="account-icon" />
                <div>
                  <h3 className="font-semibold">Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Account successfully created
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="whitespace-nowrap">
                  +5,000 points
                </Badge>
                <div className="min-w-[100px] flex justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5" key="wallet-icon" />
                <div>
                  <h3 className="font-semibold">Wallet</h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    {wallet?.address ? (
                      <>
                        {wallet.address.slice(0, 6)}...
                        {wallet.address.slice(-4)}
                      </>
                    ) : (
                      "Not connected"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={wallet ? "secondary" : "outline"}
                  className="whitespace-nowrap"
                >
                  {wallet ? "+1,000 points" : "+1,000 points available"}
                </Badge>
                <Button
                  variant={wallet ? "outline" : "default"}
                  size="sm"
                  onClick={
                    wallet
                      ? () => unlinkWallet(wallet.address)
                      : handleConnectWallet
                  }
                  disabled={wallet && !canRemoveAccount}
                  className="min-w-[100px] justify-center"
                >
                  {wallet ? (
                    <>
                      <XCircle
                        className="h-4 w-4 mr-2"
                        key="unlink-wallet-icon"
                      />
                      Unlink
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        className="h-4 w-4 mr-2"
                        key="connect-wallet-icon"
                      />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XLogo className="h-5 w-5" key="twitter-icon" />
                <div>
                  <h3 className="font-semibold">X Account</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {user?.twitter?.username || "Not connected"}
                    </p>
                    {!user?.twitter?.username && (
                      <p className="text-xs text-muted-foreground">
                        Required for X Engagement Actions
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    typeof twitterSubject === "string" ? "secondary" : "outline"
                  }
                  className="whitespace-nowrap"
                >
                  {twitterSubject ? "+2,000 points" : "+2,000 points available"}
                </Badge>
                <Button
                  variant={
                    typeof twitterSubject === "string" ? "outline" : "default"
                  }
                  size="sm"
                  onClick={
                    twitterSubject
                      ? () => unlinkTwitter(twitterSubject)
                      : linkTwitter
                  }
                  disabled={
                    typeof twitterSubject === "string" && !canRemoveAccount
                  }
                  className="min-w-[100px] justify-center"
                >
                  {twitterSubject ? (
                    <>
                      <XCircle
                        className="h-4 w-4 mr-2"
                        key="unlink-twitter-icon"
                      />
                      Unlink
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        className="h-4 w-4 mr-2"
                        key="connect-twitter-icon"
                      />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" key="email-icon" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-sm text-muted-foreground">
                      {email?.address || "Not connected"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={email ? "secondary" : "outline"}
                    className="whitespace-nowrap"
                  >
                    {email ? "+3,000 points" : "+3,000 points available"}
                  </Badge>
                  <Button
                    variant={email ? "outline" : "default"}
                    size="sm"
                    onClick={
                      email ? () => unlinkEmail(email.address) : linkEmail
                    }
                    disabled={email && !canRemoveAccount}
                    className="min-w-[100px] justify-center"
                  >
                    {email ? (
                      <>
                        <XCircle
                          className="h-4 w-4 mr-2"
                          key="unlink-email-icon"
                        />
                        Unlink
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          className="h-4 w-4 mr-2"
                          key="connect-email-icon"
                        />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {!email && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3" key="alert-icon" />
                  By connecting email, you agree to receive marketing updates
                  from us
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
