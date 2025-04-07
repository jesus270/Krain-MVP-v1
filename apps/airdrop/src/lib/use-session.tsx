"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect, useCallback } from "react";
import { log } from "@krain/utils";
import type { User as DbUser } from "@krain/db";

interface UseSessionOptions {
  onSessionValidated?: () => void;
  maxRetries?: number;
  retryDelay?: number;
}

// Extend the Privy user type with our database fields
type SessionUser = {
  id: string;
  createdAt: Date;
  wallet?: {
    address: string;
  };
  email?: {
    address: string;
  };
  twitter?: {
    subject: string;
    handle?: string | null;
    name?: string | null;
    profilePictureUrl?: string | null;
    username?: string | null;
  };
  telegramUserId?: string;
  telegramUsername?: string;
  hasJoinedTelegramCommunity?: boolean;
  hasJoinedTelegramAnnouncement?: boolean;
  telegramCommunityMessageCount?: number;
  hasJoinedCommunityChannel?: boolean;
  hasJoinedAnnouncementChannel?: boolean;
  communityMessageCount?: number;
  announcementCommentCount?: number;
  linkedAccounts?: any[];
  role?: string;
};

export function useSession({
  onSessionValidated,
  maxRetries = 3,
  retryDelay = 2000,
}: UseSessionOptions = {}) {
  const { ready, authenticated, user: privyUser } = usePrivy();
  const [isValidatingSession, setIsValidatingSession] = useState(false);
  const [sessionValidated, setSessionValidated] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [retryCount, setRetryCount] = useState(0);
  const [user, setUser] = useState<SessionUser | null>(null);

  const validateSession = useCallback(async () => {
    if (!privyUser?.id || retryCount >= maxRetries) return;

    try {
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
          setUser(userData.user as SessionUser);
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
      } else {
        const errorText = await userResponse.text();
        log.warn(`Failed to fetch user data: ${userResponse.status}`, {
          entity: "CLIENT",
          operation: "user_data_load",
          userId: privyUser.id,
          status: userResponse.status,
          errorText,
        });

        // If we get a 404, it might mean the session is valid but the user isn't in the database yet
        // Try again with a delay to allow any async operations to complete
        if (userResponse.status === 404) {
          log.info("User not found, retrying after delay", {
            entity: "CLIENT",
            operation: "user_data_retry",
            userId: privyUser.id,
          });

          setTimeout(async () => {
            const retryResponse = await fetch("/api/user", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "X-User-Id": privyUser.id,
              },
              credentials: "include",
            });

            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              if (retryData.user) {
                setUser(retryData.user as SessionUser);
                log.info("User data loaded successfully on retry", {
                  entity: "CLIENT",
                  operation: "user_data_load_retry",
                  userId: privyUser.id,
                });
              }
            }
          }, 2000); // Retry after 2 seconds
        }
      }

      setSessionValidated(true);
      setRetryCount(0);
      setError(undefined);
      onSessionValidated?.();

      log.info("Session validated successfully", {
        entity: "CLIENT",
        operation: "validate_session_success",
        userId: privyUser.id,
      });
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
        setError("Session validation failed");
        log.error("Max retries reached for session validation", {
          entity: "CLIENT",
          operation: "validate_session_max_retries",
          userId: privyUser.id,
          retryCount,
          maxRetries,
        });
      }
    } finally {
      setIsValidatingSession(false);
    }
  }, [privyUser, retryCount, maxRetries, retryDelay, onSessionValidated]);

  useEffect(() => {
    if (
      ready &&
      authenticated &&
      privyUser?.id &&
      !sessionValidated &&
      !isValidatingSession
    ) {
      setIsValidatingSession(true);
      void validateSession();
    }
  }, [
    ready,
    authenticated,
    privyUser?.id,
    sessionValidated,
    isValidatingSession,
    validateSession,
  ]);

  // Update user state when privyUser changes
  useEffect(() => {
    if (privyUser) {
      setUser(
        (prev) =>
          ({
            ...(prev || {}),
            id: privyUser.id,
            createdAt: new Date(),
            wallet: privyUser.wallet,
            email: privyUser.email,
            twitter: privyUser.twitter,
            linkedAccounts: privyUser.linkedAccounts,
          }) as SessionUser,
      );
    }
  }, [privyUser]);

  return {
    ready,
    authenticated,
    user,
    isValidatingSession,
    sessionValidated,
    error,
  };
}
