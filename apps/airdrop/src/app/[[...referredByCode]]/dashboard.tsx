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

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds

async function fetchWithRetry(
  referralCode: string,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY,
): Promise<number> {
  let lastError: Error | undefined;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const count = await getReferralsCount(referralCode);
      if (typeof count === "number") {
        return count;
      }
      throw new Error("Invalid referral count received");
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[CLIENT] Attempt ${attempt} failed:`, lastError);

      if (attempt <= retries) {
        // Exponential backoff with jitter
        currentDelay =
          Math.min(delay * Math.pow(2, attempt - 1), 10000) *
          (0.75 + Math.random() * 0.5);
        console.log(`[CLIENT] Retrying in ${Math.round(currentDelay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
      }
    }
  }

  console.error("[CLIENT] All retry attempts failed:", lastError);
  throw lastError;
}

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

    let isMounted = true;
    let retryTimeout: NodeJS.Timeout | undefined;

    const loadData = async () => {
      try {
        setIsLoadingWallet(true);
        setIsLoadingReferrals(true);
        setError(undefined);

        // First get the wallet
        const walletResult = await getWallet({
          address: userWalletAddress,
          with: { referredBy: true },
        });

        if (!isMounted) return;

        if (walletResult) {
          setWallet(walletResult);
          // Then submit wallet if needed
          if (referredByCode) {
            await handleSubmitWallet({
              address: userWalletAddress,
              referredByCode,
            });
          }

          if (!isMounted) return;

          // Get referrals count with retry logic
          if (walletResult.referralCode) {
            try {
              const count = await fetchWithRetry(walletResult.referralCode);
              if (isMounted) {
                setReferralsCount(count);
              }
            } catch (error) {
              console.error("[CLIENT] Error getting referrals count:", error);
              if (isMounted) {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Unable to load referrals";
                setError(`${message}. Please refresh to try again.`);
              }
            }
          }
        }
      } catch (error) {
        console.error("[CLIENT] Error loading data:", error);
        if (isMounted) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load wallet data";
          setError(`${message}. Please refresh to try again.`);

          // Retry after a delay if it's a connection issue
          if (error instanceof Error && error.message.includes("connection")) {
            retryTimeout = setTimeout(loadData, RETRY_DELAY);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoadingWallet(false);
          setIsLoadingReferrals(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
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
