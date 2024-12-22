"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useWallets, useSolanaWallets } from "@privy-io/react-auth";
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
  Twitter,
  Mail,
  AlertCircle,
  CheckCircle2,
  XCircle,
  XIcon,
} from "lucide-react";
import { XLogo } from "@repo/ui/components/icons/XLogo";
export default function Profile() {
  const {
    ready,
    authenticated,
    user,
    logout,
    linkEmail,
    connectWallet,
    unlinkEmail,
    unlinkPhone,
    unlinkWallet,
    linkGoogle,
    unlinkGoogle,
    linkTwitter,
    unlinkTwitter,
    linkDiscord,
    unlinkDiscord,
  } = usePrivy();

  const { wallets: solanaWallets } = useSolanaWallets();

  const handleConnectWallet = async () => {
    try {
      await connectWallet({
        walletList: ["phantom", "detected_solana_wallets"],
      });
      if (solanaWallets[0]) {
        await solanaWallets[0].loginOrLink();
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
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

  const numAccounts = user?.linkedAccounts?.length || 0;
  const canRemoveAccount = numAccounts > 1;

  const email = user?.email;
  const wallet = user?.wallet;
  const twitterSubject = user?.twitter?.subject || null;

  const totalPoints =
    (wallet ? 6000 : 0) + (twitterSubject ? 2000 : 0) + (email ? 3000 : 0);

  return (
    <main className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold">
              Account Integrations
            </CardTitle>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {totalPoints.toLocaleString()} Points
            </Badge>
          </div>
          <CardDescription>
            Connect your accounts to earn points and unlock features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-card p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  <h3 className="font-semibold">Wallet</h3>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  {wallet?.address ? (
                    <>
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </>
                  ) : (
                    "Not connected"
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {wallet ? (
                  <>
                    <Badge variant="secondary">+6,000 points</Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => unlinkWallet(wallet.address)}
                      disabled={!canRemoveAccount}
                    >
                      <XCircle className="h-4 w-4" />
                      Unlink
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={handleConnectWallet}>
                    <CheckCircle2 className="h-4 w-4" />
                    Connect
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <XLogo className="h-5 w-5" />
                  <h3 className="font-semibold">X.com</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {user?.twitter?.username ?? "Not connected"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {twitterSubject ? (
                  <>
                    <Badge variant="secondary">+2,000 points</Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => unlinkTwitter(twitterSubject)}
                      disabled={!canRemoveAccount}
                    >
                      <XCircle className="h-4 w-4" />
                      Unlink
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={linkTwitter}>
                    <CheckCircle2 className="h-4 w-4" />
                    Connect
                  </Button>
                )}
              </div>
            </div>

            <Separator />
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    <h3 className="font-semibold">Email</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {user?.email?.address ?? "Not connected"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {email ? (
                    <>
                      <Badge variant="secondary">+3,000 points</Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => unlinkEmail(email.address)}
                        disabled={!canRemoveAccount}
                      >
                        <XCircle className="h-4 w-4" />
                        Unlink
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={linkEmail}>
                      <CheckCircle2 className="h-4 w-4" />
                      Connect
                    </Button>
                  )}
                </div>
              </div>
              {!email && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3" />
                  By connecting email, you agree to receive updates from us
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
