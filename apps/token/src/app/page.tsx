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
import { signupForToken, checkTokenSignup } from "./actions";
import { toast } from "sonner";
import { cn } from "@krain/ui/lib/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";

// The receiving wallet address for token sale payments
const RECEIVING_WALLET = process.env.NEXT_PUBLIC_RECEIVING_WALLET;
const REQUIRED_SOL = 2;
export default function HomePage() {
  const { user, authenticated, login, ready } = usePrivy();
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected, connecting, select, wallets } =
    useWallet();
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = useCallback(async () => {
    try {
      // If Phantom is available, select it
      const phantomWallet = wallets.find((w) => w.adapter.name === "Phantom");
      if (phantomWallet) {
        await select(phantomWallet.adapter.name);
      } else {
        toast.error("Please install Phantom wallet");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet");
    }
  }, [select, wallets]);

  useEffect(() => {
    if (authenticated && user && !connected && !connecting) {
      const checkAndConnect = async () => {
        setIsLoading(true);
        const isSignedUp = await checkTokenSignup({ userId: user.id });
        if (isSignedUp) {
          toast.success("You've already signed up for the token sale.");
          setIsSignedUp(true);
          setIsLoading(false);
          return;
        }
        // Auto-connect wallet when authenticated
        connectWallet();
        setIsLoading(false);
      };

      checkAndConnect();
    }
  }, [authenticated, user, connected, connecting, connectWallet]);

  const handlePaymentAndSignup = async () => {
    if (!user) {
      login();
      return;
    }

    if (!connected || !publicKey) {
      connectWallet();
      return;
    }

    setIsLoading(true);
    try {
      const isSignedUp = await checkTokenSignup({ userId: user.id });
      if (isSignedUp) {
        toast.success("You've already signed up for the token sale.");
        setIsSignedUp(true);
        return;
      }
      console.log("RECEIVING_WALLET", RECEIVING_WALLET);
      if (!RECEIVING_WALLET) {
        throw new Error("RECEIVING_WALLET is not set");
      }
      // Create Solana transaction
      const latestBlockhash = await connection.getLatestBlockhash();
      const transaction = new Transaction({
        feePayer: publicKey,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(RECEIVING_WALLET),
          lamports: REQUIRED_SOL * LAMPORTS_PER_SOL,
        }),
      );

      // Send transaction
      const signature = await sendTransaction(transaction, connection);

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });
      console.log("Transaction confirmation:", confirmation);

      if (confirmation.value.err) {
        throw new Error("Transaction failed");
      }

      // Record signup in database
      const result = await signupForToken({
        userId: user.id,
        txHash: signature,
      });

      if (result.status === "success") {
        setIsSignedUp(true);
        toast.success(result.message);
      }
    } catch (error) {
      console.error("Error in payment/signup:", error);
      toast.error("Failed to complete signup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
      <Card className={cn("w-full max-w-lg", isLoading && "animate-pulse")}>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-4xl">
            <h1>KRAiN Token Signup</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!authenticated ? (
            <p className="text-xl sm:text-2xl max-w-2xl">
              Please sign in to continue.
            </p>
          ) : !isSignedUp ? (
            <p className="text-xl sm:text-2xl max-w-2xl">
              Pay 2 SOL to sign up for the token sale.
            </p>
          ) : (
            <p className="text-xl sm:text-2xl max-w-2xl text-green-500">
              Thanks for signing up! Your token purchase is confirmed.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {!authenticated ? (
            <Button size="lg" onClick={login} disabled={isLoading}>
              Sign In
            </Button>
          ) : !isSignedUp ? (
            <Button
              size="lg"
              onClick={handlePaymentAndSignup}
              disabled={isLoading}
            >
              Sign Up
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </main>
  );
}
