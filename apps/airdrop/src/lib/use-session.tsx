"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect, useCallback } from "react";
import { log } from "@krain/utils";

interface UseSessionOptions {
  onSessionValidated?: () => void;
  maxRetries?: number;
  retryDelay?: number;
}

export function useSession({
  onSessionValidated,
  maxRetries = 3,
  retryDelay = 2000,
}: UseSessionOptions = {}) {
  const { ready, authenticated, user } = usePrivy();
  const [isValidatingSession, setIsValidatingSession] = useState(false);
  const [sessionValidated, setSessionValidated] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [retryCount, setRetryCount] = useState(0);

  const validateSession = useCallback(async () => {
    if (!user?.id || retryCount >= maxRetries) {
      setIsValidatingSession(false);
      return;
    }

    try {
      // Only validate session if we have a user ID and we're authenticated
      if (!authenticated) {
        setSessionValidated(false);
        setIsValidatingSession(false);
        return;
      }

      const response = await fetch("/api/auth/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user }),
      });

      if (!response.ok) {
        throw new Error(
          `Session validation failed with status: ${response.status}`,
        );
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error("Session validation response indicated failure");
      }

      setSessionValidated(true);
      setRetryCount(0);
      setError(undefined);
      onSessionValidated?.();

      log.info("Session validated successfully", {
        entity: "CLIENT",
        operation: "validate_session",
        userId: user.id,
      });
    } catch (error) {
      log.error(error, {
        entity: "CLIENT",
        operation: "validate_session",
        userId: user.id,
        retryCount,
      });

      setRetryCount((prev) => prev + 1);
      setSessionValidated(false);

      if (retryCount < maxRetries - 1) {
        setTimeout(() => void validateSession(), retryDelay * (retryCount + 1));
      } else {
        setError("Session validation failed");
        // Reset validation state to allow future retries
        setRetryCount(0);
      }
    } finally {
      setIsValidatingSession(false);
    }
  }, [
    user,
    authenticated,
    retryCount,
    maxRetries,
    retryDelay,
    onSessionValidated,
  ]);

  useEffect(() => {
    if (
      ready &&
      authenticated &&
      user?.id &&
      !sessionValidated &&
      !isValidatingSession
    ) {
      setIsValidatingSession(true);
      void validateSession();
    }
  }, [
    ready,
    authenticated,
    user?.id,
    sessionValidated,
    isValidatingSession,
    validateSession,
  ]);

  // If not authenticated, consider session not validated
  useEffect(() => {
    if (!authenticated) {
      setSessionValidated(false);
      setIsValidatingSession(false);
      setError(undefined);
      setRetryCount(0);
    }
  }, [authenticated]);

  return {
    ready,
    authenticated,
    user,
    isValidatingSession,
    sessionValidated: authenticated && sessionValidated,
    error,
  };
}
