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

export default function HomePage() {
  const { user, authenticated, login, ready, linkEmail } = usePrivy();
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkSignupStatus = useCallback(async () => {
    setIsLoading(true);
    if (!user?.id || !user.email?.address) return;

    try {
      const result = await checkEarlyAccessSignup({ userId: user.id });
      setIsSignedUp(result.isSignedUp);
      if (!result.isSignedUp) {
        handleSignup();
      }
    } catch (error) {
      console.error("Error checking signup status:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email?.address]);

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
      const result = await signupForEarlyAccess({ userId: user.id });
      if (result.status === "success") {
        setIsSignedUp(true);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error("Failed to sign up for early access. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      ready &&
      authenticated &&
      user?.email?.address &&
      !isSignedUp &&
      !isLoading
    ) {
      if (!isSignedUp) {
        void checkSignupStatus();
      }
    }
  }, [
    ready,
    user,
    checkSignupStatus,
    isSignedUp,
    handleSignup,
    authenticated,
    isLoading,
  ]);

  return (
    <main className="flex-grow  flex flex-col items-center justify-center p-4 text-center">
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
              Sign in with your wallet or email to get early access to KRAiN's
              revolutionary AI Agent Marketplace & AI Agent Builder.
            </p>
          ) : !user.email?.address ? (
            <p className="text-xl sm:text-2xl max-w-2xl text-amber-500">
              Please connect your email to sign up for early access.
            </p>
          ) : (
            <p className="text-xl sm:text-2xl max-w-2xl">
              Signing you up for early access. Please wait...
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!authenticated ? (
            <Button size="lg" onClick={login} disabled={isLoading}>
              Sign In
            </Button>
          ) : !user?.email?.address ? (
            <Button size="lg" onClick={linkEmail} disabled={isLoading}>
              Connect Email
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </main>
  );
}
