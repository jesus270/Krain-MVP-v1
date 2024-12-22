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
  const locale = useLocale();

  const userEmailAddress = user?.email?.address ?? undefined;
  const userWalletAddress = user?.wallet?.address ?? undefined;
  const userTwitterUsername = user?.twitter?.username ?? undefined;

  useEffect(() => {
    if (!userWalletAddress) return;

    // Fetch wallet and submit in parallel
    Promise.all([
      getWallet({ address: userWalletAddress, with: { referredBy: true } }),
      handleSubmitWallet({ address: userWalletAddress, referredByCode }),
    ])
      .then(([walletResult, submitResult]) => {
        if (walletResult) {
          setWallet(walletResult);
          if (walletResult.referralCode) {
            getReferralsCount(walletResult.referralCode)
              .then((count) => {
                if (typeof count === "number") {
                  setReferralsCount(count);
                }
              })
              .catch((error) => {
                console.error("Error getting referrals count:", error);
              });
          }
        }
        if (submitResult.status === "error") {
          console.error("Error submitting wallet:", submitResult.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching wallet data:", error);
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
        />
        <ReferralProgramCard
          referralsCount={referralsCount}
          referralUrl={referralUrl}
          locale={locale}
        />
      </div>
    </main>
  );
}
