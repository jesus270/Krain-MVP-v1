"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { handlePrivyAuth } from "@krain/session";

/**
 * Hook for handling Privy authentication and syncing with our database
 * Use this in your app's authentication flow
 */
export function usePrivyAuth() {
  const { user, authenticated, ready, login, logout } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbUser, setDbUser] = useState<any>(null);

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

  // Sync the Privy user with our database when they authenticate
  const syncUser = useCallback(async () => {
    if (!user || !authenticated) return;

    try {
      setIsLoading(true);
      setError(null);

      // Convert Privy user to the format expected by our handler
      const privyUserData = {
        id: user.id,
        created_at: user.createdAt
          ? new Date(user.createdAt).getTime()
          : Date.now(),
        is_guest: user.isGuest || false,
        linked_accounts: user.linkedAccounts || [],
        has_accepted_terms: true, // Assuming Privy handles terms acceptance
      };

      // Call our server action to sync the user
      const authUser = await handlePrivyAuth(privyUserData);

      if (authUser) {
        setDbUser(authUser);
      } else {
        setError("Failed to sync user with database");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [user, authenticated]);

  // Sync user when they authenticate
  useEffect(() => {
    if (ready && authenticated && user) {
      syncUser();
    } else if (ready && !authenticated) {
      setDbUser(null);
    }
  }, [ready, authenticated, user, syncUser]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setDbUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [logout]);

  return {
    // Privy state
    user,
    authenticated,
    ready,

    // Database state
    dbUser,
    isLoading,
    error,

    // Actions
    login,
    logout: handleLogout,
    syncUser,
  };
}
