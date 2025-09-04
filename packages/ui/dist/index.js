"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BlockedPage: () => BlockedPage,
  CoinbaseWalletButton: () => CoinbaseWalletButton,
  usePrivyAuth: () => usePrivyAuth
});
module.exports = __toCommonJS(index_exports);

// src/hooks/use-privy-auth.tsx
var import_react = require("react");
var import_react_auth = require("@privy-io/react-auth");
var import_utils = require("@krain/utils");
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
  } = (0, import_react_auth.usePrivy)();
  const [isLoading, setIsLoading] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)(null);
  const [dbUser, setDbUser] = (0, import_react.useState)(null);
  const [retryCount, setRetryCount] = (0, import_react.useState)(0);
  const [sessionValidated, setSessionValidated] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
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
  const validateSession = (0, import_react.useCallback)(async () => {
    if (!privyUser?.id || retryCount >= maxRetries) return;
    try {
      setIsLoading(true);
      import_utils.log.info("Starting session validation", {
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
          import_utils.log.info("User data loaded successfully", {
            entity: "CLIENT",
            operation: "user_data_load",
            userId: privyUser.id
          });
        } else {
          import_utils.log.warn("User data response missing user object", {
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
      import_utils.log.error(errorMessage, {
        entity: "CLIENT",
        operation: "validate_session",
        userId: privyUser.id,
        retryCount,
        errorStack: error2 instanceof Error ? error2.stack : void 0
      });
      setRetryCount((prev) => prev + 1);
      if (retryCount < maxRetries - 1) {
        import_utils.log.info(
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
        import_utils.log.error("Max retries reached for session validation", {
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
  (0, import_react.useEffect)(() => {
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
  (0, import_react.useEffect)(() => {
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
  const login = (0, import_react.useCallback)(() => {
    privyLogin();
  }, [privyLogin]);
  const handleLogout = (0, import_react.useCallback)(async () => {
    try {
      await privyLogout();
      setDbUser(null);
      setSessionValidated(false);
      setRetryCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [privyLogout]);
  const linkEmail = (0, import_react.useCallback)(
    async () => await privyLinkEmail(),
    [privyLinkEmail]
  );
  const connectWallet = (0, import_react.useCallback)(
    async (options) => await privyConnectWallet(options),
    [privyConnectWallet]
  );
  const unlinkEmail = (0, import_react.useCallback)(
    async (email) => await privyUnlinkEmail(email),
    [privyUnlinkEmail]
  );
  const unlinkWallet = (0, import_react.useCallback)(
    async (address) => await privyUnlinkWallet(address),
    [privyUnlinkWallet]
  );
  const linkTwitter = (0, import_react.useCallback)(
    async () => await privyLinkTwitter(),
    [privyLinkTwitter]
  );
  const unlinkTwitter = (0, import_react.useCallback)(
    async (accountId) => await privyUnlinkTwitter(accountId),
    [privyUnlinkTwitter]
  );
  const exportWallet = (0, import_react.useCallback)(
    async () => await privyExportWallet(),
    [privyExportWallet]
  );
  const linkGoogle = (0, import_react.useCallback)(
    async () => await privyLinkGoogle(),
    [privyLinkGoogle]
  );
  const unlinkGoogle = (0, import_react.useCallback)(
    async (accountId) => await privyUnlinkGoogle(accountId),
    [privyUnlinkGoogle]
  );
  const linkDiscord = (0, import_react.useCallback)(
    async () => await privyLinkDiscord(),
    [privyLinkDiscord]
  );
  const unlinkDiscord = (0, import_react.useCallback)(
    async (accountId) => await privyUnlinkDiscord(accountId),
    [privyUnlinkDiscord]
  );
  const linkGithub = (0, import_react.useCallback)(
    async () => await privyLinkGithub(),
    [privyLinkGithub]
  );
  const unlinkGithub = (0, import_react.useCallback)(
    async (accountId) => await privyUnlinkGithub(accountId),
    [privyUnlinkGithub]
  );
  const linkApple = (0, import_react.useCallback)(
    async () => await privyLinkApple(),
    [privyLinkApple]
  );
  const unlinkApple = (0, import_react.useCallback)(
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
var import_react2 = require("react");
var import_react_auth2 = require("@privy-io/react-auth");

// src/components/ui/button.tsx
var import_react_slot = require("@radix-ui/react-slot");
var import_class_variance_authority = require("class-variance-authority");

// src/lib/utils.ts
var import_clsx = require("clsx");
var import_tailwind_merge = require("tailwind-merge");
function cn(...inputs) {
  return (0, import_tailwind_merge.twMerge)((0, import_clsx.clsx)(inputs));
}

// src/components/ui/button.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var buttonVariants = (0, import_class_variance_authority.cva)(
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
  const Comp = asChild ? import_react_slot.Slot : "button";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    Comp,
    {
      "data-slot": "button",
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}

// src/components/wallet/coinbase-wallet-button.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function CoinbaseWalletButton({
  onSuccess,
  onError
}) {
  const { login } = (0, import_react_auth2.usePrivy)();
  const [isLoading, setIsLoading] = (0, import_react2.useState)(false);
  const [timeoutId, setTimeoutId] = (0, import_react2.useState)(null);
  (0, import_react2.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Button, { onClick: handleConnect, disabled: isLoading, className: "w-full", children: isLoading ? "Connecting..." : "Connect Coinbase Wallet" });
}

// src/components/blocked-page.tsx
var import_clsx2 = require("clsx");
var import_jsx_runtime3 = require("react/jsx-runtime");
function BlockedPage({
  title = "Access Restricted",
  message = "Sorry, this service is not available in your region.",
  className
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: (0, import_clsx2.clsx)(
        "flex flex-grow flex-col items-center justify-center p-4 h-screen w-screen max-w-md mx-auto",
        className
      ),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h1", { className: "text-4xl font-bold pb-4", children: title }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-lg text-muted-foreground text-center", children: message })
      ]
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BlockedPage,
  CoinbaseWalletButton,
  usePrivyAuth
});
