"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSession } from "@krain/session";
import { Button } from "@krain/ui/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@krain/ui/components/ui/card";
import { Input } from "@krain/ui/components/ui/input";
import { Separator } from "@krain/ui/components/ui/separator";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@krain/ui/components/ui/alert";
import { CheckCircle2, AlertCircle, XCircle, LogIn } from "lucide-react";
// Temporarily comment out action imports -> UNCOMMENT NOW
import {
  signupForWhitelist,
  checkWhitelistSignup,
  updateWhitelistWallet,
} from "./actions";
import { toast } from "sonner";
import { cn } from "@krain/ui/lib/utils";
import type { WhitelistSignupResult, User } from "@krain/session/types";
import { isValidEthereumAddress } from "@krain/utils/react";

// Helper function to abbreviate address
const abbreviateAddress = (address: string | null | undefined): string => {
  if (!address) return "N/A";
  if (address.length <= 10) return address; // Avoid excessive abbreviation
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Function to find the first valid Ethereum address from user data
const findValidEthAddress = (
  user: User | null | undefined,
): string | undefined => {
  if (!user) return undefined;

  // Check primary wallet first
  if (user.wallet?.address && isValidEthereumAddress(user.wallet.address)) {
    return user.wallet.address;
  }

  // Check linked accounts (assuming array of strings or objects with address)
  if (Array.isArray(user.linkedAccounts)) {
    for (const account of user.linkedAccounts) {
      let addressToCheck: string | null = null;
      if (typeof account === "string") {
        addressToCheck = account;
      } else if (
        typeof account === "object" &&
        account !== null &&
        typeof (account as any).address === "string"
      ) {
        addressToCheck = (account as any).address;
      }

      if (addressToCheck && isValidEthereumAddress(addressToCheck)) {
        return addressToCheck; // Found the first valid ETH linked account
      }
    }
  }

  return undefined; // No valid ETH address found
};

export default function HomePage() {
  // Use the shared session hook for authentication state
  const {
    user,
    ready,
    authenticated,
    sessionValidated,
    isValidatingSession,
    error: sessionError,
    refreshSession,
  } = useSession();

  // Use Privy hook directly for login and link wallet/email actions
  const { login, linkEmail, linkWallet, user: privyUser } = usePrivy();

  // State specific to this page
  const [isLoading, setIsLoading] = useState(true);
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  // Signup Status State -> Refactored into single state object
  const [whitelistInfo, setWhitelistInfo] = useState<{
    isSignedUp: boolean | null;
    address: string | null;
    isValid: boolean | null;
  }>({ isSignedUp: null, address: null, isValid: null });

  // State to hold the specific ETH address detected by the client
  const [clientVerifiedEthAddress, setClientVerifiedEthAddress] = useState<
    string | null
  >(null);

  // Current Connection State (client-side checks)
  const [isCurrentWalletValid, setIsCurrentWalletValid] = useState<
    boolean | null
  >(null);
  const [showRefreshPrompt, setShowRefreshPrompt] = useState(false); // State for manual refresh prompt
  const [newWalletAddress, setNewWalletAddress] = useState(""); // For update input
  const newWalletInputRef = useRef<HTMLInputElement>(null); // Ref for input focus

  // Combined loading effect
  useEffect(() => {
    if (ready && !isValidatingSession) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [ready, isValidatingSession]);

  // Better wallet detection function (checks current connection for *any* wallet)
  const hasConnectedWallet = useCallback(() => {
    // Check session user first
    if (user?.wallet?.address) return true;
    // Check linked accounts broadly
    if (user?.linkedAccounts && user.linkedAccounts.length > 0) return true;
    // Fallback check on privyUser
    if (privyUser?.wallet?.address) return true;
    if (privyUser?.linkedAccounts && privyUser.linkedAccounts.length > 0)
      return true;

    return false;
  }, [user, privyUser]);

  // Effect to check signup status once session is validated
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      if (sessionValidated && user?.id) {
        console.log("Checking whitelist signup status for user:", user.id);
        try {
          const result = await checkWhitelistSignup({ userId: user.id });
          console.log("checkWhitelistSignup result:", result);
          if (isMounted) {
            // Update the single state object
            setWhitelistInfo({
              isSignedUp: result.isSignedUp,
              address: result.walletAddress,
              isValid: result.isAddressValid,
            });
          }
        } catch (error) {
          console.error("Error checking signup status:", error);
          if (isMounted) {
            // Reset on error
            setWhitelistInfo({
              isSignedUp: false,
              address: null,
              isValid: null,
            });
            toast.error("Failed to check whitelist status.");
          }
        }
      } else if (!authenticated) {
        // Reset status if user logs out
        setWhitelistInfo({ isSignedUp: null, address: null, isValid: null });
      }
    };

    // Set to null initially on dependency change before check runs
    setWhitelistInfo({ isSignedUp: null, address: null, isValid: null });
    void checkStatus();

    return () => {
      isMounted = false;
    };
  }, [authenticated, sessionValidated, user?.id]);

  // Effect to validate the CURRENTLY connected wallet (only if NOT signed up)
  useEffect(() => {
    // Only run if session is validated, user exists, AND they are NOT already signed up
    if (
      ready &&
      authenticated &&
      sessionValidated &&
      !isValidatingSession &&
      user &&
      !whitelistInfo.isSignedUp
    ) {
      // Find the first valid Ethereum address associated with the session user
      const currentValidEthAddress = findValidEthAddress(user); // Use helper

      if (currentValidEthAddress) {
        console.log(
          `Current Wallet Check: Found valid ETH Address=${currentValidEthAddress}, IsValid=true`,
        );
        setIsCurrentWalletValid(true);
        setClientVerifiedEthAddress(currentValidEthAddress); // Store the detected address
      } else {
        // Don't immediately set to false if any wallet is connected.
        // Keep as null (checking) and let the signup action handle validation.
        const anyWalletConnected =
          user.wallet?.address ||
          (user.linkedAccounts && user.linkedAccounts.length > 0);
        if (anyWalletConnected) {
          console.log(
            "Current Wallet Check: ETH address not primary or found in session yet. Status remains checking.",
          );
          setIsCurrentWalletValid(false);
          setClientVerifiedEthAddress(null); // Clear stored address if invalid
          // Keep isCurrentWalletValid as null or its previous state
          // The button logic will show "Sign Up" if prerequisites are met,
          // and the action will perform the definitive wallet check.
        } else {
          console.log(
            "Current Wallet Check: No wallet address found in session user.",
          );
          // Keep isCurrentWalletValid as null or its previous state
          setIsCurrentWalletValid(null); // No wallet connected at all
          setClientVerifiedEthAddress(null); // Clear stored address
        }
      }
    } else if (whitelistInfo.isSignedUp === false) {
      // Reset current wallet validity if session conditions aren't met or if signed up
      setIsCurrentWalletValid(null);
    }
  }, [
    ready,
    authenticated,
    sessionValidated,
    isValidatingSession,
    user,
    whitelistInfo.isSignedUp,
  ]);

  // Define handlers that call Privy and then explicitly refresh the session
  const triggerLinkEmailAndRefresh = async () => {
    setIsPerformingAction(true); // Use isPerformingAction to disable button during link+refresh
    try {
      await linkEmail();
      // Wait a brief moment for Privy state to potentially update locally
      await new Promise((resolve) => setTimeout(resolve, 200));
      toast.info("Verifying email connection...");
      if (refreshSession) {
        refreshSession(); // Trigger the validation flow in useSession
      }
    } catch (e) {
      console.error("Error linking email", e);
      toast.error("Failed to link email.");
    } finally {
      // Let useSession handle disabling via isValidatingSession
      setIsPerformingAction(false);
      // Keep button disabled until validation finishes
    }
  };

  const triggerLinkWalletAndRefresh = async () => {
    setIsPerformingAction(true);
    setShowRefreshPrompt(false); // Hide refresh prompt initially
    try {
      // Just call linkWallet
      await linkWallet();
      // Now set state to show the manual refresh button
      setShowRefreshPrompt(true);
      toast.info(
        "Wallet connection initiated. Please confirm in your wallet and then click 'Refresh Status'.",
      );
    } catch (e) {
      console.error("Error linking wallet", e);
      toast.error("Failed to link wallet.");
      setShowRefreshPrompt(false); // Hide prompt on error
    } finally {
      setIsPerformingAction(false);
    }
  };

  // Handler for the manual refresh button
  const handleManualRefresh = () => {
    setShowRefreshPrompt(false); // Hide the button after clicking
    if (refreshSession) {
      console.log("Manual refresh triggered.");
      refreshSession(); // Trigger the session validation
    } else {
      console.error("refreshSession function not available");
      toast.error("Could not refresh status. Please refresh the page.");
    }
  };

  // Simplified handleSignup - checks are now handled by button logic
  const handleSignup = async () => {
    // ---> ADD THIS LOG <---
    console.log("handleSignup function invoked!");

    // Temporarily commented out action call -> UNCOMMENT BODY
    // Re-verify based on the current session state
    if (!sessionValidated || !user?.email?.address || !hasConnectedWallet()) {
      toast.error(
        "Session not ready or missing required info. Please wait or try reconnecting/refreshing.",
      );
      return;
    }

    setIsPerformingAction(true);
    try {
      console.log(
        "[" + new Date().toISOString() + "] Calling signupForWhitelist...",
      );
      // Ensure we have email from the client session before calling
      const clientVerifiedEmail = user?.email?.address;
      if (!clientVerifiedEmail) {
        toast.error("Could not retrieve email from session. Please refresh.");
        setIsPerformingAction(false);
        return;
      }

      // Type the result explicitly
      const result: WhitelistSignupResult = await signupForWhitelist({
        userId: user.id,
        clientVerifiedEthAddress: clientVerifiedEthAddress,
        clientVerifiedEmailAddress: clientVerifiedEmail, // Pass client email
      });

      console.log(
        "[" +
          new Date().toISOString() +
          "] Await signupForWhitelist completed. Result:",
        result,
      );
      console.log("Signup action result:", result);

      // Check the result status by narrowing the type
      setIsPerformingAction(false); // Set loading false regardless of outcome now

      if (result && "status" in result) {
        // Type is narrowed to { status: "already_signed_up" | "error", message: string }
        if (result.status === "already_signed_up") {
          console.log("Setting isSignedUp to true (already signed up)");
          // Update combined state for already signed up
          setWhitelistInfo({ isSignedUp: true, address: null, isValid: null }); // Address/validity might be unknown here
          toast.info(result.message || "You are already signed up!");
        } else {
          // Handles the { status: "error", message: "..." } case
          console.log(`Signup action returned error: ${result.message}`);
          toast.error(result.message || "Signup failed. Please try again.");
        }
      } else if (result && "success" in result && result.success === true) {
        // Type is narrowed to { success: true, email: string, walletAddress: string }
        console.log("Setting isSignedUp to true (success case)");
        // Immediately update combined state based on successful signup data
        setWhitelistInfo({
          isSignedUp: true,
          address: result.walletAddress,
          isValid: isValidEthereumAddress(result.walletAddress),
        });
        toast.success("Signup successful!");
      } else {
        // Handle unexpected result format
        console.log(
          `Handling unexpected result format: ${JSON.stringify(result)}`,
        );
        toast.error("Received unexpected result from server.");
      }
    } catch (error) {
      // This catch block might now be less likely to hit if the action returns structured errors,
      // but keep it for network errors or unexpected issues.
      console.error(
        "[" + new Date().toISOString() + "] Error caught in handleSignup:",
        error,
      );
      console.log("Setting isPerformingAction to false (error case)");
      setIsPerformingAction(false);
      if (error instanceof Error) {
        toast.error(`Signup failed: ${error.message}. Please try again.`);
      } else {
        toast.error("An unexpected error occurred during signup.");
      }
    } finally {
      console.log("Executing finally block for handleSignup");
      // Double ensure it's false, though should be set in try/catch now
      if (isPerformingAction) {
        // Avoid unnecessary state set if already false
        console.log("Setting isPerformingAction to false (finally block)");
        setIsPerformingAction(false);
      }
    }
  };

  // ---> NEW Handler for updating wallet <---
  const handleUpdateWallet = async () => {
    // Temporarily commented out action call -> UNCOMMENT BODY
    if (!newWalletAddress) {
      toast.error("Please enter the new Ethereum wallet address.");
      newWalletInputRef.current?.focus();
      return;
    }
    if (!isValidEthereumAddress(newWalletAddress)) {
      toast.error("The entered address is not a valid Ethereum address.");
      newWalletInputRef.current?.focus();
      return;
    }
    if (!user?.id) {
      toast.error("User session not found. Please refresh.");
      return;
    }

    setIsPerformingAction(true);
    try {
      const result = await updateWhitelistWallet({
        userId: user.id,
        newWalletAddress,
      });
      if (result.success) {
        toast.success("Wallet address updated successfully!");
        // Refresh session to get updated status/wallet
        if (refreshSession) refreshSession();
        setShowRefreshPrompt(false); // Hide prompt if shown
        setNewWalletAddress(""); // Clear input
      } else {
        toast.error(result.message || "Failed to update wallet address.");
      }
    } catch (error) {
      console.error("Error updating wallet:", error);
      toast.error("An unexpected error occurred while updating the wallet.");
    } finally {
      setIsPerformingAction(false);
    }
  };

  // --- Status Display Logic ---
  const renderStatusDisplay = () => {
    const userIdAbbreviated = user?.id ? abbreviateAddress(user.id) : "N/A";
    const emailStatus = user?.email?.address ? "Connected" : "Not Connected";
    const emailAddress = user?.email?.address || "-";

    let walletAddressDisplay = "Not Connected";
    let walletValidityStatus: "valid" | "invalid" | "checking" | "none" =
      "none";

    // Use the helper function to find the *actual* valid ETH address if one exists
    const validEthAddressInSession = findValidEthAddress(user);

    if (whitelistInfo.isSignedUp) {
      walletAddressDisplay = abbreviateAddress(whitelistInfo.address);
      if (whitelistInfo.isValid === true) walletValidityStatus = "valid";
      if (whitelistInfo.isValid === false) walletValidityStatus = "invalid";
      // If signed up but address is null for some reason, treat as invalid
      if (whitelistInfo.address === null) walletValidityStatus = "invalid";
    } else if (hasConnectedWallet()) {
      // If not signed up, display the valid ETH address if found, otherwise the primary connected
      walletAddressDisplay = abbreviateAddress(
        validEthAddressInSession || user?.wallet?.address,
      );

      if (isCurrentWalletValid === true) walletValidityStatus = "valid";
      if (isCurrentWalletValid === false) walletValidityStatus = "invalid";
      if (isCurrentWalletValid === null) walletValidityStatus = "checking";
    }

    const getWalletIcon = () => {
      switch (walletValidityStatus) {
        case "valid":
          return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        case "invalid":
          return <XCircle className="h-4 w-4 text-red-500" />;
        case "checking":
          return <LogIn className="h-4 w-4 text-yellow-500 animate-pulse" />; // Simple loading indicator
        default:
          return <XCircle className="h-4 w-4 text-gray-500" />;
      }
    };

    return (
      <div className="space-y-2 text-sm text-gray-400 border border-gray-700 p-3 rounded-md mb-4">
        <div className="flex justify-between">
          <span className="font-medium text-gray-300">User ID:</span>{" "}
          <span>{userIdAbbreviated}</span>
        </div>
        <Separator className="bg-gray-700" />
        <div className="flex justify-between">
          <span className="font-medium text-gray-300">Email:</span>{" "}
          <span>
            {emailStatus === "Connected" ? (
              <span className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                {emailAddress}
              </span>
            ) : (
              <span className="flex items-center">
                <XCircle className="h-4 w-4 text-red-500 mr-1" />
                Not Connected
              </span>
            )}
          </span>
        </div>
        <Separator className="bg-gray-700" />
        <div className="flex justify-between">
          <span className="font-medium text-gray-300">Wallet:</span>{" "}
          <span className="flex items-center">
            {getWalletIcon()}
            <span className="ml-1">
              {walletAddressDisplay}
              {walletValidityStatus === "invalid" ? " (Invalid ETH)" : ""}
            </span>
          </span>
        </div>
        <Separator className="bg-gray-700" />
        <div className="flex justify-between">
          <span className="font-medium text-gray-300">Whitelist:</span>{" "}
          <span>
            {whitelistInfo.isSignedUp === null ? (
              <span className="flex items-center">
                <LogIn className="h-4 w-4 text-yellow-500 animate-pulse mr-1" />
                Checking...
              </span>
            ) : whitelistInfo.isSignedUp ? (
              <span className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                Whitelisted
              </span>
            ) : (
              <span className="flex items-center">
                <XCircle className="h-4 w-4 text-gray-500 mr-1" />
                Not Whitelisted
              </span>
            )}
          </span>
        </div>
      </div>
    );
  };

  // Render logic based on state
  const renderContent = () => {
    if (isLoading) {
      // Keep loading simple, status display will show details
      return <p className="text-xl sm:text-2xl">Loading Status...</p>;
    }

    if (sessionError) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Session Error</AlertTitle>
          <AlertDescription>{sessionError}</AlertDescription>
        </Alert>
      );
    }

    if (!authenticated) {
      return (
        <p className="text-xl sm:text-2xl">
          Sign in with your wallet or email to get on the KRAIN whitelist.
        </p>
      );
    }

    if (authenticated && sessionValidated) {
      // --- Prerequisite Checks --- (Order determines message priority)
      if (!user?.email?.address) {
        return (
          <p className="text-xl sm:text-2xl text-amber-500">
            Please connect your email address.
          </p>
        );
      }
      if (!hasConnectedWallet()) {
        return (
          <p className="text-xl sm:text-2xl text-amber-500">
            Please connect your wallet address.
          </p>
        );
      }
      // --- Wallect Connected, Check Validity/Status ---
      if (whitelistInfo.isSignedUp) {
        if (whitelistInfo.isValid) {
          // Case: Signed Up, Valid Wallet
          return (
            <p className="text-xl sm:text-2xl text-green-500">
              You are successfully whitelisted!
            </p>
          );
        } else {
          // Case: Signed Up, Invalid Stored Wallet
          return (
            <p className="text-xl sm:text-2xl text-red-500">
              The wallet address associated with your whitelist entry is
              invalid. Please connect a valid Ethereum wallet.
            </p>
          );
        }
      } else {
        // --- Not Signed Up Flow ---
        if (isCurrentWalletValid === true) {
          // Case: Not Signed Up, Valid Current Wallet
          return (
            <p className="text-xl sm:text-2xl">
              Ready to join! Click below to complete your whitelist
              registration.
            </p>
          );
        } else if (isCurrentWalletValid === false) {
          // Case: Wallet connected, but explicitly invalid ETH
          return (
            <p className="text-xl sm:text-2xl text-red-500">
              Invalid Wallet Connected: Please connect a valid Ethereum wallet.
            </p>
          );
        } else {
          // isCurrentWalletValid is null (checking)
          return (
            <p className="text-xl sm:text-2xl text-gray-500">
              Checking wallet status...
            </p>
          );
        }
      }
    }

    // Fallback / Initial state before session validation completes
    return (
      <p className="text-xl sm:text-2xl text-gray-500">Verifying session...</p>
    );
  };

  // Updated renderButton logic (Simplified)
  const renderButton = () => {
    if (!ready) return null; // Still loading basic Privy/Session state
    // Define disableAll early!
    const disableAll = isLoading || isPerformingAction || isValidatingSession;

    if (!authenticated) {
      return (
        <Button size="lg" onClick={login} disabled={disableAll}>
          Sign In
        </Button>
      );
    }

    if (isLoading) {
      return (
        <Button size="lg" disabled={true}>
          Loading...
        </Button>
      );
    }

    if (!sessionValidated && !isValidatingSession) {
      return (
        <Button size="lg" onClick={refreshSession} disabled={disableAll}>
          {sessionError ? "Retry Validation" : "Check Status"}
        </Button>
      );
    }

    if (sessionValidated) {
      // --- Prerequisite Checks (Order matches renderContent) ---
      if (!user?.email?.address) {
        return (
          <Button
            size="lg"
            onClick={triggerLinkEmailAndRefresh}
            disabled={disableAll || !user}
          >
            Connect Email
          </Button>
        );
      }
      if (!hasConnectedWallet()) {
        return (
          <Button
            size="lg"
            onClick={triggerLinkWalletAndRefresh}
            disabled={disableAll || !user}
          >
            Connect Wallet
          </Button>
        );
      }

      // --- Main Flow Buttons (Email and Wallet are connected) ---
      if (whitelistInfo.isSignedUp) {
        // --- Signed Up Flow Buttons ---
        if (!whitelistInfo.isValid) {
          // Case 3: Signed Up, Invalid Stored Wallet -> Show Connect Valid Button
          return (
            <Button
              size="lg"
              onClick={triggerLinkWalletAndRefresh} // Should prompt to link/switch wallet
              disabled={disableAll}
              variant="outline"
            >
              Connect Valid Ethereum Wallet
            </Button>
          );
        }
        // Case 4: Signed Up, Valid Wallet -> Show Nothing
        return null;
      } else {
        // --- Not Signed Up Flow Buttons ---
        if (isCurrentWalletValid === true) {
          // Case 6: Not Signed Up, Valid Current Wallet -> Show Sign Up
          return (
            <Button size="lg" onClick={handleSignup} disabled={disableAll}>
              {isPerformingAction ? "Signing Up..." : "Sign Up for Whitelist"}
            </Button>
          );
        } else {
          // isCurrentWalletValid is false or null
          // If false or null, but a wallet IS connected, prompt to connect valid ETH
          if (hasConnectedWallet()) {
            return (
              <Button
                size="lg"
                onClick={triggerLinkWalletAndRefresh}
                disabled={disableAll}
                variant="outline"
              >
                Connect Ethereum Wallet
              </Button>
            );
          } else {
            // This case should ideally be caught by !hasConnectedWallet() above,
            // but render a disabled button as a fallback.
            return (
              <Button size="lg" disabled={true}>
                Connect Wallet
              </Button>
            );
          }
        }
      }
    }

    // Fallback / Initial Loading State Button
    return (
      <Button size="lg" disabled={true}>
        {sessionError ? `Error: ${sessionError}` : "Loading..."}
      </Button>
    );
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
      <Card className={cn("w-full max-w-lg bg-gray-900 border-gray-700")}>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-4xl text-white">
            <h1>KRAIN Whitelist Signup</h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300">
          {/* Render Status Display First */}
          {authenticated && renderStatusDisplay()}
          {/* Render Main Content Area */}
          {renderContent()}
        </CardContent>
        <CardFooter className="flex justify-center">
          {renderButton()}
        </CardFooter>
      </Card>
    </main>
  );
}
