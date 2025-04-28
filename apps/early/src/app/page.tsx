"use client";

import { useCallback, useEffect, useState } from "react";
// Import Privy hooks needed for actions like login, linkEmail
import { usePrivy } from "@privy-io/react-auth";
// Import the shared session hook
import { useSession } from "@krain/session";
import { Button } from "@krain/ui/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@krain/ui/components/ui/card";
import { signupForEarlyAccess, checkEarlyAccessSignup } from "./actions";
import { toast } from "sonner";
import { cn } from "@krain/ui/lib/utils";
import { log } from "@krain/utils";

// Key for storing refresh state in sessionStorage (can be removed if not needed)
// const REFRESH_KEY = "krain_session_refreshed";

export default function HomePage() {
  // Use the shared session hook for authentication state
  const {
    user, // Combined user object (Privy + DB)
    ready, // Privy ready state
    authenticated, // Privy authenticated state
    sessionValidated, // Backend session validity
    isValidatingSession, // Loading state for session validation
    error: sessionError, // Session validation error
    refreshSession, // <-- Get refreshSession from the hook
  } = useSession();

  // Use Privy hook directly ONLY for actions not covered by useSession (login, linkEmail)
  const { login, linkEmail } = usePrivy();

  // State specific to this page
  const [isSignedUp, setIsSignedUp] = useState(false);
  // REMOVED isLoadingSignupCheck state
  // const [isLoadingSignupCheck, setIsLoadingSignupCheck] = useState(false);

  // isLoading combines session validation state
  // We might need a separate loading for the signup action itself
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const isLoading = !ready || isValidatingSession || isPerformingAction;

  // Separate handler for linking email
  const triggerLinkEmailAndRefresh = async () => {
    setIsPerformingAction(true);
    try {
      log.info("Triggering linkEmail and refresh", {
        entity: "CLIENT",
        operation: "trigger_link_email",
      });
      await linkEmail();
      await new Promise((resolve) => setTimeout(resolve, 200));
      toast.info("Verifying email connection...");
      if (refreshSession) {
        refreshSession();
      }
    } catch (e) {
      console.error("Error linking email", e);
      toast.error("Failed to link email.");
    } finally {
      setIsPerformingAction(false);
    }
  };

  // Simplified handleSignup - only performs the action
  const handleSignup = async () => {
    log.info("handleSignup: Invoked", {
      entity: "CLIENT",
      operation: "handle_signup_start",
    });
    // Re-verify based on current state just before action call
    if (!sessionValidated || !user?.email?.address) {
      toast.error(
        "Cannot sign up yet. Please ensure email is connected and session is valid.",
      );
      return;
    }

    setIsPerformingAction(true);
    try {
      log.info("handleSignup: Calling server action", {
        entity: "CLIENT",
        operation: "handle_signup_call_action",
        userId: user.id,
      });
      const result = await signupForEarlyAccess({ userId: user.id });

      log.info("handleSignup: Server action result received", {
        entity: "CLIENT",
        operation: "handle_signup_action_result",
        result,
      });

      if (result.status === "success") {
        setIsSignedUp(true);
        toast.success(result.message || "Signup successful!");
      } else if (result.status === "already_signed_up") {
        setIsSignedUp(true);
        toast.info(result.message || "Already signed up!");
      } else {
        toast.error(result.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Error calling signupForEarlyAccess action:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected network error occurred during signup.",
      );
    } finally {
      setIsPerformingAction(false);
    }
  };

  // Effect to check signup status once session is validated
  useEffect(() => {
    let isMounted = true;
    // Only run check if session is validated, we have a user ID,
    // and we haven't confirmed signup status yet.
    // The check action itself will prevent duplicate runs if called rapidly.
    if (sessionValidated && user?.id && !isSignedUp) {
      console.log(
        "Session validated, checking early access signup status for user:",
        user.id,
      );
      // No separate loading state needed here, rely on main isLoading
      // setIsLoadingSignupCheck(true);

      const checkStatus = async () => {
        try {
          const result = await checkEarlyAccessSignup({ userId: user.id });
          console.log("checkEarlyAccessSignup result:", result);
          if (isMounted) {
            if (result.isSignedUp) {
              setIsSignedUp(true);
            } else {
              setIsSignedUp(false);
            }
          }
        } catch (error) {
          console.error("Error checking signup status:", error);
          if (isMounted) {
            setIsSignedUp(false); // Assume not signed up if check fails
          }
        } // No finally block needed to reset loading state
      };

      void checkStatus();
    }

    return () => {
      isMounted = false;
    };
    // Rerun only when session/user changes
  }, [sessionValidated, user?.id, isSignedUp]); // Add isSignedUp back temporarily to re-check if needed

  // ----- REMOVED OLD EFFECTS -----
  // - Polling effect removed (useSession handles session readiness)
  // - Initial loading effect removed (useSession provides ready state)
  // - Session error handling might be handled within useSession or globally
  // - Refresh key logic removed (can be added back if specific refresh scenarios needed)

  // Render logic based on session state and signup status
  const renderContent = () => {
    // Simplified loading checks
    if (!ready || isValidatingSession) {
      // Combine initial ready and session validation
      return <p className="text-xl sm:text-2xl">Verifying session...</p>;
    }
    // REMOVED isLoadingSignupCheck check

    // Error state
    if (sessionError) {
      return (
        <p className="text-xl sm:text-2xl text-red-500">
          Session Error: {sessionError}. Please refresh.
        </p>
      );
    }

    // Not authenticated
    if (!authenticated) {
      return (
        <p className="text-xl sm:text-2xl">
          Sign in with your wallet or email to get early access to KRAIN's
          revolutionary AI Agent Hub & AI Agent Builder.
        </p>
      );
    }

    // Authenticated, session validated, but missing email
    if (authenticated && sessionValidated && !user?.email?.address) {
      return (
        <p className="text-xl sm:text-2xl text-amber-500">
          Please connect your email to sign up for early access.
        </p>
      );
    }

    // Authenticated, session validated, email present
    if (authenticated && sessionValidated && user?.email?.address) {
      if (isSignedUp) {
        return (
          <p className="text-xl sm:text-2xl text-green-500">
            Thanks for signing up! We'll notify you when early access is
            available.
          </p>
        );
      } else {
        // Ready to sign up
        return (
          <p className="text-xl sm:text-2xl">
            Ready to sign up for early access!
          </p>
        );
      }
    }

    // Fallback / Unexpected state - should be less likely now
    console.warn("Reached unexpected render state", {
      ready,
      authenticated,
      sessionValidated,
      userExists: !!user,
      isSignedUp,
      isLoading, // Use combined isLoading
      sessionError,
    });
    return (
      <p className="text-xl sm:text-2xl text-gray-500">
        Loading user status...
      </p>
    );
  };

  const renderButton = () => {
    const disableButtons = isLoading || isPerformingAction;

    if (!ready) return null;

    if (!authenticated) {
      return (
        <Button size="lg" onClick={login} disabled={disableButtons}>
          Sign In
        </Button>
      );
    }

    if (isValidatingSession) {
      return (
        <Button size="lg" disabled={true}>
          Verifying Session...
        </Button>
      );
    }

    if (!sessionValidated && !isValidatingSession) {
      return (
        <Button size="lg" onClick={refreshSession} disabled={disableButtons}>
          {sessionError ? "Retry Validation" : "Check Status"}
        </Button>
      );
    }

    if (sessionValidated) {
      if (!user?.email?.address) {
        return (
          <Button
            size="lg"
            onClick={triggerLinkEmailAndRefresh} // Use specific handler
            disabled={disableButtons || !user}
          >
            Connect Email
          </Button>
        );
      } else if (!isSignedUp) {
        return (
          <Button size="lg" onClick={handleSignup} disabled={disableButtons}>
            {isPerformingAction ? "Signing Up..." : "Sign Up for Early Access"}
          </Button>
        );
      }
    }

    if (isSignedUp) {
      return null;
    }

    return (
      <Button size="lg" disabled={true}>
        {sessionError ? `Error: ${sessionError}` : "Loading..."}
      </Button>
    );
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
      <Card className={cn("w-full max-w-lg", isLoading && "animate-pulse")}>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-4xl">
            <h1>KRAiN Early Access Signup</h1>
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
