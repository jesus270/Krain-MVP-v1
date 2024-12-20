"use client";

import { getWallet } from "@/actions/wallet";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { formatNumber, useLocale, isValidSolanaAddress } from "@repo/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { toast } from "sonner";

const formSchema = z.object({
  address: z.string().refine((value) => isValidSolanaAddress(value), {
    message: "Invalid Solana address",
  }),
});

type WalletState = {
  address: string;
  referralsCount: number;
} | null;

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [walletState, setWalletState] = useState<WalletState>(null);
  const [submitted, setSubmitted] = useState(false);
  const locale = useLocale();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
    },
  });

  async function onSubmit({ address }: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const wallet = await getWallet({
        address,
        with: { referralsCount: true },
      });
      console.log("wallet", wallet);
      if (!wallet) {
        toast.error(`No wallet found for address: ${address}`);
        return;
      }

      setWalletState({
        address,
        referralsCount: wallet.referralsCount,
      });
      setSubmitted(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  const totalPoints = walletState?.referralsCount
    ? walletState.referralsCount * 1000 + 1000
    : 0;
  const referralsCount = walletState?.referralsCount ?? 0;

  const formattedTotalPoints = formatNumber(totalPoints, locale);
  const formattedReferralsCount = formatNumber(referralsCount, locale);

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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Enter your wallet address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Checking..." : "Check Airdrop Status"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Airdrop Status</CardTitle>
          <CardDescription>
            More points verification and additions to the dashboard coming soon
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full max-w-md">
          <p>Referrals: {formattedReferralsCount}</p>
          <p>Points: {formattedTotalPoints}</p>
          {submitted && Number(formattedReferralsCount) === 0 && (
            <p className="text-sm text-destructive mt-4">
              You have no referrals. Please refer friends to earn points.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
