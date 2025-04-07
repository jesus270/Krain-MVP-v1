/// <reference types="node" />

"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState, useCallback } from "react";
import { Wallet } from "@krain/db";
import { useLocale } from "@krain/utils/react";
import { handleSubmitWallet } from "@/actions/wallet";
import { getReferralCount } from "@/actions/referral";
import { getTelegramMessagePoints } from "@/actions/telegram";
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
import { useSession } from "@/lib/use-session";
import { ProfileCompletionMessage } from "@/components/dashboard/profile-completion-message";

const POINTS_FOR_WALLET_CONNECTION = 1000;
const POINTS_FOR_ACCOUNT_CREATION = 5000;
const POINTS_FOR_TWITTER = 2000;
const POINTS_FOR_EMAIL = 3000;

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

// Check for infinite recursion or stack overflow errors
function isStackOverflowError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.toLowerCase().includes("maximum call stack") ||
      error.message.toLowerCase().includes("stack size exceeded") ||
      error.message.toLowerCase().includes("recursion"))
  );
}

export function Dashboard({
  referredByCode,
}: {
  referredByCode: string | undefined;
}) {
  const { user, ready, authenticated, sessionValidated } = useSession();
  const [wallet, setWallet] = useState<Wallet | undefined>(undefined);
  const [referralsCount, setReferralsCount] = useState<number>(0);
  const [telegramMessagePoints, setTelegramMessagePoints] = useState<number>(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(true);
  const [isLoadingMessagePoints, setIsLoadingMessagePoints] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const locale = useLocale();

  const userEmailAddress = user?.email?.address ?? undefined;
  const userWalletAddress = user?.wallet?.address ?? undefined;
  const userTwitterUsername = user?.twitter?.username ?? undefined;
  const hasJoinedTelegramCommunity = user?.hasJoinedTelegramCommunity ?? false;
  const hasJoinedTelegramAnnouncement =
    user?.hasJoinedTelegramAnnouncement ?? false;

  useEffect(() => {
    log.info("Dashboard component mounted", {
      entity: "CLIENT",
      operation: "dashboard_mount",
      ready,
      authenticated,
      sessionValidated,
      hasUser: !!user,
      userId: user?.id,
      userWalletAddress,
      referredByCode,
      timestamp: new Date().toISOString(),
    });
  }, [
    ready,
    authenticated,
    sessionValidated,
    user,
    userWalletAddress,
    referredByCode,
  ]);

  // Modified data loading effect
  useEffect(() => {
    let isDataMounted = true;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;

    // Early return if not ready or session not validated
    if (!authenticated || !ready || !sessionValidated) {
      log.info("Dashboard not ready for data loading", {
        entity: "CLIENT",
        operation: "dashboard_data_loading",
        authenticated,
        ready,
        sessionValidated,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const loadData = async () => {
      try {
        log.info("Starting data load", {
          entity: "CLIENT",
          operation: "dashboard_load_data",
          userWalletAddress,
          userId: user?.id,
          referredByCode,
          timestamp: new Date().toISOString(),
        });

        setError(undefined);

        // Add validation check for wallet address
        if (!userWalletAddress) {
          const error = "Invalid wallet address. Please reconnect your wallet.";
          log.error(error, {
            entity: "CLIENT",
            operation: "dashboard_load_data",
            error,
            timestamp: new Date().toISOString(),
          });
          setError(error);
          setIsLoadingWallet(false);
          setIsLoadingReferrals(false);
          setIsLoadingMessagePoints(false);
          return;
        }

        try {
          // Submit wallet
          log.info("Submitting wallet", {
            entity: "CLIENT",
            operation: "dashboard_submit_wallet",
            userWalletAddress,
            userId: user?.id,
            referredByCode,
            timestamp: new Date().toISOString(),
          });

          // First, make an API call to validate session
          const validateResponse = await fetch("/api/user", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-User-Id": user?.id || "",
            },
            credentials: "include",
          });

          if (!validateResponse.ok) {
            throw new Error(
              "Session validation failed. Please refresh and try again.",
            );
          }

          // Now attempt the wallet submission
          const wallet = await handleSubmitWallet({
            walletAddress: userWalletAddress,
            referredByCode,
            userId: user?.id ?? "",
          });

          if (isDataMounted && wallet) {
            log.info("Wallet loaded successfully", {
              entity: "CLIENT",
              operation: "dashboard_wallet_loaded",
              walletAddress: userWalletAddress,
              referralCode: wallet.referralCode,
              timestamp: new Date().toISOString(),
            });
            setWallet(wallet);
            setIsLoadingWallet(false);

            // Only fetch referrals if we have a wallet and referral code
            if (wallet.referralCode) {
              try {
                log.info("Fetching referral count", {
                  entity: "CLIENT",
                  operation: "dashboard_fetch_referrals",
                  referralCode: wallet.referralCode,
                  timestamp: new Date().toISOString(),
                });

                const count = await getReferralCount({
                  referralCode: wallet.referralCode,
                  userId: user?.id ?? "",
                });

                if (isDataMounted) {
                  log.info("Referrals loaded successfully", {
                    entity: "CLIENT",
                    operation: "dashboard_referrals_loaded",
                    count,
                    timestamp: new Date().toISOString(),
                  });
                  setReferralsCount(count);
                }
              } catch (error) {
                const errorMsg =
                  error instanceof Error ? error.message : String(error);
                log.error("Failed to load referrals", {
                  entity: "CLIENT",
                  operation: "dashboard_load_referrals",
                  error: errorMsg,
                  stack: error instanceof Error ? error.stack : undefined,
                  timestamp: new Date().toISOString(),
                });
                if (isDataMounted) {
                  setError("Failed to load referrals. Please try again.");
                }
              }
            }

            // Fetch telegram message points
            try {
              log.info("Fetching telegram message points", {
                entity: "CLIENT",
                operation: "dashboard_fetch_message_points",
                userId: user?.id,
                timestamp: new Date().toISOString(),
              });

              const points = await getTelegramMessagePoints({
                userId: user?.id ?? "",
              });

              if (isDataMounted) {
                log.info("Message points loaded successfully", {
                  entity: "CLIENT",
                  operation: "dashboard_message_points_loaded",
                  points,
                  timestamp: new Date().toISOString(),
                });
                setTelegramMessagePoints(points);
              }
            } catch (error) {
              const errorMsg =
                error instanceof Error ? error.message : String(error);
              log.error("Failed to load message points", {
                entity: "CLIENT",
                operation: "dashboard_load_message_points",
                error: errorMsg,
                stack: error instanceof Error ? error.stack : undefined,
                timestamp: new Date().toISOString(),
              });
              // Don't set error state for message points failure
            }
          }
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          log.error("Failed to load wallet", {
            entity: "CLIENT",
            operation: "dashboard_load_wallet",
            error: errorMsg,
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
          });

          if (isDataMounted) {
            // Special handling for stack overflow error (likely EVMToSol bridging issue)
            if (isStackOverflowError(error)) {
              log.error("EVM to Solana bridging error detected", {
                entity: "CLIENT",
                operation: "evm_sol_bridging_error",
                error: errorMsg,
                stack: error instanceof Error ? error.stack : undefined,
                timestamp: new Date().toISOString(),
              });

              setError(
                "There was an issue with wallet connection. Please refresh and try again with a different wallet.",
              );
            } else {
              setError(`${errorMsg}. Please try again.`);
            }

            // Retry after delay if it's a network error
            if (isNetworkError(error)) {
              log.info("Scheduling retry for wallet load", {
                operation: "dashboard_load_wallet",
                entity: "CLIENT",
                status: "retry",
                timestamp: new Date().toISOString(),
              });
              retryTimeout = setTimeout(loadData, RETRY_DELAY);
            }
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        log.error("Failed to load dashboard data", {
          entity: "CLIENT",
          operation: "dashboard_load_data",
          error: errorMsg,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        });
        if (isDataMounted) {
          setError("Failed to load data. Please try again.");
        }
      } finally {
        if (isDataMounted) {
          setIsLoadingWallet(false);
          setIsLoadingReferrals(false);
          setIsLoadingMessagePoints(false);
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
    sessionValidated,
    userWalletAddress,
    user?.id,
    referredByCode,
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
    <div className="space-y-8 p-4">
      <div className="space-y-4">
        <PointsStatusCard
          userEmailAddress={userEmailAddress}
          userTwitterUsername={userTwitterUsername}
          userWalletAddress={userWalletAddress}
          walletConnectionPoints={
            userWalletAddress ? POINTS_FOR_WALLET_CONNECTION : 0
          }
          accountCreationPoints={user ? POINTS_FOR_ACCOUNT_CREATION : 0}
          twitterPoints={userTwitterUsername ? POINTS_FOR_TWITTER : 0}
          emailPoints={userEmailAddress ? POINTS_FOR_EMAIL : 0}
          referralsCount={referralsCount}
          hasJoinedTelegramCommunity={hasJoinedTelegramCommunity}
          hasJoinedTelegramAnnouncement={hasJoinedTelegramAnnouncement}
          messagePoints={telegramMessagePoints}
          isLoadingReferrals={isLoadingReferrals}
          isLoadingMessagePoints={isLoadingMessagePoints}
        />
        {/* <ProfileCompletionMessage
          show={
            !userEmailAddress ||
            !userTwitterUsername ||
            !hasJoinedTelegramCommunity ||
            !hasJoinedTelegramAnnouncement
          }
        /> */}
      </div>
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
