/// <reference types="node" />

"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { Wallet } from "@repo/database";
import { useLocale } from "@repo/utils";
import { handleSubmitWallet } from "@/actions/wallet";
import { getReferralsCount } from "@/actions/referral";
import { ConnectWalletCard } from "@/components/dashboard/connect-wallet-card";
import { PointsStatusCard } from "@/components/dashboard/points-status-card";
import { ReferralProgramCard } from "@/components/dashboard/referral-program-card";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds
const SESSION_VERIFY_MAX_RETRIES = 3;

interface ClientError extends Error {
  code?: string;
  context?: Record<string, unknown>;
}

function isNetworkError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.toLowerCase().includes("network") ||
      error.message.toLowerCase().includes("connection") ||
      error.message.toLowerCase().includes("timeout"))
  );
}

function logClientError(error: unknown, context: Record<string, unknown> = {}) {
  const clientError: ClientError =
    error instanceof Error ? error : new Error(String(error));
  console.error("[CLIENT] Operation failed", {
    code: clientError.code,
    message: clientError.message,
    operation: context.operation,
    status: "error",
    ...context,
  });
  return clientError;
}

async function verifySession(attempt = 1): Promise<boolean> {
  try {
    const verifyResponse = await fetch("/api/auth/verify", {
      credentials: "include",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (verifyResponse.ok) {
      return true;
    }

    // If unauthorized, try to revalidate the session
    if (verifyResponse.status === 401 && attempt < SESSION_VERIFY_MAX_RETRIES) {
      console.info("[AUTH] Session verification failed, retrying", {
        operation: "verify_session",
        status: "retry",
        attempt,
        nextAttemptMs: RETRY_DELAY,
      });

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return verifySession(attempt + 1);
    }

    if (attempt >= SESSION_VERIFY_MAX_RETRIES) {
      console.error("[AUTH] Session verification failed", {
        operation: "verify_session",
        status: "error",
        attempts: attempt,
      });
      return false;
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    return verifySession(attempt + 1);
  } catch (error) {
    console.error("[AUTH] Session verification error", {
      operation: "verify_session",
      status: "error",
      errorMessage: error instanceof Error ? error.message : String(error),
      attempt,
    });

    if (attempt < SESSION_VERIFY_MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return verifySession(attempt + 1);
    }

    return false;
  }
}

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
        if (process.env.NODE_ENV === "development") {
          console.log("[REFERRAL] Retrying count fetch", {
            operation: "get_referral_count",
            status: "retry",
            attempt,
            nextAttemptMs: Math.round(currentDelay),
          });
        }
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
      }
    }
  }

  console.error("[REFERRAL] All count fetch attempts failed", {
    operation: "get_referral_count",
    status: "error",
    errorMessage: lastError?.message,
    totalAttempts: retries + 1,
  });
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

        // Verify session first
        const verified = await verifySession();
        if (!verified) {
          setError("Unable to verify session. Please try again.");
          return;
        }

        if (!isMounted) return;

        let walletResult: Wallet | undefined;
        try {
          const wallet = await handleSubmitWallet({
            walletAddress: userWalletAddress,
            referredByCode,
          });

          if (isMounted && wallet) {
            setWallet(wallet);
            setIsLoadingWallet(false);
            walletResult = wallet;
          }
        } catch (error) {
          if (isMounted) {
            const clientError = logClientError(error, {
              operation: "load_wallet",
              walletAddress: userWalletAddress,
            });

            setError(`${clientError.message}. Please refresh to try again.`);

            // Retry after delay if it's a network error
            if (isNetworkError(error)) {
              console.info("[CLIENT] Scheduling retry", {
                operation: "load_wallet",
                status: "retry",
                nextAttemptMs: RETRY_DELAY,
              });
              retryTimeout = setTimeout(loadData, RETRY_DELAY);
              return;
            }
          }
        }

        if (!isMounted) return;

        // Get referrals count with retry logic
        if (walletResult?.referralCode) {
          try {
            const count = await fetchWithRetry(walletResult.referralCode);
            if (isMounted) {
              setReferralsCount(count);
            }
          } catch (error) {
            if (isMounted) {
              const clientError = logClientError(error, {
                operation: "load_referrals",
                referralCode: walletResult?.referralCode,
              });

              setError(`${clientError.message}. Please refresh to try again.`);

              if (isNetworkError(error)) {
                console.info("[CLIENT] Scheduling retry", {
                  operation: "load_referrals",
                  status: "retry",
                  nextAttemptMs: RETRY_DELAY,
                });
                retryTimeout = setTimeout(loadData, RETRY_DELAY);
                return;
              }
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          const clientError = logClientError(error, {
            operation: "load_dashboard",
          });

          setError(`${clientError.message}. Please refresh to try again.`);

          if (isNetworkError(error)) {
            console.info("[CLIENT] Scheduling retry", {
              operation: "load_dashboard",
              status: "retry",
              nextAttemptMs: RETRY_DELAY,
            });
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

    // Start loading immediately
    loadData();

    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [authenticated, userWalletAddress, referredByCode, ready]);

  // Show connect wallet card if not authenticated
  if (ready && !authenticated) {
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
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-500">{error}</div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show main dashboard content with progressive loading
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
