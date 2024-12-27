"use client";

import {
  PrivyProvider,
  usePrivy,
  useLogin,
  User,
  LinkedAccountWithMetadata,
  Wallet,
} from "@privy-io/react-auth";
import {
  toSolanaWalletConnectors,
  useSolanaWallets,
} from "@privy-io/react-auth/solana";
import { useEffect, useRef, useCallback, useState } from "react";
import { log } from "@/lib/logger";

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
  const { user, login } = usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const revalidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const walletCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function for timeouts
  const cleanupTimeouts = () => {
    if (revalidationTimeoutRef.current) {
      clearTimeout(revalidationTimeoutRef.current);
      revalidationTimeoutRef.current = null;
    }
    if (walletCheckRef.current) {
      clearTimeout(walletCheckRef.current);
      walletCheckRef.current = null;
    }
  };

  // Function to check wallet connection
  const checkWalletConnection = useCallback(async () => {
    let attempts = 0;
    const maxAttempts = 8;
    const baseDelay = 1000;

    while (attempts < maxAttempts) {
      // First check user.wallet directly
      if (user?.wallet?.address) {
        if (process.env.NODE_ENV === "development") {
          log.info("Found wallet address in user.wallet", {
            entity: "CLIENT",
            operation: "check_wallet_connection",
            walletAddress: user.wallet.address,
          });
        }
        return user.wallet.address;
      }

      // Then check linkedAccounts
      const solanaWallet = user?.linkedAccounts?.find(
        (account) =>
          account.type === "wallet" && account.chainType === "solana",
      ) as Wallet | undefined;

      if (solanaWallet?.address) {
        if (process.env.NODE_ENV === "development") {
          log.info("Found wallet address in linkedAccounts", {
            entity: "CLIENT",
            operation: "check_wallet_connection",
            walletAddress: solanaWallet.address,
          });
        }
        return solanaWallet.address;
      }

      // Finally check solanaWallets
      if (solanaWallets[0]?.address) {
        if (process.env.NODE_ENV === "development") {
          log.info("Found wallet address in solanaWallets", {
            entity: "CLIENT",
            operation: "check_wallet_connection",
            walletAddress: solanaWallets[0].address,
          });
        }
        return solanaWallets[0].address;
      }

      // If we have a wallet but no address, try to connect
      if (solanaWallets[0]) {
        try {
          if (process.env.NODE_ENV === "development") {
            log.info("Found wallet, attempting to connect", {
              entity: "CLIENT",
              operation: "check_wallet_connection",
            });
          }
          await solanaWallets[0].loginOrLink();
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          log.error("Error connecting wallet", {
            entity: "CLIENT",
            operation: "check_wallet_connection",
            error,
          });
        }
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempts), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempts++;

      if (process.env.NODE_ENV === "development") {
        log.info(
          `[CLIENT] Attempt ${attempts}/${maxAttempts} to get wallet address`,
          {
            entity: "CLIENT",
            operation: "check_wallet_connection",
          },
        );
      }
    }

    return null;
  }, [solanaWallets, user]);

  // Debounced revalidation function
  const debouncedRevalidate = useCallback(
    async (user: User, walletAddress: string) => {
      if (isRevalidating) {
        log.info("Skipping revalidation - already in progress", {
          entity: "CLIENT",
          operation: "check_wallet_connection",
        });
        return;
      }

      try {
        setIsRevalidating(true);
        setWalletError(null);

        if (process.env.NODE_ENV === "development") {
          log.info("Starting session revalidation with wallet", {
            entity: "CLIENT",
            operation: "check_wallet_connection",
            walletAddress,
          });
        }

        await revalidateSession(user, walletAddress);

        if (process.env.NODE_ENV === "development") {
          log.info("Session revalidation successful", {
            entity: "CLIENT",
            operation: "check_wallet_connection",
          });
        }
      } catch (error) {
        log.error("Error revalidating session", {
          entity: "CLIENT",
          operation: "check_wallet_connection",
          error,
        });
        setWalletError("Failed to validate session. Please try again.");
      } finally {
        setIsRevalidating(false);
      }
    },
    [revalidateSession, isRevalidating],
  );

  useLogin({
    onComplete: async (user) => {
      try {
        cleanupTimeouts();

        if (process.env.NODE_ENV === "development") {
          log.info("Login completed, checking for wallet", {
            entity: "CLIENT",
            operation: "check_wallet_connection",
          });
        }

        // Check user.wallet first
        if (user?.wallet?.address) {
          if (process.env.NODE_ENV === "development") {
            log.info("Found wallet address in user.wallet", {
              entity: "CLIENT",
              operation: "check_wallet_connection",
              walletAddress: user.wallet.address,
            });
          }
          await debouncedRevalidate(user, user.wallet.address);
          return;
        }

        // Check linkedAccounts
        const solanaWallet = user?.linkedAccounts?.find(
          (account) =>
            account.type === "wallet" && account.chainType === "solana",
        ) as Wallet | undefined;

        if (solanaWallet?.address) {
          if (process.env.NODE_ENV === "development") {
            log.info("Found wallet address in linkedAccounts", {
              entity: "CLIENT",
              operation: "check_wallet_connection",
              walletAddress: solanaWallet.address,
            });
          }
          await debouncedRevalidate(user, solanaWallet.address);
          return;
        }

        // If no wallet found in user object, try connection process
        if (process.env.NODE_ENV === "development") {
          log.info(
            "No wallet found in user object, checking wallet connection",
            {
              entity: "CLIENT",
              operation: "check_wallet_connection",
            },
          );
        }

        const walletAddress = await checkWalletConnection();

        if (walletAddress) {
          if (process.env.NODE_ENV === "development") {
            log.info("Wallet found, scheduling revalidation", {
              entity: "CLIENT",
              operation: "check_wallet_connection",
            });
          }

          revalidationTimeoutRef.current = setTimeout(() => {
            debouncedRevalidate(user, walletAddress);
          }, 2000);
        } else {
          const errorMsg =
            "No wallet address found. Please make sure your wallet is connected and try again.";
          setWalletError(errorMsg);
          log.error("No Solana wallet address found after login", {
            entity: "CLIENT",
            operation: "check_wallet_connection",
            error: errorMsg,
          });

          if (process.env.NODE_ENV === "development") {
            log.info("Scheduling retry in 5 seconds", {
              entity: "CLIENT",
              operation: "check_wallet_connection",
            });
          }

          walletCheckRef.current = setTimeout(async () => {
            const retryAddress = await checkWalletConnection();
            if (retryAddress) {
              debouncedRevalidate(user, retryAddress);
            }
          }, 5000);
        }
      } catch (error) {
        log.error("Error in login callback", {
          entity: "CLIENT",
          operation: "check_wallet_connection",
          error,
        });
        setWalletError("Failed to connect wallet. Please try again.");
      }
    },
  });

  useEffect(() => {
    return () => {
      cleanupTimeouts();
    };
  }, []);

  // Show error message if there's a wallet error
  if (walletError) {
    return (
      <>
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{walletError}</p>
          <button
            onClick={() => {
              setWalletError(null);
              login();
            }}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
        {children}
      </>
    );
  }

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
      log.error(error, {
        operation: "revalidate_session",
        entity: "CLIENT",
        userId: user.id,
        walletAddress,
      });
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
          logo: (
            <img
              src="/logo.png"
              alt="Logo"
              width={150}
              height={40}
              style={{ width: "150px", height: "auto" }}
            />
          ),
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
