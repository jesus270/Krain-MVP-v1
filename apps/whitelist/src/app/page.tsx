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

export default function HomePage() {
  // Use the shared session hook for authentication state
  const {
    user,
    ready,
    authenticated,
    sessionValidated,
    isValidatingSession,
    error: sessionError,
  } = useSession();

  // Use Privy hook directly for login and link wallet/email actions
  const { login, linkEmail, linkWallet, user: privyUser } = usePrivy();

  // State specific to this page
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const isLoading = !ready || isValidatingSession || isPerformingAction;

  // Better wallet detection function
  const hasConnectedWallet = useCallback(() => {
    // Check session user first
    if (
      user?.linkedAccounts?.some((acc: any) => acc.type === "wallet") ||
      (user as any)?.walletAddress
    ) {
      return true;
    }

    // Also check Privy's user object directly
    if (
      privyUser?.wallet?.address ||
      privyUser?.linkedAccounts?.some((acc: any) => acc.type === "wallet")
    ) {
      return true;
    }

    return false;
  }, [user, privyUser]);

  // Effect to log wallet information when user changes
  useEffect(() => {
    if (authenticated && user) {
      console.log("User wallet info:", {
        sessionUserWallet: (user as any)?.walletAddress,
        hasLinkedWallet: user?.linkedAccounts?.some(
          (acc: any) => acc.type === "wallet",
        ),
        privyUserWallet: privyUser?.wallet?.address,
        hasPrivyLinkedWallet: privyUser?.linkedAccounts?.some(
          (acc: any) => acc.type === "wallet",
        ),
        hasWallet: hasConnectedWallet(),
      });
    }
  }, [authenticated, user, privyUser, hasConnectedWallet]);

  // Handler to initiate signup process
  const handleSignup = async () => {
    // 1. Check if authenticated
    if (!authenticated || !user) {
      login();
      return;
    }

    // 2. Check if email is linked
    if (!user.email?.address) {
      linkEmail();
      return;
    }

    // 3. Check if wallet is linked
    if (!hasConnectedWallet()) {
      linkWallet();
      return;
    }

    // 4. Synchronize the wallet from Privy to the session if needed
    if (privyUser?.wallet?.address && !user.wallet?.address) {
      console.log("Synchronizing wallet from Privy to session before signup", {
        privyWallet: privyUser.wallet.address,
        sessionWallet: user.wallet?.address,
      });

      // Force a session validation to update the wallet
      toast.info("Updating wallet information...");

      try {
        // Wait for a moment for session to update
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check if wallet is now in session
        const response = await fetch("/api/user", { method: "GET" });
        if (!response.ok) {
          throw new Error("Failed to refresh user data");
        }
      } catch (error) {
        console.error("Error synchronizing wallet:", error);
        toast.error("Failed to synchronize wallet data. Please try again.");
        return;
      }
    }

    // 5. Call the signup server action
    setIsPerformingAction(true);
    try {
      const result = await signupForWhitelist({ userId: user.id });
      if (result.status === "success") {
        setIsSignedUp(true);
        toast.success(result.message || "Signup successful!");
      } else {
        // Handle specific errors
        if (result.message?.includes("Already signed up")) {
          setIsSignedUp(true);
          toast.info(result.message);
        } else {
          toast.error(result.message || "Signup failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error calling signupForWhitelist action:", error);
      if (error instanceof Error) {
        if (error.message.includes("Already signed up")) {
          setIsSignedUp(true);
          toast.info("You are already signed up!");
        } else {
          toast.error(`Signup failed: ${error.message}. Please try again.`);
        }
      } else {
        toast.error("An unexpected error occurred during signup.");
      }
    } finally {
      setIsPerformingAction(false);
    }
  };

  // Effect to check signup status once session is validated
  useEffect(() => {
    let isMounted = true;
    if (sessionValidated && user?.id && !isSignedUp) {
      console.log(
        "Session validated, checking whitelist signup status for user:",
        user.id,
      );

      const checkStatus = async () => {
        try {
          const result = await checkWhitelistSignup({ userId: user.id });
          console.log("checkWhitelistSignup result:", result);
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
            setIsSignedUp(false);
          }
        }
      };

      void checkStatus();
    }

    return () => {
      isMounted = false;
    };
  }, [sessionValidated, user?.id, isSignedUp]);

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

    if (authenticated && sessionValidated) {
      if (!user?.email?.address) {
        return (
          <Button
            size="lg"
            onClick={linkEmail}
            disabled={disableButtons || !user}
          >
            Connect Email
          </Button>
        );
      }

      if (!hasConnectedWallet()) {
        return (
          <Button
            size="lg"
            onClick={linkWallet}
            disabled={disableButtons || !user}
          >
            Connect Wallet
          </Button>
        );
      }

      if (!isSignedUp) {
        return (
          <Button size="lg" onClick={handleSignup} disabled={disableButtons}>
            Sign Up for Whitelist
          </Button>
        );
      }
    }

    if (isLoading || (authenticated && sessionValidated && isSignedUp)) {
      return null;
    }

    return null;
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
      <Card className={cn("w-full max-w-lg", isLoading && "animate-pulse")}>
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
