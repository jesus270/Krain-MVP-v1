"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@krain/ui/components/ui/card";
import { Button } from "@krain/ui/components/ui/button";
import { updateReferralCode } from "@/actions/wallet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@krain/ui/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@krain/ui/components/ui/input";
import { generateReferralCode } from "@krain/utils";
import { usePrivy } from "@privy-io/react-auth";

interface ReferralCodeConfirmationCardProps {
  walletAddress: string;
}

const formSchema = z.object({
  referralCode: z
    .string()
    .trim()
    .superRefine((val, ctx) => {
      // Check if input looks like a URL (contains domain-like patterns)
      if (val.includes(".") || val.includes("/")) {
        try {
          // If the input starts with the domain directly, prepend https://
          const urlString = val.startsWith("http")
            ? val
            : `https://${val.replace(/^\/+/, "")}`;

          const url = new URL(urlString);
          // Check for exact domain match
          if (url.hostname.toLowerCase() === "airdrop.krain.ai") {
            // Get the path without leading slash and trim any trailing slashes
            const code = url.pathname.replace(/^\/+|\/+$/g, "");
            if (!/^[a-zA-Z0-9]{6}$/.test(code)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                  "Referral code must be exactly 6 alphanumeric characters (letters and numbers only)",
              });
              return z.NEVER;
            }
            return;
          }
          // If URL but wrong domain, add error
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Invalid URL format. Please use: https://airdrop.krain.ai/XXXXXX (where XXXXXX is your 6-character code)",
          });
          return z.NEVER;
        } catch (e) {
          // Any URL parsing error means they tried to use a URL but got the format wrong
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Invalid URL format. Please use: https://airdrop.krain.ai/XXXXXX (where XXXXXX is your 6-character code)",
          });
          return z.NEVER;
        }
      }

      // Not URL-like, validate as 6-character code
      if (!/^[a-zA-Z0-9]{6}$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Referral code must be exactly 6 alphanumeric characters (letters and numbers only)",
        });
        return z.NEVER;
      }
    }),
});

export function ReferralCodeConfirmationCard({
  walletAddress,
}: ReferralCodeConfirmationCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const { user } = usePrivy();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      referralCode: "",
    },
  });

  const handleConfirm = async () => {
    try {
      // Validate form before proceeding
      const result = await form.trigger();
      if (!result) {
        return; // Stop if validation fails
      }

      if (!user?.id) {
        setError("You must be logged in to set a referral code.");
        return;
      }

      setIsSubmitting(true);
      setError(undefined);
      await updateReferralCode({
        walletAddress,
        referralCode: form.getValues("referralCode"),
        userId: user.id,
      });
      toast.success("Referral code confirmed successfully");
      window.location.reload();
    } catch (error) {
      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes("already exists")) {
          setError(
            "This referral code is already in use. Please try another one.",
          );
        } else if (error.message.includes("Unauthorized")) {
          setError(
            "You are not authorized to set this referral code. Please log in again.",
          );
        } else if (
          error.message.includes("Wallet already has a referral code")
        ) {
          setError(
            "This wallet already has a referral code. Refresh the page.",
          );
        } else {
          setError(error.message);
        }
      } else {
        setError("Failed to confirm referral code. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerate = () => {
    const newReferralCode = generateReferralCode();
    form.setValue("referralCode", newReferralCode);
    handleConfirm();
  };

  return (
    <Card className="border-2 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          <h2>Confirm Your Referral Code</h2>
        </CardTitle>
        <CardDescription className="space-y-2">
          <p>Enter the referral code you were given to share with others.</p>
          <p className="text-sm text-muted-foreground">
            You can enter either the full URL or just the code:
            <code className="ml-1 px-1 py-0.5 rounded bg-muted">
              https://airdrop.krain.ai/ABC123
            </code>
            <span className="mx-2">or</span>
            <code className="px-1 py-0.5 rounded bg-muted">ABC123</code>
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <FormField
            control={form.control}
            name="referralCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referral Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Confirming..." : "Confirm Referral Code"}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGenerate}
          disabled={isSubmitting}
        >
          Generate a New Referral Code
        </Button>
      </CardFooter>
    </Card>
  );
}
