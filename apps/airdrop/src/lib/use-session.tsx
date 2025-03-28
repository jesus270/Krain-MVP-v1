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
      const response = await fetch("/api/auth/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: privyUser }),
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

      // After session validation, fetch latest user data
      const userResponse = await fetch("/api/user", {
        headers: {
          "x-user-id": privyUser.id,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.user) {
          setUser(userData.user as SessionUser);
        }
      }

      setSessionValidated(true);
      setRetryCount(0);
      setError(undefined);
      onSessionValidated?.();

      log.info("Session validated successfully", {
        entity: "CLIENT",
        operation: "validate_session",
        userId: privyUser.id,
      });
    } catch (error) {
      log.error(error, {
        entity: "CLIENT",
        operation: "validate_session",
        userId: privyUser.id,
        retryCount,
      });

      setRetryCount((prev) => prev + 1);

      if (retryCount < maxRetries - 1) {
        setTimeout(() => void validateSession(), retryDelay * (retryCount + 1));
      } else {
        setError("Session validation failed");
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
