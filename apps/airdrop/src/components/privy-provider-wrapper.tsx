"use client";

import { PrivyProvider, usePrivy, useLogin } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { useEffect } from "react";

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: true,
});

const chain = {
  id: 101,
  name: "Solana",
  type: "solana",
  rpcUrls: {
    default: {
      http: ["https://api.mainnet-beta.solana.com"],
    },
  },
  nativeCurrency: {
    decimals: 9,
    name: "SOL",
    symbol: "SOL",
  },
};

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000;

function SessionRevalidator({
  children,
  revalidateSession,
}: {
  children: React.ReactNode;
  revalidateSession: (user: any) => Promise<void>;
}) {
  const { user } = usePrivy();
  const { login } = useLogin({
    onComplete: async (user) => {
      try {
        await revalidateSession(user);
      } catch (error) {
        console.error("[CLIENT] Error in auth callback:", error);
      }
    },
  });

  useEffect(() => {
    if (!user) return;

    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/verify", {
          credentials: "include",
        });

        if (!response.ok) {
          console.log("[CLIENT] Session expired, attempting to revalidate");
          await revalidateSession(user);
        }
      } catch (error) {
        console.error("[CLIENT] Error checking session:", error);
      }
    };

    // Check session immediately
    checkSession();

    // Set up periodic session checks
    const interval = setInterval(checkSession, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [user, revalidateSession]);

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

  const revalidateSession = async (user: any) => {
    try {
      console.log("[CLIENT] Revalidating user session:", {
        id: user.id,
        wallet: user.wallet,
      });

      // Try to set the session with retries
      let retries = MAX_RETRIES;
      let success = false;
      let lastError = null;

      while (retries > 0 && !success) {
        try {
          const response = await fetch("/api/auth/callback", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user }),
            credentials: "include",
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to set user session");
          }

          // Verify the session was set by making a test request
          const testResponse = await fetch("/api/auth/verify", {
            credentials: "include",
          });

          if (testResponse.ok) {
            success = true;
            console.log("[CLIENT] User session revalidated successfully");
          } else {
            const data = await testResponse.json();
            throw new Error(data.error || "Session verification failed");
          }
        } catch (error) {
          lastError = error;
          console.error(
            `[CLIENT] Revalidation attempt ${MAX_RETRIES - retries + 1} failed:`,
            error,
          );
          retries--;
          if (retries > 0) {
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries)),
            );
          }
        }
      }

      if (!success) {
        console.error(
          "[CLIENT] Failed to revalidate session after all retries",
          lastError,
        );
        throw new Error("Failed to reestablish secure session");
      }
    } catch (error) {
      console.error("[CLIENT] Error in session revalidation:", error);
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
