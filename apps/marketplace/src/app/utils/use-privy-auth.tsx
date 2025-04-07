"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { handlePrivyAuth } from "@krain/session";
import { log } from "@krain/utils";

interface SessionUser {
  id: string;
  createdAt: Date;
  wallet?: {
    address: string;
  };
  email?: {
    address: string;
  };
  linkedAccounts?: string[];
  role?: string;
  username?: string | null;
}

interface UsePrivyAuthOptions {
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Hook for handling Privy authentication and syncing with our database
 * Use this in your app's authentication flow
 */
export function usePrivyAuth({
  maxRetries = 3,
  retryDelay = 2000,
}: UsePrivyAuthOptions = {}) {
  const { user: privyUser, authenticated, ready, login, logout } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbUser, setDbUser] = useState<SessionUser | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sessionValidated, setSessionValidated] = useState(false);

  // Add a timeout handler for wallet connections
  useEffect(() => {
    // This effect will run when a wallet connection is attempted
    const handleWalletTimeout = () => {
      // Check if there's an active wallet connection attempt
      const walletConnectModal = document.querySelector(
        '[role="dialog"][aria-modal="true"]',
      );
      if (walletConnectModal) {
        const loadingIndicator = walletConnectModal.querySelector(
          '[role="progressbar"]',
        );
        if (loadingIndicator) {
          // If there's a loading indicator, set a timeout to close the modal if it's stuck
          const timeoutId = setTimeout(() => {
            // Find the close button and click it
            const closeButton = walletConnectModal.querySelector(
              'button[aria-label="Close"]',
            );
            if (closeButton && closeButton instanceof HTMLElement) {
              closeButton.click();
            }
          }, 30000); // 30 seconds timeout

          return () => clearTimeout(timeoutId);
        }
      }
    };

    if (ready && !authenticated) {
      handleWalletTimeout();
    }

    return () => {};
  }, [ready, authenticated]);

  // Call the auth callback API to set the user_id cookie
  const validateSession = useCallback(async () => {
    if (!privyUser?.id || retryCount >= maxRetries) return;

    try {
      setIsLoading(true);
      log.info("Starting session validation", {
        entity: "CLIENT",
        operation: "validate_session_start",
        userId: privyUser.id,
      });

      const response = await fetch("/api/auth/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(privyUser),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Session validation failed with status: ${response.status}, message: ${errorText}`,
        );
      }

      // Clone the response before reading to avoid consuming the stream
      const responseClone = response.clone();

      // Log the raw response for debugging
      const rawText = await responseClone.text();
      log.info("Session raw response", {
        entity: "CLIENT",
        operation: "validate_session_raw_response",
        rawText,
      });

      // Try to parse the JSON response
      let data;
      try {
        data = JSON.parse(rawText);
        log.info("Session response data", {
          entity: "CLIENT",
          operation: "validate_session_response",
          data,
        });
      } catch (err) {
        throw new Error(`Failed to parse response: ${rawText}`);
      }

      // Explicitly handle success value (convert empty object to success: true)
      if (Object.keys(data).length === 0) {
        data = { success: true };
      }

      // Check explicitly for success flag
      if (!data || data.success !== true) {
        throw new Error(
          `Session validation response indicated failure: ${JSON.stringify(data)}`,
        );
      }

      // After session validation, fetch latest user data
      const userResponse = await fetch("/api/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": privyUser.id,
        },
        credentials: "include", // This ensures cookies are sent with the request
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.user) {
          // Make sure createdAt is always a Date object for IntercomProvider
          if (
            userData.user.createdAt &&
            !(userData.user.createdAt instanceof Date)
          ) {
            userData.user.createdAt = new Date(userData.user.createdAt);
          }
          setDbUser(userData.user as SessionUser);
          setSessionValidated(true);
          log.info("User data loaded successfully", {
            entity: "CLIENT",
            operation: "user_data_load",
            userId: privyUser.id,
          });
        } else {
          log.warn("User data response missing user object", {
            entity: "CLIENT",
            operation: "user_data_load",
            userId: privyUser.id,
            response: userData,
          });
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      log.error(errorMessage, {
        entity: "CLIENT",
        operation: "validate_session",
        userId: privyUser.id,
        retryCount,
        errorStack: error instanceof Error ? error.stack : undefined,
      });

      setRetryCount((prev) => prev + 1);

      if (retryCount < maxRetries - 1) {
        log.info(
          `Retrying session validation in ${retryDelay * (retryCount + 1)}ms`,
          {
            entity: "CLIENT",
            operation: "validate_session_retry",
            userId: privyUser.id,
            retryCount: retryCount + 1,
            maxRetries,
          },
        );

        setTimeout(() => void validateSession(), retryDelay * (retryCount + 1));
      } else {
        setError("Session validation failed after maximum retries");
        log.error("Max retries reached for session validation", {
          entity: "CLIENT",
          operation: "validate_session_max_retries",
          userId: privyUser.id,
          retryCount,
          maxRetries,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [privyUser, retryCount, maxRetries, retryDelay]);

  // Update user state when privyUser changes
  useEffect(() => {
    if (privyUser) {
      setDbUser(
        (prev) =>
          ({
            ...(prev || {}),
            id: privyUser.id,
            createdAt: new Date(),
            wallet: privyUser.wallet,
            email: privyUser.email,
            linkedAccounts: privyUser.linkedAccounts
              ?.filter((account) => account.type === "wallet")
              .map((account) => ("address" in account ? account.address : ""))
              .filter(Boolean),
          }) as SessionUser,
      );
    }
  }, [privyUser]);

  // Validate session when authenticated
  useEffect(() => {
    if (
      ready &&
      authenticated &&
      privyUser?.id &&
      !sessionValidated &&
      !isLoading
    ) {
      void validateSession();
    }
  }, [
    ready,
    authenticated,
    privyUser?.id,
    sessionValidated,
    isLoading,
    validateSession,
  ]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setDbUser(null);
      setSessionValidated(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [logout]);

  return {
    user: dbUser,
    privyUser,
    authenticated,
    ready,
    isLoading,
    error,
    sessionValidated,
    login,
    logout: handleLogout,
    validateSession,
  };
}
