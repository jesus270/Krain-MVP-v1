"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "../ui/button";

interface CoinbaseWalletButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function CoinbaseWalletButton({
  onSuccess,
  onError,
}: CoinbaseWalletButtonProps) {
  const { login } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const handleConnect = async () => {
    try {
      setIsLoading(true);

      // Set a timeout to reset the loading state if the connection takes too long
      const id = setTimeout(() => {
        setIsLoading(false);
        onError?.(new Error("Connection timeout. Please try again."));
      }, 30000); // 30 seconds timeout

      setTimeoutId(id);

      // Open the Privy login modal with Coinbase Wallet
      await login();

      // Clear the timeout if successful
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }

      setIsLoading(false);
      onSuccess?.();
    } catch (error) {
      setIsLoading(false);

      // Clear the timeout if there's an error
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }

      onError?.(
        error instanceof Error
          ? error
          : new Error("Failed to connect to Coinbase Wallet"),
      );
    }
  };

  return (
    <Button onClick={handleConnect} disabled={isLoading} className="w-full">
      {isLoading ? "Connecting..." : "Connect Coinbase Wallet"}
    </Button>
  );
}
