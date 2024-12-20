"use client";

import { getWallet } from "@/actions/wallet";
import React, { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";

function SubmitButton({ isSubmitted }: { isSubmitted: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || isSubmitted} className="w-full">
      {pending ? "Checking..." : "Check Airdrop Status"}
    </Button>
  );
}

type State =
  | {
      address: string;
      referralsCount: number;
    }
  | { error: string };

export default function Dashboard() {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [state, formAction] = useActionState<State, FormData>(
    async (prevState: State, formData: FormData) => {
      const address = formData.get("address") as string;

      try {
        if (!address) {
          throw new Error("Please enter a wallet address");
        }

        const wallet = await getWallet({
          address,
          with: { referralsCount: true },
        });

        if (!wallet) {
          throw new Error(`No wallet found for address: ${address}`);
        }

        return {
          address,
          referralsCount: wallet.referralsCount,
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "An error occurred",
        };
      }
    },
    { address: "", referralsCount: 0 },
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsSubmitted(true);
    React.startTransition(() => {
      formAction(formData);
    });
  };

  const handleInputChange = () => {
    setIsSubmitted(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center gap-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Wallet Address</CardTitle>
          <CardDescription>
            Enter your wallet address to see more information about your Airdrop
            status below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <Input
                id="address"
                name="address"
                type="text"
                required
                placeholder="Enter your wallet address"
                onChange={handleInputChange}
              />
            </div>
            <SubmitButton isSubmitted={isSubmitted} />
          </form>
        </CardContent>
      </Card>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Referrals</CardTitle>
        </CardHeader>
        <CardContent className="w-full max-w-md">
          <p>
            Total Referrals:{" "}
            {state && !("error" in state) && state.referralsCount}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
