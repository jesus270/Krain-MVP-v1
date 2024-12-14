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
import { createWallet } from "./actions/wallet";
import { isValidSolanaAddress } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

const formSchema = z.object({
  walletAddress: z.string().refine(
    (value) => {
      return isValidSolanaAddress(value);
    },
    {
      message: "Invalid Solana address",
    }
  ),
});

export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      walletAddress: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await createWallet(values.walletAddress);
      toast.success(result);
      form.reset();
    } catch (e) {
      const error = e as Error;
      if (
        error.message ===
        'duplicate key value violates unique constraint "wallet_address_unique"'
      ) {
        toast.error("Wallet already exists");
      } else {
        toast.error(error.message);
      }
    }
  }

  return (
    <div className="flex flex-col items-center p-4 max-w-md mx-auto">
      <Image width={300} height={150} src="/logo.png" alt="logo" />
      <h1 className="text-4xl font-bold pb-4">$KRAIN Airdrop List</h1>
      <p className="text-muted-foreground pb-4 text-center">
        Paste in your Solana wallet address below to get added to the $KRAIN
        Airdrop List.
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
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
          <Button type="submit">Add</Button>
        </form>
      </Form>
    </div>
  );
}
