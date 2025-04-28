"use client";

import { useCallback, useEffect, useState } from "react";
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
import { signupForWhitelist, checkWhitelistSignup } from "./actions";
import { toast } from "sonner";
import { cn } from "@krain/ui/lib/utils";
import type { WhitelistSignupResult } from "@krain/session/types";

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
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  // Better wallet detection function
  const hasConnectedWallet = useCallback(() => {
    // Check session user first (more reliable after validation)
    if (user?.wallet?.address) return true;
    // Fallback check on privyUser - less reliable for current session state
    if (privyUser?.wallet?.address) return true;
    // Check linkedAccounts in both
    if (user?.linkedAccounts?.some((acc: string) => acc.startsWith("0x")))
      return true;
    if (privyUser?.linkedAccounts?.some((acc: any) => acc.type === "wallet"))
      return true;
    return false;
  }, [user, privyUser]);

  // Effect to log wallet information when user changes
  useEffect(() => {
    if (ready && authenticated && user) {
      console.log("User/Session State:", {
        privyReady: ready,
        privyAuthenticated: authenticated,
        sessionValidated,
        isValidatingSession,
        sessionUser: user, // Log the user object from useSession
        privyUser, // Log the user object from usePrivy for comparison
      });
    }
  }, [
    ready,
    authenticated,
    user,
    privyUser,
    sessionValidated,
    isValidatingSession,
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
    try {
      await linkWallet();
      await new Promise((resolve) => setTimeout(resolve, 200));
      toast.info("Verifying wallet connection...");
      if (refreshSession) {
        refreshSession();
      }
    } catch (e) {
      console.error("Error linking wallet", e);
      toast.error("Failed to link wallet.");
    } finally {
      setIsPerformingAction(false);
    }
  };

  // Simplified handleSignup - checks are now handled by button logic
  const handleSignup = async () => {
    // ---> ADD THIS LOG <---
    console.log("handleSignup function invoked!");

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

      // Type the result explicitly
      const result: WhitelistSignupResult = await signupForWhitelist({
        userId: user.id,
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
          setIsSignedUp(true);
          toast.info(result.message || "You are already signed up!");
        } else {
          // Handles the { status: "error", message: "..." } case
          console.log(`Signup action returned error: ${result.message}`);
          toast.error(result.message || "Signup failed. Please try again.");
        }
      } else if (result && "success" in result && result.success === true) {
        // Type is narrowed to { success: true }
        console.log("Setting isSignedUp to true (success case)");
        setIsSignedUp(true);
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

  // Effect to check signup status once session is validated
  useEffect(() => {
    let isMounted = true;

    // Check signup status whenever user is authenticated and session is validated
    const checkSignupStatus = async () => {
      if (!sessionValidated || !user?.id) return;

      console.log("Checking whitelist signup status for user:", user.id);

      try {
        const result = await checkWhitelistSignup({ userId: user.id });
        console.log("checkWhitelistSignup result:", result);

        if (isMounted && result.sessionReady) {
          setIsSignedUp(result.isSignedUp);

          // Show toast notification if already signed up
          if (result.isSignedUp) {
            toast.success("You're already on the KRAIN whitelist!", {
              id: "whitelist-status",
              duration: 3000,
            });
          }
        }
      } catch (error) {
        console.error("Error checking signup status:", error);
        if (isMounted) {
          setIsSignedUp(false);
        }
      }
    };

    // Run the check immediately if conditions are met
    if (authenticated && sessionValidated && user?.id) {
      void checkSignupStatus();
    }

    return () => {
      isMounted = false;
    };
  }, [authenticated, sessionValidated, user?.id]); // Dependencies include authenticated state to re-run when auth changes

  // Render logic based on session state and signup status
  const renderContent = () => {
    if (!ready || isValidatingSession) {
      return <p className="text-xl sm:text-2xl">Verifying session...</p>;
    }

    if (sessionError) {
      return (
        <p className="text-xl sm:text-2xl text-red-500">
          Session Error: {sessionError}. Please refresh.
        </p>
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
      if (!user?.email?.address) {
        return (
          <p className="text-xl sm:text-2xl text-amber-500">
            Please connect your email address. We need both your email and
            wallet for the whitelist registration to send you important updates.
          </p>
        );
      }

      if (!hasConnectedWallet()) {
        return (
          <p className="text-xl sm:text-2xl text-amber-500">
            Please connect your wallet address. Your wallet is required for the
            whitelist to receive token distributions and special access rights.
          </p>
        );
      }

      if (isSignedUp) {
        return (
          <p className="text-xl sm:text-2xl text-green-500">
            Thanks for signing up! You're on the KRAIN whitelist.
          </p>
        );
      } else {
        return (
          <p className="text-xl sm:text-2xl">
            Click the button below to complete your whitelist registration. This
            will register both your email and wallet address to the KRAIN
            whitelist.
          </p>
        );
      }
    }

    return (
      <p className="text-xl sm:text-2xl text-gray-500">
        Loading user status...
      </p>
    );
  };

  // Updated renderButton logic - Rely on useSession state directly
  const renderButton = () => {
    // Disable buttons if Privy isn't ready, session is validating, or an action is performing
    const disableButtons = !ready || isValidatingSession || isPerformingAction;

    if (!ready) return null; // Don't render if Privy isn't ready

    if (!authenticated) {
      return (
        <Button size="lg" onClick={login} disabled={disableButtons}>
          Sign In
        </Button>
      );
    }

    // Show validating status
    if (isValidatingSession) {
      return (
        <Button size="lg" disabled={true}>
          Verifying Session...
        </Button>
      );
    }

    // After validation attempt, check results based on `sessionValidated` and `user` state
    if (!sessionValidated && !isValidatingSession) {
      // If not validated and not currently validating, likely an error occurred or initial state
      return (
        <Button size="lg" onClick={refreshSession} disabled={disableButtons}>
          {sessionError ? "Retry Validation" : "Check Status"}
        </Button>
      );
    }

    // If validated, proceed with checks
    if (sessionValidated) {
      // 1. Check Email
      if (!user?.email?.address) {
        return (
          <Button
            size="lg"
            onClick={triggerLinkEmailAndRefresh} // Use new handler
            disabled={disableButtons || !user}
          >
            Connect Email
          </Button>
        );
      }

      // 2. Check Wallet
      if (!hasConnectedWallet()) {
        return (
          <Button
            size="lg"
            onClick={triggerLinkWalletAndRefresh} // Use new handler
            disabled={disableButtons || !user}
          >
            Connect Wallet
          </Button>
        );
      }

      // 3. Show Signup button
      if (!isSignedUp) {
        // ---> ADD THIS LOG <---
        console.log("Rendering 'Sign Up' button state:", {
          disableButtons, // Log the actual value being passed
          isSignedUp,
          sessionValidated,
          isValidatingSession,
          isPerformingAction,
        });
        return (
          <Button size="lg" onClick={handleSignup} disabled={disableButtons}>
            {isPerformingAction ? "Signing Up..." : "Sign Up for Whitelist"}
          </Button>
        );
      }
    }

    // If signed up, render nothing
    if (isSignedUp) {
      return null;
    }

    // Fallback case (e.g., error state not handled above)
    return (
      <Button size="lg" disabled={true}>
        {sessionError ? `Error: ${sessionError}` : "Loading..."}
      </Button>
    );
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
      <Card className={cn("w-full max-w-lg")}>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-4xl">
            <h1>KRAIN Whitelist Signup</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
        <CardFooter className="flex justify-center">
          {renderButton()}
        </CardFooter>
      </Card>
    </main>
  );
}
