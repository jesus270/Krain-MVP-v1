"use client";

import "@krain/ui/globals.css";
import { Toaster } from "@krain/ui/components/ui/sonner";
import { RootLayout } from "@krain/ui/layouts/root-layout";
import type { Metadata } from "next";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";

// export const metadata: Metadata = {
//   title: "KRAIN Token Sale Signup",
//   description: "Sign up for the $KRAIN token sale",
// };

// Set up Solana network and wallet
const network =
  process.env.NODE_ENV === "production"
    ? WalletAdapterNetwork.Mainnet
    : WalletAdapterNetwork.Devnet;

const endpoint =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network);
const wallets = [new PhantomWalletAdapter()];

// Log the network configuration for debugging
if (typeof window !== "undefined") {
  console.log("Solana Network Configuration:", {
    network,
    endpoint,
    isMainnet: network === WalletAdapterNetwork.Mainnet,
    nodeEnv: process.env.NODE_ENV,
  });
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <RootLayout
          authConfig={{
            privyAppId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
            loadingTitle: "Welcome to the $KRAIN Token Signup",
            loadingDescription: "Please wait while we validate your session...",
            privyLoginMethods: ["wallet"],
          }}
          intercomAppId={process.env.NEXT_PUBLIC_INTERCOM_APP_ID}
        >
          {children}
          <Toaster />
        </RootLayout>
      </WalletProvider>
    </ConnectionProvider>
  );
}
