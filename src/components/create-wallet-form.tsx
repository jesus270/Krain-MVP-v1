"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { handleSubmitWallet } from "@/actions/wallet";
import { isValidSolanaAddress } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
} from "./ui/card";

const formSchema = z.object({
  walletAddress: z.string().refine(
    (value) => {
      return isValidSolanaAddress(value);
    },
    {
      message: "Invalid Solana address",
    }
  ),
  referredByCode: z.string().optional(),
});

export default function CreateWalletForm({
  referredByCode,
}: {
  referredByCode?: string;
}) {
  const [yourReferralCode, setYourReferralCode] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      walletAddress: "",
      referredByCode: referredByCode || "",
    },
  });

  async function onSubmitCreateWallet({
    walletAddress,
  }: z.infer<typeof formSchema>) {
    try {
      const { data, message, status } = await handleSubmitWallet({
        address: walletAddress,
        referredByCode,
      });
      if (status === "error" || !data?.referralCode) {
        toast.error(message);
        return;
      } else if (status === "success") {
        setYourReferralCode(data.referralCode);
        toast.success(message);
      }
    } catch (e) {
      const error = e as Error;
      toast.error(error.message);
    }
  }

  return (
    <div className="flex flex-col items-center p-4 max-w-md mx-auto">
      <Image width={300} height={150} src="/logo.png" alt="logo" />
      <div className="flex flex-col gap-4 w-full items-center">
        <h2 className="text-2xl font-bold">$KRAIN Airdrop List</h2>
        <Card>
          <CardHeader>
            <CardTitle>Add Your Solana Wallet Address</CardTitle>
            <CardDescription>
              Paste in your Solana wallet address below to be added to the
              $KRAIN Airdrop List and receive your referral link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitCreateWallet)}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <FormField
                    control={form.control}
                    name="walletAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Wallet Address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit">Add</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Get Your Referral Link</CardTitle>
            <CardDescription>
              Add your wallet address above to see your referral link. Share
              this code with your friends to earn $KRAIN.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Input
              value={
                yourReferralCode ? `https://krain.ai/${yourReferralCode}` : ""
              }
              placeholder="Add Wallet Address Above"
              readOnly
            />
            <Button
              onClick={() => {
                if (yourReferralCode) {
                  navigator.clipboard.writeText(
                    `https://krain.ai/${yourReferralCode}`
                  );
                  toast.success("Referral link copied to clipboard");
                }
              }}
            >
              Copy
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
