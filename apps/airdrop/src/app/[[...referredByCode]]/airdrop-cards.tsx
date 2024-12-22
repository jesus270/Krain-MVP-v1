"use client";

import { LoginCard } from "@/components/login-card";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@repo/ui/components/ui/card";
import {
  getWallet,
  handleSubmitWallet,
  updateWalletReferredByCode,
} from "@/actions/wallet";
import { useEffect, useState } from "react";
import { Wallet } from "@repo/database";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { toast } from "sonner";
import { Label } from "@repo/ui/components/ui/label";
import { getReferralsCount } from "@/actions/referral";
import { formatNumber, useLocale } from "@repo/utils";
import { Badge } from "@repo/ui/components/ui/badge";
import { Progress } from "@repo/ui/components/ui/progress";
import {
  Coins,
  Users,
  Link as LinkIcon,
  Copy,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Twitter,
  Mail,
  Wallet as WalletIcon,
  User,
  Share2,
} from "lucide-react";

type WalletState = {
  address: string;
  referralsCount: number;
  referralCode: string;
} | null;

export function AirdropCards({
  referredByCode,
}: {
  referredByCode: string | undefined;
}) {
  const { user, ready, authenticated, login } = usePrivy();
  const [wallet, setWallet] = useState<Wallet | undefined>(undefined);
  const [referralsCount, setReferralsCount] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const locale = useLocale();

  const userEmailAddress = user?.email?.address;
  const userWalletAddress = user?.wallet?.address;
  const userTwitterUsername = user?.twitter?.username;

  useEffect(() => {
    if (!user?.wallet?.address) return;
    handleSubmitWallet({ address: user?.wallet?.address, referredByCode });
  }, [referredByCode, user?.wallet?.address]);

  useEffect(() => {
    if (!userWalletAddress) return;
    getWallet({ address: userWalletAddress }).then(setWallet);
  }, [userWalletAddress]);

  useEffect(() => {
    if (!userWalletAddress) return;
    getReferralsCount(userWalletAddress).then(setReferralsCount);
  }, [userWalletAddress]);

  if (!ready) return null;
  if (ready && (!authenticated || !userWalletAddress)) {
    return (
      <main className="container mx-auto p-4">
        <Card className="border-2 max-w-2xl mx-auto">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-2xl">
                $KRAIN Airdrop Public Registration Closed
              </CardTitle>
            </div>
            <CardDescription className="space-y-4 text-base">
              <div className="space-y-1">
                <p className="font-medium">Already registered your wallet?</p>
                <p className="text-muted-foreground">
                  Connect your wallet to create an account, check your status,
                  and earn more points!
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Haven't registered yet?</p>
                <p className="text-muted-foreground">
                  You can still add your wallet to the airdrop list by
                  connecting and creating an account.
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
      </main>
    );
  }

  const message = () => {
    if (ready && authenticated && (!userEmailAddress || !userTwitterUsername)) {
      return (
        <div className="flex items-start gap-2 text-muted-foreground">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
          <p className="font-medium">
            Your wallet is connected and ready for the Airdrop!
          </p>
          <AlertCircle className="h-5 w-5 shrink-0 text-yellow-500" />
          <p>
            Complete your{" "}
            <Link
              href="/profile"
              className="text-blue-300 hover:underline font-medium"
            >
              Profile
            </Link>{" "}
            to be eligible for more points!
          </p>
        </div>
      );
    }

    if (userEmailAddress && userTwitterUsername) {
      return (
        <div className="flex items-start gap-2 text-muted-foreground">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
          <p>Your wallet is connected and ready for the Airdrop</p>
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
          <p>
            Your{" "}
            <Link
              href="/profile"
              className="text-blue-300 hover:underline font-medium"
            >
              Profile
            </Link>{" "}
            is complete!
          </p>
        </div>
      );
    }
  };

  const walletConnectionPoints = 1000;
  const accountCreationPoints = 5000;
  const basePoints = walletConnectionPoints + accountCreationPoints;
  const referralPoints = referralsCount * 1000;
  const twitterPoints = userTwitterUsername ? 2000 : 0;
  const emailPoints = userEmailAddress ? 3000 : 0;
  const totalPoints = basePoints + referralPoints + twitterPoints + emailPoints;

  const formattedTotalPoints = formatNumber(totalPoints, locale);
  const formattedReferralsCount = formatNumber(referralsCount, locale);

  const handleCopyReferralLink = () => {
    if (wallet?.referralCode) {
      navigator.clipboard.writeText(
        `https://airdrop.krain.ai/${wallet?.referralCode}`,
      );
      setCopied(true);
      toast.success("Referral link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const referralUrl = wallet?.referralCode
    ? `https://airdrop.krain.ai/${wallet?.referralCode}`
    : "";

  return (
    <main className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-2">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold">
                <h2>$KRAIN Airdrop Status</h2>
              </CardTitle>
              <Badge
                variant={totalPoints > 0 ? "secondary" : "outline"}
                className="text-lg px-4 py-2 text-center"
              >
                {formattedTotalPoints} Points
              </Badge>
            </div>
            <CardDescription>{message()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                <Label className="font-medium">Base Points</Label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-card/50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <WalletIcon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Add Wallet</span>
                    </div>
                    <Badge
                      variant={userWalletAddress ? "secondary" : "outline"}
                      className="text-center"
                    >
                      {formatNumber(walletConnectionPoints, locale)} pts
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Earned by adding your wallet
                  </p>
                </div>
                <div className="rounded-lg border bg-card/50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        Create Account
                      </span>
                    </div>
                    <Badge
                      variant={userWalletAddress ? "secondary" : "outline"}
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

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <Label className="font-medium">Referral Points</Label>
              </div>
              <div className="rounded-lg border bg-card/50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Referrals</span>
                  </div>
                  <Badge
                    variant={referralsCount > 0 ? "secondary" : "outline"}
                    className="text-center"
                  >
                    {formatNumber(referralPoints, locale)} pts
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {referralsCount > 0
                    ? `Earned from ${formatNumber(referralsCount, locale)} referral${referralsCount === 1 ? "" : "s"}`
                    : "Earn 1,000 points for each friend you refer"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <Label className="font-medium">Profile Points</Label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-card/50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Twitter className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Twitter</span>
                    </div>
                    <Badge
                      variant={userTwitterUsername ? "secondary" : "outline"}
                      className="text-center"
                    >
                      {formatNumber(twitterPoints, locale)} pts
                    </Badge>
                  </div>
                  {!userTwitterUsername && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Connect Twitter to earn 2,000 points
                    </p>
                  )}
                </div>
                <div className="rounded-lg border bg-card/50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <Badge
                      variant={userEmailAddress ? "secondary" : "outline"}
                      className="text-center"
                    >
                      {formatNumber(emailPoints, locale)} pts
                    </Badge>
                  </div>
                  {!userEmailAddress && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Connect Email to earn 3,000 points
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* <Progress value={(totalPoints / 15000) * 100} className="h-2" /> */}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            {/* <div className="w-full flex items-center justify-between px-1 text-sm text-muted-foreground">
              <span>Total Progress</span>
              <span className="font-mono">
                {formatNumber(totalPoints, locale)} / 15,000 points
              </span>
            </div> */}
            {(!userEmailAddress || !userTwitterUsername) && (
              <Button className="w-full" asChild>
                <Link href="/profile">
                  Complete Your Profile
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">
                  <h2>Referral Program</h2>
                </CardTitle>
                <CardDescription>
                  Invite friends to earn 1,000 points per referral
                </CardDescription>
              </div>
              {referralsCount > 0 && (
                <Badge variant="secondary" className="px-4 py-2">
                  {formattedReferralsCount} Referrals
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                <Label className="font-medium">Your Referral Link</Label>
              </div>
              <div className="flex gap-2">
                <Input
                  value={referralUrl}
                  placeholder="Loading..."
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="secondary"
                  onClick={handleCopyReferralLink}
                  className="min-w-[100px]"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
