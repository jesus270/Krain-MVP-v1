/// <reference types="node" />

"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState, useCallback } from "react";
import { Wallet } from "@krain/db";
import { useLocale } from "@krain/utils";
import { handleSubmitWallet } from "@/actions/wallet";
import { getReferralCount } from "@/actions/referral";
import { ConnectWalletCard } from "@/components/dashboard/connect-wallet-card";
import { PointsStatusCard } from "@/components/dashboard/points-status-card";
import { ReferralProgramCard } from "@/components/dashboard/referral-program-card";
import { ReferralCodeConfirmationCard } from "@/components/dashboard/referral-code-confirmation-card";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@krain/ui/components/ui/card";
import { Button } from "@krain/ui/components/ui/button";
import { log } from "@krain/utils";

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds

function isNetworkError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.toLowerCase().includes("network") ||
      error.message.toLowerCase().includes("connection") ||
      error.message.toLowerCase().includes("timeout"))
  );
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

  // Add a new state to track session updates
  const [hasUpdatedSession, setHasUpdatedSession] = useState(false);

  // Add retry count state and constants
  const [sessionRetryCount, setSessionRetryCount] = useState(0);
  const MAX_SESSION_RETRIES = 3;
  const SESSION_RETRY_DELAY = 2000;

  const userEmailAddress = user?.email?.address ?? undefined;
  const userWalletAddress = user?.wallet?.address ?? undefined;
  const userTwitterUsername = user?.twitter?.username ?? undefined;

  // Modified updateSession function with retry limit
  const updateSession = useCallback(async () => {
    if (
      !user?.id ||
      !userWalletAddress ||
      sessionRetryCount >= MAX_SESSION_RETRIES
    )
      return;

    try {
      await fetch("/api/auth/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user }),
      });
      setHasUpdatedSession(true);
      setSessionRetryCount(0); // Reset count on success
    } catch (error) {
      log.error(error, {
        entity: "CLIENT",
        operation: "update_session",
        walletAddress: userWalletAddress,
        userId: user.id,
        retryCount: sessionRetryCount,
      });

      // Increment retry count
      setSessionRetryCount((prev) => prev + 1);

      // Schedule retry with delay
      if (sessionRetryCount < MAX_SESSION_RETRIES) {
        setTimeout(() => void updateSession(), SESSION_RETRY_DELAY);
      }
    }
  }, [user, userWalletAddress, sessionRetryCount]);

  // Modified session update effect
  useEffect(() => {
    if (
      authenticated &&
      ready &&
      user?.id &&
      !hasUpdatedSession &&
      sessionRetryCount < MAX_SESSION_RETRIES
    ) {
      void updateSession();
    }
  }, [
    authenticated,
    ready,
    user?.id,
    hasUpdatedSession,
    updateSession,
    sessionRetryCount,
  ]);

  // Modified data loading effect
  useEffect(() => {
    let isDataMounted = true;
    let retryCount = 0;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;

    // Early return if not ready or session update failed
    if (!authenticated || !ready || sessionRetryCount >= MAX_SESSION_RETRIES) {
      setIsLoadingWallet(false);
      setIsLoadingReferrals(false);
      if (sessionRetryCount >= MAX_SESSION_RETRIES) {
        setError("Failed to update session. Please refresh the page.");
      }
      return;
    }

    // Early return if session not updated yet
    if (!hasUpdatedSession) {
      setIsLoadingWallet(false);
      setIsLoadingReferrals(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoadingWallet(true);
        setIsLoadingReferrals(true);
        setError(undefined);

        // Add validation check for wallet address
        if (!userWalletAddress) {
          log.error("Invalid wallet address", {
            entity: "CLIENT",
            operation: "load_wallet",
            error: "Wallet address is undefined",
          });
          setError("Invalid wallet address. Please reconnect your wallet.");
          setIsLoadingWallet(false);
          setIsLoadingReferrals(false);
          return;
        }

        try {
          // Submit wallet
          const wallet = await handleSubmitWallet({
            walletAddress: userWalletAddress,
            referredByCode,
            userId: user?.id ?? "",
          });

          if (isDataMounted && wallet) {
            log.info("Wallet loaded successfully", {
              entity: "CLIENT",
              operation: "load_wallet",
              walletAddress: userWalletAddress,
            });
            setWallet(wallet);
            setIsLoadingWallet(false);

            // Only fetch referrals if we have a wallet and referral code
            if (wallet.referralCode) {
              try {
                const count = await getReferralCount({
                  referralCode: wallet.referralCode,
                  userId: user?.id ?? "",
                });
                if (isDataMounted) {
                  log.info("Referrals loaded successfully", {
                    entity: "CLIENT",
                    operation: "load_referrals",
                    walletAddress: userWalletAddress,
                    count,
                  });
                  setReferralsCount(count);
                }
              } catch (error) {
                if (isDataMounted) {
                  log.error(error, {
                    entity: "CLIENT",
                    operation: "load_referrals",
                    walletAddress: userWalletAddress,
                  });
                  setError("Failed to load referrals. Please try again.");
                }
              }
            }
          }
        } catch (e) {
          const error = e as Error;
          if (isDataMounted) {
            log.error(error, {
              entity: "CLIENT",
              operation: "load_wallet",
              walletAddress: userWalletAddress,
            });

            // Modify the session error handling section:
            if (error.message.includes("No user in session")) {
              log.info("Session error detected", {
                entity: "CLIENT",
                operation: "handle_session_error",
                retryCount,
              });

              if (retryCount < MAX_RETRIES) {
                retryCount++;
                retryTimeout = setTimeout(loadData, RETRY_DELAY);
              } else {
                setError("Session error persists. Please refresh the page.");
              }
              return;
            }

            setError(`${error.message}. Please try again.`);

            // Retry after delay if it's a network error
            if (isNetworkError(error)) {
              log.info("Scheduling retry", {
                operation: "load_wallet",
                entity: "CLIENT",
                status: "retry",
              });
              retryTimeout = setTimeout(loadData, RETRY_DELAY);
            }
          }
        }
      } catch (error) {
        if (isDataMounted) {
          log.error(error, {
            entity: "CLIENT",
            operation: "load_data",
            walletAddress: userWalletAddress,
          });
          setError("Failed to load data. Please try again.");
        }
      } finally {
        if (isDataMounted) {
          setIsLoadingWallet(false);
          setIsLoadingReferrals(false);
        }
      }
    };

    void loadData();

    return () => {
      isDataMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [
    authenticated,
    ready,
    hasUpdatedSession,
    userWalletAddress,
    user?.id,
    referredByCode,
    sessionRetryCount, // Add sessionRetryCount to dependencies
  ]);

  // Show connect wallet card if not authenticated or not ready
  if (!authenticated || !ready) {
    return <ConnectWalletCard />;
  }

  // Show connect wallet card if no wallet address
  if (!userWalletAddress) {
    return <ConnectWalletCard />;
  }

  // Show error state
  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardFooter>
      </Card>
    );
  }

  // Show wallet status
  return (
    <div className="space-y-8">
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
      {referredByCode && !wallet?.referralCode && (
        <ReferralCodeConfirmationCard walletAddress={userWalletAddress || ""} />
      )}
    </div>
  );
}
