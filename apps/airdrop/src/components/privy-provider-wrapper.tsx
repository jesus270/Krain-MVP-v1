"use client";

import { PrivyProvider, usePrivy, useLogin, User } from "@privy-io/react-auth";
import {
  toSolanaWalletConnectors,
  useSolanaWallets,
} from "@privy-io/react-auth/solana";
import { useEffect, useRef, useCallback, useState } from "react";

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: true,
});

function SessionRevalidator({
  children,
  revalidateSession,
}: {
  children: React.ReactNode;
  revalidateSession: (user: User, walletAddress: string) => Promise<void>;
}) {
  const { user } = usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const revalidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced revalidation function
  const debouncedRevalidate = useCallback(
    async (user: User, walletAddress: string) => {
      if (isRevalidating) {
        console.info("[CLIENT] Skipping revalidation - already in progress");
        return;
      }

      try {
        setIsRevalidating(true);
        await revalidateSession(user, walletAddress);
      } catch (error) {
        console.error("[CLIENT] Error revalidating session:", error);
      } finally {
        setIsRevalidating(false);
      }
    },
    [revalidateSession, isRevalidating],
  );

  useLogin({
    onComplete: async (user) => {
      try {
        // Clear any pending revalidation
        if (revalidationTimeoutRef.current !== null) {
          clearTimeout(revalidationTimeoutRef.current);
          revalidationTimeoutRef.current = null;
        }

        // Wait for wallet to be available
        let attempts = 0;
        while (!solanaWallets[0]?.address && attempts < 5) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          attempts++;
        }

        const walletAddress = solanaWallets[0]?.address;
        if (walletAddress) {
          // Add slight delay to ensure any previous session operations are complete
          revalidationTimeoutRef.current = setTimeout(() => {
            debouncedRevalidate(user, walletAddress);
          }, 1000);
        } else {
          console.error("[CLIENT] No Solana wallet address found after login");
        }
      } catch (error) {
        console.error("[CLIENT] Error in login callback:", error);
      }
    },
  });

  useEffect(() => {
    if (!user) return;

    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        if (!response.ok) {
          // Clear any pending revalidation
          if (revalidationTimeoutRef.current !== null) {
            clearTimeout(revalidationTimeoutRef.current);
            revalidationTimeoutRef.current = null;
          }

          // Wait for wallet to be available
          let attempts = 0;
          while (!solanaWallets[0]?.address && attempts < 5) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            attempts++;
          }

          const walletAddress = solanaWallets[0]?.address;
          if (walletAddress) {
            // Add slight delay to ensure any previous session operations are complete
            revalidationTimeoutRef.current = setTimeout(() => {
              debouncedRevalidate(user, walletAddress);
            }, 1000);
          } else {
            console.error(
              "[CLIENT] No Solana wallet address found during session check",
            );
          }
        }
      } catch (error) {
        console.error("[CLIENT] Session check failed:", error);
      }
    };

    // Check session immediately
    checkSession();

    // Set up periodic session checks
    const interval = setInterval(checkSession, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      clearInterval(interval);
      if (revalidationTimeoutRef.current !== null) {
        clearTimeout(revalidationTimeoutRef.current);
        revalidationTimeoutRef.current = null;
      }
    };
  }, [user, debouncedRevalidate, solanaWallets]);

  return <>{children}</>;
}

export function PrivyProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set");
  }

  const revalidateSession = async (user: User, walletAddress: string) => {
    try {
      const response = await fetch("/api/auth/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        body: JSON.stringify({
          user,
          walletAddress,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to revalidate session");
      }
    } catch (error) {
      console.error("[CLIENT] Error revalidating session:", error);
      throw error;
    }
  };

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        appearance: {
          accentColor: "#4c4fc6",
          theme: "#1a1b4d",
          showWalletLoginFirst: true,
          logo: "logo.png",
          walletChainType: "solana-only",
          walletList: ["detected_solana_wallets", "phantom"],
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
        loginMethods: ["wallet"],
        embeddedWallets: {
          createOnLogin: "off",
          requireUserPasswordOnCreate: false,
        },
        mfa: {
          noPromptOnMfaRequired: false,
        },
      }}
    >
      <SessionRevalidator revalidateSession={revalidateSession}>
        {children}
      </SessionRevalidator>
    </PrivyProvider>
  );
}
