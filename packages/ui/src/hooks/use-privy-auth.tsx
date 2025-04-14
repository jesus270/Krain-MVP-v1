"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import type { WalletWithMetadata } from "@privy-io/react-auth";
import { log } from "@krain/utils";
import type { SessionUser } from "@krain/session";

// Infer the PrivyUser type from the usePrivy hook return value
type PrivyHookReturn = ReturnType<typeof usePrivy>;
type PrivyUser = PrivyHookReturn["user"];

// Define a type for linked accounts based on PrivyUser if possible, or use a generic one
type PrivyLinkedAccount = NonNullable<PrivyUser>["linkedAccounts"][number];

interface UsePrivyAuthOptions {
  maxRetries?: number;
  retryDelay?: number;
}

// Define the explicit return type for the hook
interface UsePrivyAuthReturn {
  user: SessionUser | null; // Using SessionUser as the primary user type exposed
  privyUser: PrivyUser | null; // Use the inferred PrivyUser type
  authenticated: boolean;
  ready: boolean;
  isLoading: boolean;
  error: string | null;
  sessionValidated: boolean;
  login: () => void; // Typically doesn't return anything significant
  logout: () => Promise<void>; // Logout is often async
  validateSession: () => Promise<void>; // This is async

  // Refine signatures based on latest build errors
  linkEmail: () => Promise<any>; // Takes NO args
  connectWallet: (options?: any) => Promise<void>; // Takes optional options obj
  unlinkEmail: (email: string) => Promise<PrivyUser>; // Takes email string, returns User
  unlinkWallet: (address: string) => Promise<PrivyUser>; // Takes address string, returns User
  linkTwitter: () => Promise<void>; // Returns void, no args
  unlinkTwitter: (accountId: string) => Promise<PrivyUser>; // Takes accountId string, returns User
  exportWallet: () => Promise<void>;
  linkGoogle: () => Promise<void>; // Returns void, no args
  unlinkGoogle: (accountId: string) => Promise<PrivyUser>; // Takes accountId string, returns User
  linkDiscord: () => Promise<void>; // Returns void, no args
  unlinkDiscord: (accountId: string) => Promise<PrivyUser>; // Takes accountId string, returns User
  linkGithub: () => Promise<void>; // Returns void, no args
  unlinkGithub: (accountId: string) => Promise<PrivyUser>; // Takes accountId string, returns User
  linkApple: () => Promise<void>; // Returns void, no args
  unlinkApple: (accountId: string) => Promise<PrivyUser>; // Takes accountId string, returns User
}

/**
 * Hook for handling Privy authentication and syncing with our database
 * Use this in your app's authentication flow
 */
