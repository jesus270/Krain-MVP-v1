"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
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

// Key for storing refresh state in sessionStorage
const REFRESH_KEY = "krain_session_refreshed";

export default function HomePage() {
  const { user, authenticated, login, ready, linkEmail } = usePrivy();
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedSignup, setHasCheckedSignup] = useState(false);

  const updateSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user }),
      });

      if (!response.ok) {
        throw new Error("Failed to update session");
      }
    } catch (error) {
      console.error("Error updating session:", error);
      toast.error("Failed to update session. Please try logging in again.");
    }
  }, [user]);

  const checkSignupStatus = useCallback(async () => {
    if (!user?.id || !user.email?.address || hasCheckedSignup) return;

    setIsLoading(true);
    try {
      const result = await checkEarlyAccessSignup({ userId: user.id });
      setIsSignedUp(result.isSignedUp);
      setHasCheckedSignup(true);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Email is required")
      ) {
        toast.error("Unable to verify email. Please try logging in again.");
      }
      console.error("Error checking signup status:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email?.address, hasCheckedSignup]);

  const handleSignup = async () => {
    if (!user) {
      login();
      return;
    }

    if (!user.email?.address) {
      linkEmail();
      return;
    }

    setIsLoading(true);
    try {
      // First update the session with the latest user data
      await updateSession();

      // Then attempt the signup
      const result = await signupForEarlyAccess({ userId: user.id });
      if (result.status === "success") {
        setIsSignedUp(true);
        toast.success(result.message);
      }
    } catch (error) {
      console.error("Error signing up:", error);
      if (error instanceof Error) {
        if (error.message.includes("Already signed up")) {
          setIsSignedUp(true);
          toast.success("You're already signed up for early access!");
        } else if (error.message.includes("Email is required")) {
          toast.error("Unable to verify email. Please try logging in again.");
        } else {
          toast.error("Failed to sign up for early access. Please try again.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check signup status when ready
  useEffect(() => {
    if (ready && authenticated && user?.email?.address) {
      void checkSignupStatus();
    }
  }, [ready, authenticated, user?.email?.address, checkSignupStatus]);

  // Handle email linking success
  useEffect(() => {
    if (user?.email?.address && !hasCheckedSignup) {
      // Update session when email is linked
      void updateSession().then(() => {
        void checkSignupStatus();
      });
    }
  }, [
    user?.email?.address,
    hasCheckedSignup,
    checkSignupStatus,
    updateSession,
  ]);

  // Handle session errors gracefully
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // If it's a session error but we're already signed up, ignore it
      if (isSignedUp && event.error?.toString().includes("session")) {
        event.preventDefault();
        return;
      }
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, [isSignedUp]);

  // Clear refresh flag when component unmounts
  useEffect(() => {
    return () => {
      sessionStorage.removeItem(REFRESH_KEY);
    };
  }, []);

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
      <Card className={cn("w-full max-w-lg", isLoading && "animate-pulse")}>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-4xl">
            <h1>KRAiN Early Access Signup</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSignedUp ? (
            <p className="text-xl sm:text-2xl max-w-2xl text-green-500">
              Thanks for signing up! We'll notify you when early access is
              available.
            </p>
          ) : !user ? (
            <p className="text-xl sm:text-2xl max-w-2xl">
              Sign in with your wallet or email to get early access to KRAIN's
              revolutionary AI Agent Hub & AI Agent Builder.
            </p>
          ) : !user.email?.address ? (
            <p className="text-xl sm:text-2xl max-w-2xl text-amber-500">
              Please connect your email to sign up for early access.
            </p>
          ) : !hasCheckedSignup ? (
            <p className="text-xl sm:text-2xl max-w-2xl">
              Checking signup status...
            </p>
          ) : (
            <p className="text-xl sm:text-2xl max-w-2xl">
              Ready to sign up for early access!
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!authenticated ? (
            <Button size="lg" onClick={login} disabled={isLoading}>
              Sign In
            </Button>
          ) : !user || !user.email?.address ? (
            <Button size="lg" onClick={linkEmail} disabled={isLoading}>
              Connect Email
            </Button>
          ) : !isSignedUp && hasCheckedSignup ? (
            <Button size="lg" onClick={handleSignup} disabled={isLoading}>
              Sign Up for Early Access
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </main>
  );
}
