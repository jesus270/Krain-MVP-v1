"use client";

import { PrivyProvider, usePrivy, useLogin } from "@privy-io/react-auth";
import {
  toSolanaWalletConnectors,
  useSolanaWallets,
} from "@privy-io/react-auth/solana";
import { useEffect } from "react";

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: true,
});

function SessionRevalidator({
  children,
  revalidateSession,
}: {
  children: React.ReactNode;
  revalidateSession: (user: any, walletAddress: string) => Promise<void>;
}) {
  const { user } = usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();
  const { login } = useLogin({
    onComplete: async (user) => {
      try {
        const walletAddress = solanaWallets[0]?.address;
        if (walletAddress) {
          await revalidateSession(user, walletAddress);
        } else {
          console.error("[CLIENT] No Solana wallet address found after login");
        }
      } catch (error) {
        console.error("[CLIENT] Auth callback failed");
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
          const walletAddress = solanaWallets[0]?.address;
          if (walletAddress) {
            await revalidateSession(user, walletAddress);
          } else {
            console.error(
              "[CLIENT] No Solana wallet address found during session check",
            );
          }
        }
      } catch (error) {
        console.error("[CLIENT] Session check failed");
      }
    };

    // Check session immediately
    checkSession();

    // Set up periodic session checks
    const interval = setInterval(checkSession, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [user, revalidateSession, solanaWallets]);

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

  const revalidateSession = async (user: any, walletAddress: string) => {
    try {
      // Try to establish a new session
      const response = await fetch("/api/auth/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            id: user.id,
            wallet: {
              address: walletAddress,
            },
          },
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("[CLIENT] Session error:", data);
        throw new Error(data.error || "Failed to set user session");
      }

      // Verify the session was set
      const verifyResponse = await fetch("/api/auth/verify", {
        credentials: "include",
      });

      if (!verifyResponse.ok) {
        throw new Error("Failed to verify session");
      }
    } catch (error) {
      console.error("[CLIENT] Session revalidation error:", error);
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
