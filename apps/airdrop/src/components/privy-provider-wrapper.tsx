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
        loginMethods: ["wallet", "email", "twitter"],
        embeddedWallets: {
          createOnLogin: "off",
          requireUserPasswordOnCreate: false,
        },
        mfa: {
          noPromptOnMfaRequired: false,
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