export function usePrivyAuth({
  maxRetries = 3,
  retryDelay = 2000,
}: UsePrivyAuthOptions = {}): UsePrivyAuthReturn {
  const {
    user: privyUser,
    authenticated,
    ready,
    login: privyLogin,
    logout: privyLogout,
    linkEmail: privyLinkEmail,
    connectWallet: privyConnectWallet,
    unlinkEmail: privyUnlinkEmail,
    unlinkWallet: privyUnlinkWallet,
    linkTwitter: privyLinkTwitter,
    unlinkTwitter: privyUnlinkTwitter,
    exportWallet: privyExportWallet,
    linkGoogle: privyLinkGoogle,
    unlinkGoogle: privyUnlinkGoogle,
    linkDiscord: privyLinkDiscord,
    unlinkDiscord: privyUnlinkDiscord,
    linkGithub: privyLinkGithub,
    unlinkGithub: privyUnlinkGithub,
    linkApple: privyLinkApple,
    unlinkApple: privyUnlinkApple,
  } = usePrivy();
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

  // Validate the session with retry logic
  const validateSession = useCallback(async () => {
    if (!privyUser?.id || retryCount >= maxRetries) return;

    try {
      setIsLoading(true);
      log.info("Starting session validation", {
        entity: "CLIENT",
        operation: "validate_session_start",
        userId: privyUser.id,
      });

      // Convert Privy user to the format expected by our handler
      const privyUserData = {
        id: privyUser.id,
        email: privyUser.email?.address,
        wallet: privyUser.wallet
          ? {
              address: privyUser.wallet.address,
            }
          : undefined,
        linkedAccounts: privyUser.linkedAccounts
          // Add explicit type for 'account' parameter
          ?.map((account: PrivyLinkedAccount) => {
            // Check if it's a known account type with an address property
            if ("address" in account && typeof account.address === "string") {
              return account.address;
            }
            return null; // Return null for unknown types or accounts without an address
          })
          // Add explicit type for 'address' parameter
          .filter(
            (address: string | null): address is string => address !== null,
          ), // Filter out any nulls
        createdAt: privyUser.createdAt
          ? new Date(privyUser.createdAt).getTime()
          : Date.now(),
        isGuest: privyUser.isGuest || false,
        hasAcceptedTerms: true, // Assuming terms are accepted implicitly here
      };

      // First call auth callback to establish session
      const response = await fetch("/api/auth/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(privyUserData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Session validation failed with status: ${response.status}, message: ${errorText}`,
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
      } else {
        throw new Error(
          `User data fetch failed with status: ${userResponse.status}`,
        );
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
        (prev: SessionUser | null) =>
          ({
            ...(prev || {}),
            id: privyUser.id,
            // Initialize createdAt here, will be overwritten by DB data later if available
            createdAt:
              prev?.createdAt || new Date(privyUser.createdAt || Date.now()),
            wallet: privyUser.wallet,
            email: privyUser.email,
            // Ensure linkedAccounts here matches SessionUser (string[])
            linkedAccounts: privyUser.linkedAccounts
              ?.filter(
                // Add explicit type for 'account' parameter
                (account: PrivyLinkedAccount): account is WalletWithMetadata =>
                  account.type === "wallet" && "address" in account,
              )
              // Add explicit type for 'wallet' parameter
              .map((wallet: WalletWithMetadata) => wallet.address),
          }) as SessionUser, // Temporarily cast, merge logic below is the final source
      );
    }
  }, [privyUser]);

  // Validate session when authenticated but not yet validated
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

  // Wrap Privy functions with useCallback, matching interface signatures
  const login = useCallback(() => {
    privyLogin();
  }, [privyLogin]);

  const handleLogout = useCallback(async () => {
    try {
      await privyLogout(); // Use renamed privyLogout
      setDbUser(null);
      setSessionValidated(false);
      setRetryCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [privyLogout]);

  // Wrap other Privy functions, ensuring arguments and return types align with the interface
  const linkEmail = useCallback(
    async () => await privyLinkEmail(),
    [privyLinkEmail],
  ); // No args
  const connectWallet = useCallback(
    async (options?: any) => await privyConnectWallet(options),
    [privyConnectWallet],
  );
  const unlinkEmail = useCallback(
    async (email: string): Promise<PrivyUser> => await privyUnlinkEmail(email),
    [privyUnlinkEmail],
  );
  const unlinkWallet = useCallback(
    async (address: string): Promise<PrivyUser> =>
      await privyUnlinkWallet(address),
    [privyUnlinkWallet],
  );
  const linkTwitter = useCallback(
    async () => await privyLinkTwitter(),
    [privyLinkTwitter],
  );
  const unlinkTwitter = useCallback(
    async (accountId: string): Promise<PrivyUser> =>
      await privyUnlinkTwitter(accountId),
    [privyUnlinkTwitter],
  );
  const exportWallet = useCallback(
    async () => await privyExportWallet(),
    [privyExportWallet],
  );
  const linkGoogle = useCallback(
    async () => await privyLinkGoogle(),
    [privyLinkGoogle],
  );
  const unlinkGoogle = useCallback(
    async (accountId: string): Promise<PrivyUser> =>
      await privyUnlinkGoogle(accountId),
    [privyUnlinkGoogle],
  );
  const linkDiscord = useCallback(
    async () => await privyLinkDiscord(),
    [privyLinkDiscord],
  );
  const unlinkDiscord = useCallback(
    async (accountId: string): Promise<PrivyUser> =>
      await privyUnlinkDiscord(accountId),
    [privyUnlinkDiscord],
  );
  const linkGithub = useCallback(
    async () => await privyLinkGithub(),
    [privyLinkGithub],
  );
  const unlinkGithub = useCallback(
    async (accountId: string): Promise<PrivyUser> =>
      await privyUnlinkGithub(accountId),
    [privyUnlinkGithub],
  );
  const linkApple = useCallback(
    async () => await privyLinkApple(),
    [privyLinkApple],
  );
  const unlinkApple = useCallback(
    async (accountId: string): Promise<PrivyUser> =>
      await privyUnlinkApple(accountId),
    [privyUnlinkApple],
  );

  // Merge the dbUser with privyUser details for a complete picture
  const mergedUser = dbUser
    ? ({
        ...privyUser, // Start with Privy details (like createdAt, linkedAccounts raw)
        ...dbUser, // Overwrite with DB details (id, email, wallet, role, etc.)
        // Ensure specific types match SessionUser if necessary
        // Ensure createdAt is a Date object, using dbUser's if available, else Privy's or now
        createdAt: dbUser.createdAt
          ? new Date(dbUser.createdAt)
          : privyUser?.createdAt
            ? new Date(privyUser.createdAt)
            : new Date(),
        // Ensure email matches SessionUser: { address: string }
        email: dbUser.email
          ? { address: dbUser.email.address } // Use only address from dbUser.email
          : privyUser?.email // Fallback to privy email if needed (already { address: string } type)
            ? { address: privyUser.email.address } // Ensure fallback also matches
            : undefined,
        // Ensure wallet matches SessionUser: { address: string }
        wallet: dbUser.wallet
          ? { address: dbUser.wallet.address } // Use only address from dbUser.wallet
          : privyUser?.wallet // Fallback to privy wallet
            ? { address: privyUser.wallet.address } // Ensure fallback also matches
            : undefined,
        // Ensure linkedAccounts is string[] from dbUser or derived from privyUser
        linkedAccounts:
          (dbUser.linkedAccounts as string[] | undefined) ?? // Prefer dbUser.linkedAccounts if it's string[]
          privyUser?.linkedAccounts // Fallback: map privyUser linkedAccounts (objects) to addresses (string[])
            ?.filter(
              (account: PrivyLinkedAccount): account is WalletWithMetadata =>
                account.type === "wallet" && "address" in account,
            )
            .map((wallet: WalletWithMetadata) => wallet.address) ??
          [], // Default to empty array if none exist
        // Include Telegram fields from dbUser (assuming they are part of SessionUser or handled correctly)
        telegramUsername: (dbUser as any).telegramUsername,
        hasJoinedTelegramCommunity: (dbUser as any).hasJoinedTelegramCommunity,
        hasJoinedTelegramAnnouncement: (dbUser as any)
          .hasJoinedTelegramAnnouncement,
        role: dbUser.role, // Ensure role from dbUser is included
        // REMOVED plan, status, points as they are not in SessionUser
        // plan: dbUser.plan,
        // status: dbUser.status,
        // points: dbUser.points,
      } as SessionUser) // Cast the final merged object to SessionUser
    : null;

  return {
    user: mergedUser,
    privyUser,
    authenticated,
    ready,
    isLoading,
    error,
    sessionValidated,
    login,
    logout: handleLogout,
    validateSession,
    linkEmail,
    connectWallet,
    unlinkEmail,
    unlinkWallet,
    linkTwitter,
    unlinkTwitter,
    exportWallet,
    linkGoogle,
    unlinkGoogle,
    linkDiscord,
    unlinkDiscord,
    linkGithub,
    unlinkGithub,
    linkApple,
    unlinkApple,
  };
}
