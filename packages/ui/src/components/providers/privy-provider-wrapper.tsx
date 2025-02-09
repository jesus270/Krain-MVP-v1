"use client";

import { PrivyProvider, useLogin } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { useState } from "react";
import { log } from "@krain/utils";

// Types for props
interface SessionRevalidatorProps {
  children: React.ReactNode;
}

interface PrivyProviderWrapperProps {
  children: React.ReactNode;
  privyAppId: string;
  loginMethods: ("wallet" | "email" | "twitter")[] | undefined;
  validateSession?: boolean;
}

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: true,
});

function SessionRevalidator({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);

  useLogin({
    onComplete: async (user) => {
      try {
        const response = await fetch("/api/auth/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user }),
        });

        if (!response.ok) {
          throw new Error("Failed to establish session");
        }
      } catch (error) {
        log.error("Error establishing session", {
          entity: "CLIENT",
          operation: "establish_session",
          error,
        });
        setError("Failed to establish session. Please try again.");
      }
    },
  });

  return (
    <>
      {children}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </>
  );
}

export function PrivyProviderWrapper({
  children,
  privyAppId,
  loginMethods,
  validateSession = true,
}: PrivyProviderWrapperProps) {
  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          accentColor: "#4c4fc6",
          theme: "#1a1b4d",
          showWalletLoginFirst: true,
          logo: (
            <img
              src="/logo.svg"
              alt="Logo"
              width={150}
              height={40}
              style={{ width: "150px", height: "auto" }}
            />
          ),
          walletChainType: "solana-only",
          walletList: [
            "phantom",
            "detected_wallets",
            "metamask",
            "coinbase_wallet",
            "rainbow",
            "wallet_connect",
          ],
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
        loginMethods: loginMethods?.length ? loginMethods : ["wallet"],
        embeddedWallets: {
          createOnLogin: "off",
          requireUserPasswordOnCreate: false,
        },
        mfa: {
          noPromptOnMfaRequired: false,
        },
      }}
    >
      {validateSession ? (
        <SessionRevalidator>{children}</SessionRevalidator>
      ) : (
        children
      )}
    </PrivyProvider>
  );
}
