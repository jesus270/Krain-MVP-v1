"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { Wallet } from "@repo/database";
import { useLocale } from "@repo/utils";
import { getWallet, handleSubmitWallet } from "@/actions/wallet";
import { getReferralsCount } from "@/actions/referral";
import { ConnectWalletCard } from "@/components/dashboard/connect-wallet-card";
import { PointsStatusCard } from "@/components/dashboard/points-status-card";
import { ReferralProgramCard } from "@/components/dashboard/referral-program-card";

export function Dashboard({
  referredByCode,
}: {
  referredByCode: string | undefined;
}) {
  const { user, ready, authenticated } = usePrivy();
  const [wallet, setWallet] = useState<Wallet | undefined>(undefined);
  const [referralsCount, setReferralsCount] = useState<number>(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const locale = useLocale();

  const userEmailAddress = user?.email?.address ?? undefined;
  const userWalletAddress = user?.wallet?.address ?? undefined;
  const userTwitterUsername = user?.twitter?.username ?? undefined;

  useEffect(() => {
    if (!userWalletAddress) {
      setIsLoadingWallet(false);
      setIsLoadingReferrals(false);
      return;
    }

    setIsLoadingWallet(true);
    setIsLoadingReferrals(true);
    setError(undefined);

    // First get the wallet
    getWallet({ address: userWalletAddress, with: { referredBy: true } })
      .then((walletResult) => {
        if (walletResult) {
          setWallet(walletResult);
          // Then submit wallet if needed
          return handleSubmitWallet({
            address: userWalletAddress,
            referredByCode,
          }).then(() => walletResult);
        }
        return undefined;
      })
      .then((walletResult) => {
        if (walletResult?.referralCode) {
          // Finally get referrals count
          return getReferralsCount(walletResult.referralCode)
            .then((count) => {
              if (typeof count === "number") {
                setReferralsCount(count);
              }
            })
            .catch((error) => {
              console.error("Error getting referrals count:", error);
              setError("Failed to load referrals. Please try again.");
            });
        }
      })
      .catch((error) => {
        console.error("Error fetching wallet data:", error);
        setError("Failed to load wallet data. Please try again.");
      })
      .finally(() => {
        setIsLoadingWallet(false);
        setIsLoadingReferrals(false);
      });
  }, [referredByCode, userWalletAddress]);

  if (!ready) return null;
  if (ready && (!authenticated || !userWalletAddress)) {
    return (
      <main className="container mx-auto p-4">
        <ConnectWalletCard />
      </main>
    );
  }

  const walletConnectionPoints = 1000;
  const accountCreationPoints = 5000;
  const basePoints = walletConnectionPoints + accountCreationPoints;
  const referralPoints = referralsCount * 1000;
  const twitterPoints = userTwitterUsername ? 2000 : 0;
  const emailPoints = userEmailAddress ? 3000 : 0;
  const totalPoints = basePoints + referralPoints + twitterPoints + emailPoints;

  const referralUrl = wallet?.referralCode
    ? `https://airdrop.krain.ai/${wallet?.referralCode}`
    : "";

  return (
    <main className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <PointsStatusCard
          totalPoints={totalPoints}
          userWalletAddress={userWalletAddress}
          userEmailAddress={userEmailAddress}
          userTwitterUsername={userTwitterUsername}
          referralsCount={referralsCount}
          walletConnectionPoints={walletConnectionPoints}
          accountCreationPoints={accountCreationPoints}
          referralPoints={referralPoints}
          twitterPoints={twitterPoints}
          emailPoints={emailPoints}
          locale={locale}
          isLoadingReferrals={isLoadingReferrals}
        />
        <ReferralProgramCard
          referralsCount={referralsCount}
          referralUrl={referralUrl}
          locale={locale}
          isLoadingWallet={isLoadingWallet}
          isLoadingReferrals={isLoadingReferrals}
        />
      </div>
    </main>
  );
}
