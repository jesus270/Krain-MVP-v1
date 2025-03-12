import "@krain/ui/globals.css";
import { Toaster } from "@krain/ui/components/ui/sonner";
import { RootLayout } from "@krain/ui/layouts/root-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KRAIN Early Access",
  description: "Sign up for early access to KRAIN",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout
      authConfig={{
        privyAppId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
        loadingTitle: "Welcome to the $KRAIN Early Access Signup",
        loadingDescription: "Please wait while we validate your session...",
        privyLoginMethods: ["email", "wallet"],
        validateSession: false,
      }}
      intercomAppId={process.env.NEXT_PUBLIC_INTERCOM_APP_ID}
    >
      {children}
      <Toaster />
    </RootLayout>
  );
}
