"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect, useCallback, useRef } from "react";
import { log } from "@krain/utils";
import { SessionUser } from "./types"; // Ensure SessionUser is imported

interface UseSessionOptions {
  onSessionValidated?: () => void;
  maxRetries?: number;
  initialRetryDelay?: number; // Changed from retryDelay
  backoffFactor?: number;
}

// Type guard to check for error with reset property
interface RateLimitErrorBody {
  reset?: number; // Unix timestamp in milliseconds
  [key: string]: any;
}

function isRateLimitErrorBody(body: any): body is RateLimitErrorBody {
  return (
    typeof body === "object" && body !== null && typeof body.reset === "number"
  );
}

export function useSession({
  onSessionValidated,
  maxRetries = 3,
  initialRetryDelay = 3000, // Increased initial delay
  backoffFactor = 2,
}: UseSessionOptions = {}) {
  const { ready, authenticated, user: privyUser } = usePrivy();
  const [isValidatingSession, setIsValidatingSession] = useState(false);
  const [sessionValidated, setSessionValidated] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [retryCount, setRetryCount] = useState(0);
  const [user, setUser] = useState<SessionUser | null>(null); // Explicitly allow null
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to store timeout ID

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const validateSession = useCallback(
    async (currentRetryCount: number) => {
      if (!privyUser?.id) {
        log.warn("validateSession called without privyUser.id", {
          entity: "CLIENT",
          operation: "validate_session_skip",
        });
        setIsValidatingSession(false);
        return;
      }

      // Don't attempt validation if already validating
      if (isValidatingSession && currentRetryCount === 0) {
        log.info("Validation already in progress, skipping new attempt.", {
          entity: "CLIENT",
          operation: "validation_skipped_in_progress",
        });
        return;
      }

      setIsValidatingSession(true);
      log.info("Starting session validation attempt", {
        entity: "CLIENT",
        operation: "validate_session_start",
        userId: privyUser.id,
        attempt: currentRetryCount + 1,
        maxRetries,
      });

      let didErrorOccur = false; // Flag to track if error happened
      let isSchedulingRetry = false; // Flag to track if retry is scheduled

      try {
        // API Call 1: Validate session with backend
        const validationResponse = await fetch("/api/auth/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(privyUser),
        });

        // Handle Rate Limit specifically
        if (validationResponse.status === 429) {
          let delay =
            initialRetryDelay * Math.pow(backoffFactor, currentRetryCount);
          try {
            const errorBody = await validationResponse.json();
            if (isRateLimitErrorBody(errorBody) && errorBody.reset) {
              const resetDelay = errorBody.reset - Date.now();
              delay = Math.max(delay, resetDelay); // Use the longer delay
              log.warn("Rate limit hit (429). Respecting reset time.", {
                entity: "CLIENT",
                operation: "validate_session_rate_limit",
                userId: privyUser.id,
                reset: errorBody.reset,
                calculatedDelay: delay,
              });
            } else {
              log.warn("Rate limit hit (429). Applying exponential backoff.", {
                entity: "CLIENT",
                operation: "validate_session_rate_limit",
                userId: privyUser.id,
                calculatedDelay: delay,
              });
            }
          } catch (parseError) {
            log.warn(
              "Rate limit hit (429 - failed to parse body). Applying exponential backoff.",
              {
                entity: "CLIENT",
                operation: "validate_session_rate_limit",
                userId: privyUser.id,
                calculatedDelay: delay,
              },
            );
          }
          throw new AppError(
            ErrorCodes.RATE_LIMIT_EXCEEDED,
            `Session validation failed: Rate limit exceeded. Retrying in ${Math.round(delay / 1000)}s`,
            { delay },
          );
        }

        if (!validationResponse.ok) {
          const errorText = await validationResponse.text();
          throw new AppError(
            ErrorCodes.NETWORK_ERROR, // Or a more specific code
            `Session validation failed with status: ${validationResponse.status}, message: ${errorText.substring(0, 200)}`,
          );
        }

        // ---- User Data Fetching (assuming validation is OK) ----
        // Reset error and retry count on successful validation call
        setError(undefined);
        // Don't reset retry count here yet, wait for user fetch success

        log.info("Session validation call successful, fetching user data...", {
          entity: "CLIENT",
          operation: "fetch_user_data_start",
          userId: privyUser.id,
        });

        const userResponse = await fetch("/api/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": privyUser.id, // Keep sending this for now
          },
          credentials: "include",
        });

        if (userResponse.status === 429) {
          let delay =
            initialRetryDelay * Math.pow(backoffFactor, currentRetryCount);
          try {
            const errorBody = await userResponse.json();
            if (isRateLimitErrorBody(errorBody) && errorBody.reset) {
              const resetDelay = errorBody.reset - Date.now();
              delay = Math.max(delay, resetDelay); // Use the longer delay
              log.warn("Rate limit hit on /api/user. Respecting reset time.", {
                entity: "CLIENT",
                operation: "fetch_user_data_rate_limit",
                userId: privyUser.id,
                reset: errorBody.reset,
                calculatedDelay: delay,
              });
            } else {
              log.warn(
                "Rate limit hit on /api/user. Applying exponential backoff.",
                {
                  entity: "CLIENT",
                  operation: "fetch_user_data_rate_limit",
                  userId: privyUser.id,
                  calculatedDelay: delay,
                },
              );
            }
          } catch (parseError) {
            log.warn(
              "Rate limit hit on /api/user (failed to parse body). Applying exponential backoff.",
              {
                entity: "CLIENT",
                operation: "fetch_user_data_rate_limit",
                userId: privyUser.id,
                calculatedDelay: delay,
              },
            );
          }
          throw new AppError(
            ErrorCodes.RATE_LIMIT_EXCEEDED,
            `User fetch failed: Rate limit exceeded. Retrying in ${Math.round(delay / 1000)}s`,
            { delay },
          );
        }

        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          log.warn(`Failed to fetch user data: Status ${userResponse.status}`, {
            entity: "CLIENT",
            operation: "fetch_user_data_failed",
            userId: privyUser.id,
            status: userResponse.status,
            errorText: errorText.substring(0, 500),
          });

          if (userResponse.status === 404) {
            log.info(
              "User not found in DB (404), session potentially valid but no user record.",
              {
                entity: "CLIENT",
                operation: "fetch_user_data_404",
                userId: privyUser.id,
              },
            );
            // Set validated = true, user = null, error = specific message?
            setUser(null);
            setSessionValidated(true); // Session cookie likely set, but user doesn't exist fully
            setError("User profile not found.");
            onSessionValidated?.();
          } else {
            // Throw other errors to trigger general retry logic
            throw new AppError(
              ErrorCodes.NETWORK_ERROR,
              `Failed to fetch user data: Status ${userResponse.status}`,
            );
          }
        } else {
          const userData = await userResponse.json();

          if (userData && userData.user) {
            // Ensure createdAt is a Date object
            if (
              userData.user.createdAt &&
              !(userData.user.createdAt instanceof Date)
            ) {
              userData.user.createdAt = new Date(userData.user.createdAt);
            }
            setUser(userData.user as SessionUser); // Cast to SessionUser
            setSessionValidated(true);
            setRetryCount(0); // Reset retries only on full success
            setError(undefined); // Clear error on full success
            onSessionValidated?.(); // Callback on success
            log.info("Session validated and user data loaded successfully", {
              entity: "CLIENT",
              operation: "session_user_loaded_success",
              userId: privyUser.id,
            });
          } else {
            log.warn("User data response OK but missing 'user' object", {
              entity: "CLIENT",
              operation: "fetch_user_data_missing_user",
              userId: privyUser.id,
              responseData: userData,
            });
            setUser(null);
            setSessionValidated(true);
            setError("Failed to load complete user details.");
            onSessionValidated?.();
          }
        }
      } catch (err) {
        didErrorOccur = true; // Mark that an error happened
        log.error("Error during session validation or user fetch", {
          entity: "CLIENT",
          operation: "validate_session_error",
          userId: privyUser?.id ?? "unknown",
          attempt: currentRetryCount + 1,
          errorMessage: err instanceof Error ? err.message : String(err),
          errorStack: err instanceof Error ? err.stack : undefined,
        });

        if (currentRetryCount < maxRetries - 1) {
          isSchedulingRetry = true; // Mark that we are scheduling a retry
          const nextRetryCount = currentRetryCount + 1;
          // Calculate delay: exponential backoff, respecting 429 delay if applicable
          let delay =
            initialRetryDelay * Math.pow(backoffFactor, currentRetryCount);
          if (
            err instanceof AppError &&
            err.code === ErrorCodes.RATE_LIMIT_EXCEEDED &&
            err.context?.delay
          ) {
            delay = Math.max(delay, err.context.delay as number);
          }

          log.info(
            `Scheduling retry ${nextRetryCount}/${maxRetries} in ${delay}ms`,
            {
              entity: "CLIENT",
              operation: "validate_session_schedule_retry",
              userId: privyUser.id,
              nextRetryCount,
              maxRetries,
              delay,
            },
          );
          setError(
            err instanceof Error ? err.message : "Session validation failed.",
          ); // Keep showing error

          // Clear previous timeout if exists
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }

          retryTimeoutRef.current = setTimeout(() => {
            void validateSession(nextRetryCount);
          }, delay);
        } else {
          log.error("Max retries reached for session validation", {
            entity: "CLIENT",
            operation: "validate_session_max_retries",
            userId: privyUser.id,
            retryCount: currentRetryCount + 1,
            maxRetries,
          });
          setError(
            err instanceof Error
              ? err.message
              : "Session validation failed after multiple retries.",
          );
          // Set validating to false here after max retries
          setIsValidatingSession(false);
        }
      } finally {
        // Set false if:
        // 1. No error occurred OR
        // 2. An error occurred BUT we are NOT scheduling a retry (i.e., max retries reached)
        if (!didErrorOccur || (didErrorOccur && !isSchedulingRetry)) {
          log.info(
            "Validation process finished (success or max retries). Setting isValidatingSession=false.",
            {
              entity: "CLIENT",
              operation: "validation_process_end",
              userId: privyUser?.id ?? "unknown",
              success: !didErrorOccur,
            },
          );
          setIsValidatingSession(false);
        }
      }
    },
    [
      privyUser,
      maxRetries,
      initialRetryDelay,
      backoffFactor,
      onSessionValidated,
      isValidatingSession, // Added dependency
    ],
  );

  // Effect to trigger validation
  useEffect(() => {
    // Clear any pending timeout if dependencies change
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    if (
      ready &&
      authenticated &&
      privyUser?.id &&
      !sessionValidated &&
      !isValidatingSession
    ) {
      setRetryCount(0);
      setError(undefined);
      // Don't clear user here, allow privy basic info to persist
      // setUser(null);
      log.info("Conditions met, initiating session validation", {
        entity: "CLIENT",
        operation: "initiate_session_validation",
        userId: privyUser.id,
      });
      void validateSession(0); // Start with retry count 0
    } else if ((!authenticated || !ready) && sessionValidated) {
      // Reset state only if user logs out *after* being validated
      setSessionValidated(false);
      setIsValidatingSession(false);
      setUser(null);
      setError(undefined);
      setRetryCount(0);
      log.info("User logged out or Privy not ready, resetting session state", {
        entity: "CLIENT",
        operation: "reset_session_state",
        ready,
        authenticated,
      });
    }
  }, [
    ready,
    authenticated,
    privyUser?.id,
    sessionValidated,
    isValidatingSession,
    validateSession,
  ]);

  // Simplified effect to update basic user info from privyUser when available
  useEffect(() => {
    if (privyUser) {
      setUser((prev) => ({
        ...(prev || { id: privyUser.id, createdAt: new Date(), role: "user" }), // Initialize with defaults
        id: privyUser.id,
        wallet: privyUser.wallet ?? prev?.wallet,
        email: privyUser.email?.address
          ? { address: privyUser.email.address }
          : prev?.email,
        linkedAccounts:
          privyUser.linkedAccounts
            ?.filter((acc) => acc.type === "wallet")
            .map((acc) => acc.address) ??
          prev?.linkedAccounts ??
          [],
      }));
    } else if (!authenticated && !ready) {
      // Explicitly clear user only when privy is definitively logged out/not ready
      setUser(null);
    }
  }, [privyUser, authenticated, ready]);

  return {
    ready,
    authenticated,
    user,
    isValidatingSession,
    sessionValidated,
    error,
  };
}

// Basic AppError class (you might have this elsewhere)
class AppError extends Error {
  code: string;
  context?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.context = context;
  }
}

// Example ErrorCodes (you might have this elsewhere)
const ErrorCodes = {
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  NETWORK_ERROR: "NETWORK_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  // Add other codes as needed
};
