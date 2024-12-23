"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@repo/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { z } from "zod";
import { handleSubmitWallet } from "@/actions/wallet";
import { isValidSolanaAddress } from "@repo/utils";
import { toast } from "sonner";
import Image from "next/image";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@repo/ui/components/ui/card";

const formSchema = z.object({
  walletAddress: z.string().refine(
    (value) => {
      return isValidSolanaAddress(value);
    },
    {
      message: "Invalid Solana address",
    },
  ),
  referredByCode: z.string().optional(),
});

export default function CreateWalletForm({
  referredByCode,
}: {
  referredByCode?: string;
}) {
  const [yourReferralCode, setYourReferralCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(true);
      const wallet = await handleSubmitWallet({
        walletAddress,
        referredByCode,
      });

      if (wallet?.referralCode) {
        setYourReferralCode(wallet.referralCode);
        toast.success("Wallet successfully added!");
      } else {
        toast.error("Failed to get referral code");
      }
    } catch (e) {
      const error = e as Error;
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Add Your Solana Wallet Address</CardTitle>
          <CardDescription>
            Paste in your Solana wallet address below to be added to the $KRAIN
            Airdrop List and receive your referral link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              action={async (formData: FormData) => {
                const walletAddress = formData.get("walletAddress") as string;
                if (!walletAddress) return;

                try {
                  setIsLoading(true);
                  const wallet = await handleSubmitWallet({
                    walletAddress,
                    referredByCode,
                  });

                  if (wallet?.referralCode) {
                    setYourReferralCode(wallet.referralCode);
                    toast.success("Wallet successfully added!");
                  } else {
                    toast.error("Failed to get referral code");
                  }
                } catch (e) {
                  const error = e as Error;
                  toast.error(error.message);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="flex flex-col gap-2"
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
              <Button type="submit" disabled={isLoading}>
                Add
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Get Your Referral Link</CardTitle>
          <CardDescription>
            Add your wallet address above to see your referral link. Share this
            code with your friends to earn $KRAIN.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Input
            value={
              yourReferralCode
                ? `https://airdrop.krain.ai/${yourReferralCode}`
                : ""
            }
            placeholder="Add Wallet Address Above"
            readOnly
          />
          <Button
            onClick={() => {
              if (yourReferralCode) {
                navigator.clipboard.writeText(
                  `https://airdrop.krain.ai/${yourReferralCode}`,
                );
                toast.success("Referral link copied to clipboard");
              }
            }}
          >
            Copy
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
