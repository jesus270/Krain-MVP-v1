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
import { calculateActiveMonths } from "@krain/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@krain/ui/components/ui/card";
import { Button } from "@krain/ui/components/ui/button";
import { log } from "@krain/utils";
import { useSession } from "@krain/session";
import { ProfileCompletionMessage } from "@/components/dashboard/profile-completion-message";
import { AmbassadorPointsCard } from "@/components/dashboard/ambassador-points-card";

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
  const {
    user,
    ready,
    authenticated,
    sessionValidated,
    isValidatingSession,
    error: sessionError,
  } = useSession();
  const { login, linkEmail } = usePrivy();
  const [wallet, setWallet] = useState<Wallet | undefined>(undefined);
  const [referralsCount, setReferralsCount] = useState<number>(0);
  const [telegramMessagePoints, setTelegramMessagePoints] = useState<number>(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(true);
  const [isLoadingMessagePoints, setIsLoadingMessagePoints] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const locale = useLocale();
  const [ambassadorInfo, setAmbassadorInfo] = useState<{
    isAmbassador: boolean;
    activeMonths: number;
    ambassadorPoints: number;
    isLoading: boolean;
  }>({ isAmbassador: false, activeMonths: 0, ambassadorPoints: 0, isLoading: true });

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
      privyReady: ready,
      privyAuthenticated: authenticated,
      sessionValidated,
      isValidatingSession,
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
    isValidatingSession,
    user,
    userWalletAddress,
    referredByCode,
  ]);

  useEffect(() => {
    let isDataMounted = true;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;

    if (!sessionValidated || !user?.id || !userWalletAddress) {
      if (
        authenticated &&
        ready &&
        !sessionValidated &&
        !isValidatingSession &&
        !sessionError
      ) {
        log.info("Dashboard waiting for session validation", {
        entity: "CLIENT",
          operation: "dashboard_awaiting_session",
        authenticated,
        ready,
        sessionValidated,
          isValidatingSession,
          sessionError,
        });
        setIsLoadingWallet(true);
        setIsLoadingReferrals(true);
        setIsLoadingMessagePoints(true);
        setError(undefined);
      } else if (sessionError) {
        log.error("Session validation failed, cannot load dashboard data", {
          entity: "CLIENT",
          operation: "dashboard_session_error",
          sessionError,
        });
        setError(`Session Error: ${sessionError}. Please refresh.`);
        setIsLoadingWallet(false);
        setIsLoadingReferrals(false);
        setIsLoadingMessagePoints(false);
      } else if (!authenticated || !ready) {
        log.info("Dashboard not authenticated or ready, clearing state", {
          entity: "CLIENT",
          operation: "dashboard_not_authenticated",
          authenticated,
          ready,
        });
        setWallet(undefined);
        setReferralsCount(0);
        setTelegramMessagePoints(0);
        setIsLoadingWallet(true);
        setIsLoadingReferrals(true);
        setIsLoadingMessagePoints(true);
        setError(undefined);
      } else if (sessionValidated && (!user?.id || !userWalletAddress)) {
        log.warn(
          "Session validated but user ID or wallet missing, cannot load data",
          {
            entity: "CLIENT",
            operation: "dashboard_missing_user_data",
            userId: user?.id,
            userWalletAddress,
          },
        );
        setError(
          "User data incomplete. Please ensure your wallet is connected properly.",
        );
        setIsLoadingWallet(false);
        setIsLoadingReferrals(false);
        setIsLoadingMessagePoints(false);
      }
      return;
    }

    setIsLoadingWallet(true);
    setIsLoadingReferrals(true);
    setIsLoadingMessagePoints(true);
    setError(undefined);

    const loadData = async () => {
      try {
        log.info("Starting dashboard data load (session validated)", {
          entity: "CLIENT",
          operation: "dashboard_load_data_start",
          userWalletAddress,
          userId: user.id,
          referredByCode,
          timestamp: new Date().toISOString(),
        });

        try {
          log.info("Submitting wallet/user info", {
            entity: "CLIENT",
            operation: "dashboard_submit_wallet",
            userWalletAddress,
            userId: user.id,
            referredByCode,
            timestamp: new Date().toISOString(),
          });

          const submittedWallet = await handleSubmitWallet({
            walletAddress: userWalletAddress,
            referredByCode,
            userId: user.id,
          });

          if (isDataMounted && submittedWallet) {
            log.info("Wallet info submitted/confirmed successfully", {
              entity: "CLIENT",
              operation: "dashboard_wallet_submitted",
              walletAddress: userWalletAddress,
              referralCode: submittedWallet.referralCode,
              timestamp: new Date().toISOString(),
            });
            setWallet(submittedWallet);
            setIsLoadingWallet(false);

            if (submittedWallet.referralCode) {
              setIsLoadingReferrals(true);
              try {
                log.info("Fetching referral count", {
                  entity: "CLIENT",
                  operation: "dashboard_fetch_referrals",
                  referralCode: submittedWallet.referralCode,
                  userId: user.id,
                  timestamp: new Date().toISOString(),
                });

                const count = await getReferralCount({
                  referralCode: submittedWallet.referralCode,
                  userId: user.id,
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
              } catch (referralError) {
                const errorMsg =
                  referralError instanceof Error
                    ? referralError.message
                    : String(referralError);
                log.error("Failed to load referrals", {
                  entity: "CLIENT",
                  operation: "dashboard_load_referrals_error",
                  error: errorMsg,
                  stack:
                    referralError instanceof Error
                      ? referralError.stack
                      : undefined,
                  timestamp: new Date().toISOString(),
                });
                if (isDataMounted) {
                  setError("Failed to load referral count.");
                }
              } finally {
                if (isDataMounted) setIsLoadingReferrals(false);
              }
            } else {
              if (isDataMounted) setIsLoadingReferrals(false);
            }

            setIsLoadingMessagePoints(true);
            try {
              log.info("Fetching telegram message points", {
                entity: "CLIENT",
                operation: "dashboard_fetch_message_points",
                userId: user.id,
                timestamp: new Date().toISOString(),
              });

              const points = await getTelegramMessagePoints({
                userId: user.id,
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
            } catch (pointsError) {
              const errorMsg =
                pointsError instanceof Error
                  ? pointsError.message
                  : String(pointsError);
              log.error("Failed to load message points", {
                entity: "CLIENT",
                operation: "dashboard_load_message_points_error",
                error: errorMsg,
                stack:
                  pointsError instanceof Error ? pointsError.stack : undefined,
                timestamp: new Date().toISOString(),
              });
              if (isDataMounted) {
                // Decide if this error should be shown to the user
                // setError("Failed to load message points.");
              }
            } finally {
              if (isDataMounted) setIsLoadingMessagePoints(false);
            }
          } else if (isDataMounted) {
            log.warn("handleSubmitWallet returned no wallet data", {
              entity: "CLIENT",
              operation: "dashboard_wallet_submit_nodata",
              userId: user.id,
            });
            setIsLoadingWallet(false);
            setIsLoadingReferrals(false);
            setIsLoadingMessagePoints(false);
            setIsLoadingMessagePoints(true);
            try {
              const points = await getTelegramMessagePoints({
                userId: user.id,
              });
              if (isDataMounted) setTelegramMessagePoints(points);
            } catch (e) {
              log.error("Failed loading points after empty wallet submit", {
                operation:
                  "dashboard_load_points_after_empty_wallet_submit_error",
                error: e,
              });
            } finally {
              if (isDataMounted) setIsLoadingMessagePoints(false);
            }
          }
        } catch (walletSubmitError) {
          const errorMsg =
            walletSubmitError instanceof Error
              ? walletSubmitError.message
              : String(walletSubmitError);
          log.error("Failed to submit wallet info", {
            entity: "CLIENT",
            operation: "dashboard_submit_wallet_error",
            error: errorMsg,
            stack:
              walletSubmitError instanceof Error
                ? walletSubmitError.stack
                : undefined,
            timestamp: new Date().toISOString(),
          });
          if (isDataMounted) {
            if (isStackOverflowError(walletSubmitError)) {
              setError(
                "Wallet connection issue (bridging). Please refresh/try different wallet.",
              );
            } else {
              setError(`Error confirming wallet: ${errorMsg}.`);
            }
            setIsLoadingWallet(false);
            setIsLoadingReferrals(false);
            setIsLoadingMessagePoints(false);

            if (isNetworkError(walletSubmitError)) {
              log.info(
                "Scheduling retry for dashboard data load due to network error",
                {
                  operation: "dashboard_load_data_retry",
                entity: "CLIENT",
                },
              );
              retryTimeout = setTimeout(loadData, RETRY_DELAY);
            }
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        log.error("Unexpected error loading dashboard data", {
          entity: "CLIENT",
          operation: "dashboard_load_data_unexpected_error",
          error: errorMsg,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        });
        if (isDataMounted) {
          setError("An unexpected error occurred. Please try again.");
          setIsLoadingWallet(false);
          setIsLoadingReferrals(false);
          setIsLoadingMessagePoints(false);
        }
      } finally {
        // Ensure loading states are eventually set to false if component is still mounted
        // This might be redundant if all paths set them, but acts as a safeguard
        // if (isDataMounted) {
        //   setIsLoadingWallet(false);
        //   setIsLoadingReferrals(false);
        //   setIsLoadingMessagePoints(false);
        // }
      }
    };

    void loadData();

    return () => {
      isDataMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      log.info("Dashboard data loading effect cleanup", {
        entity: "CLIENT",
        operation: "dashboard_load_cleanup",
      });
    };
  }, [
    sessionValidated,
    user?.id,
    userWalletAddress,
    referredByCode,
    authenticated,
    ready,
    isValidatingSession,
    sessionError,
  ]);

  useEffect(() => {
    async function fetchAmbassadorInfo() {
      if (!user?.id) return;
      setAmbassadorInfo((prev) => ({ ...prev, isLoading: true }));
      try {
      console.log("-----------------fetching ambassador info-----------------");
      console.log("user.id", user.id);
        const res = await fetch(`/api/user/ambassador-info?Id=${user.id}`, { headers: { "x-user-id": user.id } });
        if (!res.ok) throw new Error("Failed to fetch ambassador info");
        const data = await res.json();
        console.log("ambassador info", data);
        
        if (data.isAmbassador && data.createdAt) {
          const activeMonths = calculateActiveMonths(data.createdAt, data.numberOfBadMonths);
          setAmbassadorInfo({
            isAmbassador: true,
            activeMonths: activeMonths,
            ambassadorPoints: activeMonths * 100000,
            isLoading: false,
          });
        } else {
          setAmbassadorInfo({ isAmbassador: false, activeMonths: 0, ambassadorPoints: 0, isLoading: false });
        }
      } catch {
        setAmbassadorInfo({ isAmbassador: false, activeMonths: 0, ambassadorPoints: 0, isLoading: false });
      }
    }
    if (user?.id) fetchAmbassadorInfo();
  }, [user?.id]);

  if (!authenticated || !ready) {
    log.info("Rendering ConnectWalletCard (not authenticated or ready)", {
      operation: "render_connect_wallet_unauthenticated",
      authenticated,
      ready,
    });
    return <ConnectWalletCard />;
  }

  if (authenticated && !userWalletAddress) {
    log.info(
      "Rendering ConnectWalletCard (authenticated but no wallet address)",
      {
        operation: "render_connect_wallet_no_address",
        authenticated,
        userWalletAddress,
      },
    );
    return <ConnectWalletCard />;
  }

  if (isValidatingSession) {
    log.info("Rendering Loading State (isValidatingSession)", {
      operation: "render_loading_validating_session",
    });
    return (
      <Card className="max-w-2xl mx-auto animate-pulse">
        <CardHeader>
          <CardTitle>Loading Dashboard...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Verifying your session...</p>
        </CardContent>
      </Card>
    );
  }

  if (sessionError) {
    log.error("Rendering Session Error State", {
      operation: "render_session_error",
      sessionError,
    });
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Session Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            {sessionError}. Please try refreshing the page.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </CardFooter>
      </Card>
    );
  }

  if (error) {
    log.error("Rendering Component Error State", {
      operation: "render_component_error",
      error,
    });
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

  if (
    sessionValidated &&
    (isLoadingWallet || isLoadingReferrals || isLoadingMessagePoints)
  ) {
    log.info("Rendering Loading State (session validated, data loading)", {
      operation: "render_loading_data_fetch",
      isLoadingWallet,
      isLoadingReferrals,
      isLoadingMessagePoints,
    });
    return (
      <Card className="max-w-2xl mx-auto animate-pulse">
        <CardHeader>
          <CardTitle>Loading Points...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Fetching your airdrop details...</p>
        </CardContent>
      </Card>
    );
  }

  if (!sessionValidated) {
    log.warn(
      "Rendering null (session not validated, but no error/loading state?)",
      { operation: "render_null_unexpected_state" },
    );
    return null;
  }

  const totalPoints =
    (POINTS_FOR_WALLET_CONNECTION) +
    (POINTS_FOR_ACCOUNT_CREATION) +
    (referralsCount * 1000) +
    (hasJoinedTelegramCommunity ? 5000 : 0) +
    (hasJoinedTelegramAnnouncement ? 5000 : 0) +
    (telegramMessagePoints ?? 0) +
    (userTwitterUsername ? POINTS_FOR_TWITTER : 0) +
    (userEmailAddress ? POINTS_FOR_EMAIL : 0) +
    (ambassadorInfo.ambassadorPoints ?? 0);

  log.info("Rendering Main Dashboard Content", {
    operation: "render_dashboard_content",
    userId: user?.id,
    wallet: userWalletAddress,
    referralsCount,
    telegramMessagePoints,
  });
  return (
    <div className="space-y-8 p-4">
      <div className="space-y-4">
        <PointsStatusCard
          userEmailAddress={userEmailAddress}
          userTwitterUsername={userTwitterUsername}
          userWalletAddress={userWalletAddress}
          walletConnectionPoints={POINTS_FOR_WALLET_CONNECTION}
          accountCreationPoints={POINTS_FOR_ACCOUNT_CREATION}
          twitterPoints={POINTS_FOR_TWITTER}
          emailPoints={POINTS_FOR_EMAIL}
          referralsCount={referralsCount}
          hasJoinedTelegramCommunity={hasJoinedTelegramCommunity}
          hasJoinedTelegramAnnouncement={hasJoinedTelegramAnnouncement}
          messagePoints={telegramMessagePoints}
          isLoadingReferrals={isLoadingReferrals}
          isLoadingMessagePoints={isLoadingMessagePoints}
          isAmbassador={ambassadorInfo.isAmbassador}
          ambassadorActiveMonths={ambassadorInfo.activeMonths}
          isLoadingAmbassador={ambassadorInfo.isLoading}
        />
      </div>

      {ambassadorInfo.isAmbassador && (
        <AmbassadorPointsCard ambassadorInfo={{isAmbassador: ambassadorInfo.isAmbassador, activeMonths: ambassadorInfo.activeMonths, ambassadorPoints: ambassadorInfo.ambassadorPoints}} locale={locale} />
      )}

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
