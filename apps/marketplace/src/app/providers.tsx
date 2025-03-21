"use client";

import { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { usePrivyAuth } from "./utils/use-privy-auth";

// Privy configuration
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Authentication status component that shows when a user is being synced
 */
function AuthStatus() {
  const { isLoading, error, dbUser } = usePrivyAuth();

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-100 text-blue-800 p-3 rounded-md shadow-md z-50">
        Syncing your account...
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 text-red-800 p-3 rounded-md shadow-md z-50">
        Error: {error}
      </div>
    );
  }

  if (dbUser) {
    return null; // Don't show anything when successfully synced
  }

  return null;
}

/**
 * Providers wrapper for the application
 * Includes Privy authentication with database sync
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["email", "wallet"],
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          logo: "https://your-logo-url.com/logo.png",
        },
      }}
    >
      {children}
      <AuthStatus />
    </PrivyProvider>
  );
}
