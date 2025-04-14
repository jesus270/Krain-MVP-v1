"use client";

import { usePrivyAuth } from "@krain/ui/hooks/index";
import { useSolanaWallets } from "@privy-io/react-auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@krain/ui/components/ui/card";
import { Button } from "@krain/ui/components/ui/button";
import { Skeleton } from "@krain/ui/components/ui/skeleton";
import { Badge } from "@krain/ui/components/ui/badge";
import { Separator } from "@krain/ui/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@krain/ui/components/ui/tooltip";
import {
  Wallet,
  Mail,
  AlertCircle,
  CheckCircle2,
  XCircle,
  User as UserIcon,
  MessageCircle,
} from "lucide-react";
import { XLogo } from "@krain/ui/components/icons/XLogo";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { log } from "@krain/utils";
import { cn } from "@krain/ui/lib/utils";

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
  } = usePrivyAuth();
  const { wallets: solanaWallets } = useSolanaWallets();

  if (ready && !authenticated) {
    return redirect("/");
  }

  const handleConnectWallet = async () => {
    try {
      await connectWallet({
        walletList: ["phantom", "detected_solana_wallets"],
      });
      if (solanaWallets[0]) {
        log.info("Solana wallet detected post-connection", {
          entity: "CLIENT",
          operation: "connect_wallet_solana_check",
          walletAddress: solanaWallets[0].address,
        });
      }
      toast.success("Wallet connected successfully");
    } catch (error) {
      log.error("Error connecting wallet", {
        entity: "CLIENT",
        operation: "connect_wallet",
        error,
      });
      toast.error("Failed to connect wallet");
    }
  };

  if (!ready || !user) {
    return (
      <main className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-2xl mx-auto border-2 backdrop-blur-xs bg-background/95 border-border/50">
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
  const twitterUsername = user?.twitter?.username || null;

  const totalPoints =
    5000 + // Base points for having an account
    (wallet ? 1000 : 0) + // Additional points for wallet connection
    (twitterUsername ? 2000 : 0) + // Points for Twitter
    (email ? 3000 : 0) + // Points for email
    ((user?.hasJoinedTelegramCommunity ?? false) ? 5000 : 0) + // Points for Telegram Community
    ((user?.hasJoinedTelegramAnnouncement ?? false) ? 5000 : 0); // Points for Telegram Announcement

  return (
    <main className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto border-2 relative overflow-hidden backdrop-blur-xs bg-background/95 border-border/50">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
        <CardHeader className="space-y-2 relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
                Account Integrations
              </span>
            </CardTitle>
            <Badge
              variant="secondary"
              className={cn(
                "text-lg px-4 py-2 text-center relative overflow-hidden",
                "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0",
              )}
            >
              {totalPoints.toLocaleString()} Points
            </Badge>
          </div>
          <CardDescription className="text-muted-foreground/90">
            Connect your accounts to earn points and unlock features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative">
          <div className="rounded-lg border bg-card/50 p-6 space-y-6 relative overflow-hidden backdrop-blur-xs">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient-x" />
            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-2 group">
                <UserIcon className="h-5 w-5 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
                <div>
                  <h3 className="font-semibold bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
                    Account
                  </h3>
                  <p className="text-sm text-muted-foreground/90">
                    Account successfully created
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="whitespace-nowrap bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                >
                  +5,000 points
                </Badge>
                <div className="min-w-[100px] flex justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-2 group">
                <Wallet className="h-5 w-5 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
                <div>
                  <h3 className="font-semibold bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
                    Wallet
                  </h3>
                  <p className="text-sm text-muted-foreground/90 font-mono">
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
                  className={cn(
                    "whitespace-nowrap",
                    wallet
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                      : "border border-border/50",
                  )}
                >
                  {wallet ? "+1,000 points" : "+1,000 points available"}
                </Badge>
                {wallet ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              wallet?.address && unlinkWallet(wallet.address)
                            }
                            disabled={!canRemoveAccount}
                            className={cn(
                              "min-w-[100px] justify-center group relative overflow-hidden cursor-pointer",
                              "disabled:cursor-not-allowed",
                            )}
                          >
                            <div className="flex items-center">
                              <XCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                              Unlink
                            </div>
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>At least one account must remain connected</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleConnectWallet}
                    className={cn(
                      "min-w-[100px] justify-center group relative overflow-hidden cursor-pointer",
                      "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0",
                    )}
                  >
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                      Connect
                    </div>
                  </Button>
                )}
              </div>
            </div>

            <Separator className="bg-border/50" />

            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-2 group">
                <XLogo className="h-5 w-5 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
                <div>
                  <h3 className="font-semibold bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
                    X Account
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground/90">
                      {twitterUsername || "Not connected"}
                    </p>
                    {!twitterUsername && (
                      <p className="text-xs text-muted-foreground/80">
                        Required for X Engagement Actions
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={twitterUsername ? "secondary" : "outline"}
                  className={cn(
                    "whitespace-nowrap",
                    twitterUsername
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                      : "border border-border/50",
                  )}
                >
                  {twitterUsername
                    ? "+2,000 points"
                    : "+2,000 points available"}
                </Badge>
                {twitterUsername ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              twitterSubject && unlinkTwitter(twitterSubject)
                            }
                            disabled={!canRemoveAccount}
                            className={cn(
                              "min-w-[100px] justify-center group relative overflow-hidden cursor-pointer",
                              "disabled:cursor-not-allowed",
                            )}
                          >
                            <div className="flex items-center">
                              <XCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                              Unlink
                            </div>
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>At least one account must remain connected</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={linkTwitter}
                    className={cn(
                      "min-w-[100px] justify-center group relative overflow-hidden cursor-pointer",
                      "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0",
                    )}
                  >
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                      Connect
                    </div>
                  </Button>
                )}
              </div>
            </div>

            <Separator className="bg-border/50" />

            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-2 group">
                <Mail className="h-5 w-5 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
                <div>
                  <h3 className="font-semibold bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
                    Email
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground/90">
                      {email?.address || "Not connected"}
                    </p>
                    {!email && (
                      <p className="text-xs text-muted-foreground/80">
                        Required for important updates
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={email ? "secondary" : "outline"}
                  className={cn(
                    "whitespace-nowrap",
                    email
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                      : "border border-border/50",
                  )}
                >
                  {email ? "+3,000 points" : "+3,000 points available"}
                </Badge>
                {email ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              email?.address && unlinkEmail(email.address)
                            }
                            disabled={!canRemoveAccount}
                            className={cn(
                              "min-w-[100px] justify-center group relative overflow-hidden cursor-pointer",
                              "disabled:cursor-not-allowed",
                            )}
                          >
                            <div className="flex items-center">
                              <XCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                              Unlink
                            </div>
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>At least one account must remain connected</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={linkEmail}
                    className={cn(
                      "min-w-[100px] justify-center group relative overflow-hidden cursor-pointer",
                      "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0",
                    )}
                  >
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                      Connect
                    </div>
                  </Button>
                )}
              </div>
            </div>

            <Separator className="bg-border/50" />

            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-2 group">
                <MessageCircle className="h-5 w-5 text-primary/80 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
                <div>
                  <h3 className="font-semibold bg-gradient-to-r from-purple-500/90 to-blue-500/90 bg-clip-text text-transparent">
                    Telegram Channels
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground/90">
                      {user?.telegramUsername || "Not connected"}
                    </p>
                    {!user?.telegramUsername && (
                      <p className="text-xs text-muted-foreground/80">
                        Join our Telegram channels and verify with our bot
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      (user?.hasJoinedTelegramCommunity ?? false)
                        ? "secondary"
                        : "outline"
                    }
                    className={cn(
                      "whitespace-nowrap",
                      (user?.hasJoinedTelegramCommunity ?? false)
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                        : "border border-border/50",
                    )}
                  >
                    {(user?.hasJoinedTelegramCommunity ?? false)
                      ? "+5,000 points"
                      : "+5,000 points available"}
                  </Badge>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() =>
                      window.open("https://t.me/kraincommunity", "_blank")
                    }
                    className={cn(
                      "min-w-[100px] justify-center group relative overflow-hidden cursor-pointer",
                      "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0",
                    )}
                  >
                    {(user?.hasJoinedTelegramCommunity ?? false) ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform duration-300" />
                        Joined Community
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                        Join Community
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      (user?.hasJoinedTelegramAnnouncement ?? false)
                        ? "secondary"
                        : "outline"
                    }
                    className={cn(
                      "whitespace-nowrap",
                      (user?.hasJoinedTelegramAnnouncement ?? false)
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                        : "border border-border/50",
                    )}
                  >
                    {(user?.hasJoinedTelegramAnnouncement ?? false)
                      ? "+5,000 points"
                      : "+5,000 points available"}
                  </Badge>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() =>
                      window.open("https://t.me/krainofficial", "_blank")
                    }
                    className={cn(
                      "min-w-[100px] justify-center group relative overflow-hidden cursor-pointer",
                      "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0",
                    )}
                  >
                    {(user?.hasJoinedTelegramAnnouncement ?? false) ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform duration-300" />
                        Joined Announcements
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                        Join Announcements
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
