/// <reference types="node" />

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
const INITIAL_LOAD_DELAY = 2000; // Increased to 2 seconds to give more time for session setup

async function fetchWithRetry(
  referralCode: string,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY,
): Promise<number> {
  let lastError: Error | undefined;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const count = await getReferralsCount({ referralCode });
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
    // Only proceed if authenticated and have wallet address
    if (!authenticated || !userWalletAddress || !ready) {
      setIsLoadingWallet(false);
      setIsLoadingReferrals(false);
      return;
    }

    let isMounted = true;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;

    const loadData = async () => {
      try {
        setIsLoadingWallet(true);
        setIsLoadingReferrals(true);
        setError(undefined);

        // First verify the session is ready
        try {
          const verifyResponse = await fetch("/api/auth/verify", {
            credentials: "include",
          });

          if (!verifyResponse.ok) {
            throw new Error("Session not ready");
          }
        } catch (_error) {
          console.log("[CLIENT] Session not ready, retrying...");
          // Retry after a delay
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return loadData();
        }

        console.log("[CLIENT] Loading wallet data for user:", {
          walletAddress: userWalletAddress,
          authenticated,
          ready,
        });

        if (!isMounted) return;

        let walletResult: Wallet | undefined;
        try {
          console.log(
            "[CLIENT] Submitting wallet address with referredByCode:",
            {
              address: userWalletAddress,
              referredByCode,
            },
          );

          const wallet = await handleSubmitWallet({
            walletAddress: userWalletAddress,
            referredByCode,
          });

          if (isMounted && wallet) {
            setWallet(wallet);
            walletResult = wallet;
            console.log("[CLIENT] Wallet submitted:", wallet);
          }
        } catch (error) {
          console.error("[CLIENT] Error submitting wallet:", error);
          if (isMounted) {
            const message =
              error instanceof Error
                ? error.message
                : "Unable to load wallet data";
            setError(`${message}. Please refresh to try again.`);
          }
        }

        if (!isMounted) return;

        // Get referrals count with retry logic
        if (walletResult?.referralCode) {
          try {
            console.log(
              "[CLIENT] Fetching referrals count for code:",
              walletResult.referralCode,
            );

            const count = await fetchWithRetry(walletResult.referralCode);

            if (isMounted) {
              setReferralsCount(count);
              console.log("[CLIENT] Referrals count loaded:", count);
            } else {
              console.error("[CLIENT] Referrals count not loaded:", count);
              setReferralsCount(0);
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
        } else {
          console.error("[CLIENT] Error getting wallet:", error);
          if (isMounted) {
            const message = "Unable to load wallet data";
            setError(`${message}. Please refresh to try again.`);
          }
        }
      } catch (error) {
        console.error("[CLIENT] Error getting wallet:", error);
        if (isMounted) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load wallet data";
          setError(`${message}. Please refresh to try again.`);
        }
      } finally {
        if (isMounted) {
          setIsLoadingWallet(false);
          setIsLoadingReferrals(false);
        }
      }
    };

    // Add a delay to ensure Privy is fully initialized
    const timeoutId = setTimeout(loadData, INITIAL_LOAD_DELAY);

    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      clearTimeout(timeoutId);
    };
  }, [authenticated, userWalletAddress, referredByCode, ready]);

  // Show loading state
  if (!ready || isLoadingWallet) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Show connect wallet card if not authenticated
  if (!authenticated) {
    return (
      <main className="container mx-auto py-8 px-4">
        <ConnectWalletCard />
      </main>
    );
  }

  // Show error state if any
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-500">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show main dashboard content
  return (
    <div className="space-y-4 p-4">
      <PointsStatusCard
        totalPoints={
          5000 + // Base points for having an account
          (userWalletAddress ? 1000 : 0) + // Points for wallet connection
          referralsCount * 1000 + // Referral points: 1000 per referral
          (userTwitterUsername ? 2000 : 0) + // Twitter points: 2000 base
          (userEmailAddress ? 3000 : 0) // Email points: 3000
        }
        userWalletAddress={userWalletAddress}
        userEmailAddress={userEmailAddress}
        userTwitterUsername={userTwitterUsername}
        referralsCount={referralsCount}
        walletConnectionPoints={1000}
        accountCreationPoints={5000}
        referralPoints={referralsCount * 1000}
        twitterPoints={2000}
        emailPoints={3000}
        locale={locale}
        isLoadingReferrals={isLoadingReferrals}
      />
      <ReferralProgramCard
        referralsCount={referralsCount}
        referralUrl={
          wallet?.referralCode
            ? `https://airdrop.krain.ai/${wallet.referralCode}`
            : ""
        }
        locale={locale}
        isLoadingWallet={isLoadingWallet}
        isLoadingReferrals={isLoadingReferrals}
      />
    </div>
  );
}
