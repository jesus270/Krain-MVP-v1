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

  // Call the auth callback API to set the user_id cookie
  const callAuthCallback = useCallback(async (userData: any) => {
    try {
      console.log("Calling auth callback with user data:", userData);

      const response = await fetch("/api/auth/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: userData }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Auth callback failed response:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(
          `Auth callback failed: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();
      console.log("Auth callback successful:", data);
      return data;
    } catch (err) {
      console.error("Error calling auth callback:", err);
      throw err;
    }
  }, []);

  // Directly fetch user data from the API
  const fetchUserData = useCallback(async () => {
    try {
      console.log("Fetching user data from API");
      const response = await fetch("/api/user");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch user data:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        return null;
      }

      const data = await response.json();
      console.log("Fetched user data successfully:", data);
      return data.user;
    } catch (err) {
      console.error("Error fetching user data:", err);
      return null;
    }
  }, []);

  // Sync the Privy user with our database when they authenticate
  const syncUser = useCallback(async () => {
    if (!user || !authenticated) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log("Starting user sync process for:", user.id);

      // Format wallet information if available
      const wallet = user?.wallet?.address
        ? {
            address: user.wallet.address,
            chainId:
              "chainId" in user.wallet ? String(user.wallet.chainId) : "1",
          }
        : undefined;

      // Convert Privy user to the format expected by our handler
      const privyUserData = {
        id: user.id,
        email: user.email?.address,
        wallet: wallet,
        linkedAccounts: user.linkedAccounts || [],
      };

      console.log("Prepared privyUserData:", privyUserData);

      // First, call the auth callback to set the user_id cookie
      try {
        await callAuthCallback({
          id: user.id,
          email: user.email?.address,
        });
        console.log("Auth callback completed successfully");
      } catch (callbackError) {
        console.error("Auth callback failed:", callbackError);
        setError("Failed to establish session. Please try again.");
        setIsLoading(false);
        return;
      }

      // Try to fetch the user data directly first - this should work if the user already exists
      const userData = await fetchUserData();
      if (userData) {
        console.log("Successfully fetched existing user data:", userData);
        setDbUser(userData);
        setIsLoading(false);
        return;
      }

      // If no existing user, attempt to sync with our database using handlePrivyAuth
      try {
        console.log(
          "No existing user found. Calling handlePrivyAuth with:",
          privyUserData,
        );
        const authUser = await handlePrivyAuth(privyUserData);
        console.log("handlePrivyAuth result:", authUser);

        if (authUser) {
          setDbUser(authUser);
          console.log("User synced successfully:", authUser);
        } else {
          console.error("handlePrivyAuth returned null or undefined");
          setError("Failed to sync user with database");
        }
      } catch (syncError) {
        console.error("Error in handlePrivyAuth:", syncError);
        setError("Failed to sync user data");
      }
    } catch (err) {
      console.error("Overall sync error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [user, authenticated, callAuthCallback, fetchUserData]);

  // Attempt to load user data when component mounts if user_id cookie exists
  useEffect(() => {
    const loadUserData = async () => {
      // Don't attempt to load if we're not authenticated yet
      if (!authenticated) return;

      console.log("Loading user data");
      const userData = await fetchUserData();
      if (userData) {
        console.log("Found user data on initial load:", userData);
        setDbUser(userData);
      }
    };

    // Only run this effect once when component mounts and when auth status changes
    loadUserData();
  }, [authenticated, fetchUserData]);

  // Sync user when they authenticate
  useEffect(() => {
    if (ready && authenticated && user && !dbUser) {
      console.log("User authenticated but no dbUser, syncing...", user.id);
      syncUser();
    } else if (ready && !authenticated) {
      console.log("User not authenticated, clearing dbUser");
      setDbUser(null);
    }
  }, [ready, authenticated, user, dbUser, syncUser]);

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
    refreshUser: fetchUserData,
  };
}
