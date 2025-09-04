// src/hooks/use-privy-auth.tsx
import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { log } from "@krain/utils";
function usePrivyAuth({
  maxRetries = 3,
  retryDelay = 2e3
} = {}) {
  const {
    user: privyUser,
    authenticated,
    ready,
    login: privyLogin,
    logout: privyLogout,
    linkEmail: privyLinkEmail,
    connectWallet: privyConnectWallet,
    unlinkEmail: privyUnlinkEmail,
    unlinkWallet: privyUnlinkWallet,
    linkTwitter: privyLinkTwitter,
    unlinkTwitter: privyUnlinkTwitter,
    exportWallet: privyExportWallet,
    linkGoogle: privyLinkGoogle,
    unlinkGoogle: privyUnlinkGoogle,
    linkDiscord: privyLinkDiscord,
    unlinkDiscord: privyUnlinkDiscord,
    linkGithub: privyLinkGithub,
    unlinkGithub: privyUnlinkGithub,
    linkApple: privyLinkApple,
    unlinkApple: privyUnlinkApple
  } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sessionValidated, setSessionValidated] = useState(false);
  useEffect(() => {
    const handleWalletTimeout = () => {
      const walletConnectModal = document.querySelector(
        '[role="dialog"][aria-modal="true"]'
      );
      if (walletConnectModal) {
        const loadingIndicator = walletConnectModal.querySelector(
          '[role="progressbar"]'
        );
        if (loadingIndicator) {
          const timeoutId = setTimeout(() => {
            const closeButton = walletConnectModal.querySelector(
              'button[aria-label="Close"]'
            );
            if (closeButton && closeButton instanceof HTMLElement) {
              closeButton.click();
            }
          }, 3e4);
          return () => clearTimeout(timeoutId);
        }
      }
    };
    if (ready && !authenticated) {
      handleWalletTimeout();
    }
    return () => {
    };
  }, [ready, authenticated]);
  const validateSession = useCallback(async () => {
    if (!privyUser?.id || retryCount >= maxRetries) return;
    try {
      setIsLoading(true);
      log.info("Starting session validation", {
        entity: "CLIENT",
        operation: "validate_session_start",
        userId: privyUser.id
      });
      const privyUserData = {
        id: privyUser.id,
        email: privyUser.email?.address,
        wallet: privyUser.wallet ? {
          address: privyUser.wallet.address
        } : void 0,
        linkedAccounts: privyUser.linkedAccounts?.map((account) => {
          if ("address" in account && typeof account.address === "string") {
            return account.address;
          }
          return null;
        }).filter(
          (address) => address !== null
        ),
        // Filter out any nulls
        createdAt: privyUser.createdAt ? new Date(privyUser.createdAt).getTime() : Date.now(),
        isGuest: privyUser.isGuest || false,
        hasAcceptedTerms: true
        // Assuming terms are accepted implicitly here
      };
      const response = await fetch("/api/auth/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(privyUserData)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Session validation failed with status: ${response.status}, message: ${errorText}`
        );
      }
      const userResponse = await fetch("/api/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": privyUser.id
        },
        credentials: "include"
        // This ensures cookies are sent with the request
      });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.user) {
          if (userData.user.createdAt && !(userData.user.createdAt instanceof Date)) {
            userData.user.createdAt = new Date(userData.user.createdAt);
          }
          setDbUser(userData.user);
          setSessionValidated(true);
          log.info("User data loaded successfully", {
            entity: "CLIENT",
            operation: "user_data_load",
            userId: privyUser.id
          });
        } else {
          log.warn("User data response missing user object", {
            entity: "CLIENT",
            operation: "user_data_load",
            userId: privyUser.id,
            response: userData
          });
        }
      } else {
        throw new Error(
          `User data fetch failed with status: ${userResponse.status}`
        );
      }
    } catch (error2) {
      const errorMessage = error2 instanceof Error ? error2.message : String(error2);
      log.error(errorMessage, {
        entity: "CLIENT",
        operation: "validate_session",
        userId: privyUser.id,
        retryCount,
        errorStack: error2 instanceof Error ? error2.stack : void 0
      });
      setRetryCount((prev) => prev + 1);
      if (retryCount < maxRetries - 1) {
        log.info(
          `Retrying session validation in ${retryDelay * (retryCount + 1)}ms`,
          {
            entity: "CLIENT",
            operation: "validate_session_retry",
            userId: privyUser.id,
            retryCount: retryCount + 1,
            maxRetries
          }
        );
        setTimeout(() => void validateSession(), retryDelay * (retryCount + 1));
      } else {
        setError("Session validation failed after maximum retries");
        log.error("Max retries reached for session validation", {
          entity: "CLIENT",
          operation: "validate_session_max_retries",
          userId: privyUser.id,
          retryCount,
          maxRetries
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [privyUser, retryCount, maxRetries, retryDelay]);
  useEffect(() => {
    if (privyUser) {
      setDbUser(
        (prev) => ({
          ...prev || {},
          id: privyUser.id,
          // Initialize createdAt here, will be overwritten by DB data later if available
          createdAt: prev?.createdAt || new Date(privyUser.createdAt || Date.now()),
          wallet: privyUser.wallet,
          email: privyUser.email,
          // Ensure linkedAccounts here matches SessionUser (string[])
          linkedAccounts: privyUser.linkedAccounts?.filter(
            // Add explicit type for 'account' parameter
            (account) => account.type === "wallet" && "address" in account
          ).map((wallet) => wallet.address)
        })
        // Temporarily cast, merge logic below is the final source
      );
    }
  }, [privyUser]);
  useEffect(() => {
    if (ready && authenticated && privyUser?.id && !sessionValidated && !isLoading) {
      void validateSession();
    }
  }, [
    ready,
    authenticated,
    privyUser?.id,
    sessionValidated,
    isLoading,
    validateSession
  ]);
  const login = useCallback(() => {
    privyLogin();
  }, [privyLogin]);
  const handleLogout = useCallback(async () => {
    try {
      await privyLogout();
      setDbUser(null);
      setSessionValidated(false);
      setRetryCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [privyLogout]);
  const linkEmail = useCallback(
    async () => await privyLinkEmail(),
    [privyLinkEmail]
  );
  const connectWallet = useCallback(
    async (options) => await privyConnectWallet(options),
    [privyConnectWallet]
  );
  const unlinkEmail = useCallback(
    async (email) => await privyUnlinkEmail(email),
    [privyUnlinkEmail]
  );
  const unlinkWallet = useCallback(
    async (address) => await privyUnlinkWallet(address),
    [privyUnlinkWallet]
  );
  const linkTwitter = useCallback(
    async () => await privyLinkTwitter(),
    [privyLinkTwitter]
  );
  const unlinkTwitter = useCallback(
    async (accountId) => await privyUnlinkTwitter(accountId),
    [privyUnlinkTwitter]
  );
  const exportWallet = useCallback(
    async () => await privyExportWallet(),
    [privyExportWallet]
  );
  const linkGoogle = useCallback(
    async () => await privyLinkGoogle(),
    [privyLinkGoogle]
  );
  const unlinkGoogle = useCallback(
    async (accountId) => await privyUnlinkGoogle(accountId),
    [privyUnlinkGoogle]
  );
  const linkDiscord = useCallback(
    async () => await privyLinkDiscord(),
    [privyLinkDiscord]
  );
  const unlinkDiscord = useCallback(
    async (accountId) => await privyUnlinkDiscord(accountId),
    [privyUnlinkDiscord]
  );
  const linkGithub = useCallback(
    async () => await privyLinkGithub(),
    [privyLinkGithub]
  );
  const unlinkGithub = useCallback(
    async (accountId) => await privyUnlinkGithub(accountId),
    [privyUnlinkGithub]
  );
  const linkApple = useCallback(
    async () => await privyLinkApple(),
    [privyLinkApple]
  );
  const unlinkApple = useCallback(
    async (accountId) => await privyUnlinkApple(accountId),
    [privyUnlinkApple]
  );
  const mergedUser = dbUser ? {
    ...privyUser,
    // Start with Privy details (like createdAt, linkedAccounts raw)
    ...dbUser,
    // Overwrite with DB details (id, email, wallet, role, etc.)
    // Ensure specific types match SessionUser if necessary
    // Ensure createdAt is a Date object, using dbUser's if available, else Privy's or now
    createdAt: dbUser.createdAt ? new Date(dbUser.createdAt) : privyUser?.createdAt ? new Date(privyUser.createdAt) : /* @__PURE__ */ new Date(),
    // Ensure email matches SessionUser: { address: string }
    email: dbUser.email ? { address: dbUser.email.address } : privyUser?.email ? { address: privyUser.email.address } : void 0,
    // Ensure wallet matches SessionUser: { address: string }
    wallet: dbUser.wallet ? { address: dbUser.wallet.address } : privyUser?.wallet ? { address: privyUser.wallet.address } : void 0,
    // Ensure linkedAccounts is string[] from dbUser or derived from privyUser
    linkedAccounts: dbUser.linkedAccounts ?? // Prefer dbUser.linkedAccounts if it's string[]
    privyUser?.linkedAccounts?.filter(
      (account) => account.type === "wallet" && "address" in account
    ).map((wallet) => wallet.address) ?? [],
    // Default to empty array if none exist
    // Include Telegram fields from dbUser (assuming they are part of SessionUser or handled correctly)
    telegramUsername: dbUser.telegramUsername,
    hasJoinedTelegramCommunity: dbUser.hasJoinedTelegramCommunity,
    hasJoinedTelegramAnnouncement: dbUser.hasJoinedTelegramAnnouncement,
    role: dbUser.role
    // Ensure role from dbUser is included
    // REMOVED plan, status, points as they are not in SessionUser
    // plan: dbUser.plan,
    // status: dbUser.status,
    // points: dbUser.points,
  } : null;
  return {
    user: mergedUser,
    privyUser,
    authenticated,
    ready,
    isLoading,
    error,
    sessionValidated,
    login,
    logout: handleLogout,
    validateSession,
    linkEmail,
    connectWallet,
    unlinkEmail,
    unlinkWallet,
    linkTwitter,
    unlinkTwitter,
    exportWallet,
    linkGoogle,
    unlinkGoogle,
    linkDiscord,
    unlinkDiscord,
    linkGithub,
    unlinkGithub,
    linkApple,
    unlinkApple
  };
}

// src/components/wallet/coinbase-wallet-button.tsx
import { useState as useState2, useEffect as useEffect2 } from "react";
import { usePrivy as usePrivy2 } from "@privy-io/react-auth";

// src/components/ui/button.tsx
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

// src/lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/components/ui/button.tsx
import { jsx } from "react/jsx-runtime";
var buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline: "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "button",
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}

// src/components/wallet/coinbase-wallet-button.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
function CoinbaseWalletButton({
  onSuccess,
  onError
}) {
  const { login } = usePrivy2();
  const [isLoading, setIsLoading] = useState2(false);
  const [timeoutId, setTimeoutId] = useState2(null);
  useEffect2(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);
  const handleConnect = async () => {
    try {
      setIsLoading(true);
      const id = setTimeout(() => {
        setIsLoading(false);
        onError?.(new Error("Connection timeout. Please try again."));
      }, 3e4);
      setTimeoutId(id);
      await login();
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      setIsLoading(false);
      onSuccess?.();
    } catch (error) {
      setIsLoading(false);
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      onError?.(
        error instanceof Error ? error : new Error("Failed to connect to Coinbase Wallet")
      );
    }
  };
  return /* @__PURE__ */ jsx2(Button, { onClick: handleConnect, disabled: isLoading, className: "w-full", children: isLoading ? "Connecting..." : "Connect Coinbase Wallet" });
}

// src/components/blocked-page.tsx
import { clsx as clsx2 } from "clsx";
import { jsx as jsx3, jsxs } from "react/jsx-runtime";
function BlockedPage({
  title = "Access Restricted",
  message = "Sorry, this service is not available in your region.",
  className
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: clsx2(
        "flex flex-grow flex-col items-center justify-center p-4 h-screen w-screen max-w-md mx-auto",
        className
      ),
      children: [
        /* @__PURE__ */ jsx3("h1", { className: "text-4xl font-bold pb-4", children: title }),
        /* @__PURE__ */ jsx3("p", { className: "text-lg text-muted-foreground text-center", children: message })
      ]
    }
  );
}
export {
  BlockedPage,
  CoinbaseWalletButton,
  usePrivyAuth
};
