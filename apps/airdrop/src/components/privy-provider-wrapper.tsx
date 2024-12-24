"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

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
const INITIAL_DELAY = 1000;

export function PrivyProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set");
  }

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
      onSuccess={async (user) => {
        try {
          console.log("[CLIENT] Setting user session:", {
            id: user.id,
            wallet: user.wallet,
          });

          // Add initial delay to ensure Privy state is settled
          await new Promise((resolve) => setTimeout(resolve, INITIAL_DELAY));

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

              // Wait a bit before verifying to ensure cookie is set
              await new Promise((resolve) => setTimeout(resolve, 500));

              // Verify the session was set by making a test request
              const testResponse = await fetch("/api/auth/verify", {
                credentials: "include",
              });

              if (testResponse.ok) {
                success = true;
                console.log("[CLIENT] User session verified successfully");
              } else {
                const data = await testResponse.json();
                throw new Error(data.error || "Session verification failed");
              }
            } catch (error) {
              lastError = error;
              console.error(
                `[CLIENT] Attempt ${MAX_RETRIES - retries + 1} failed:`,
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
              "[CLIENT] Failed to set and verify user session after all retries",
              lastError,
            );
            // Optionally show an error to the user here
            throw new Error("Failed to establish secure session");
          }
        } catch (error) {
          console.error("[CLIENT] Error in auth callback:", error);
          // Re-throw to trigger error boundary if needed
          throw error;
        }
      }}
    >
      {children}
    </PrivyProvider>
  );
}
