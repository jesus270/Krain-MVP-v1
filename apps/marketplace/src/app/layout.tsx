import type { Metadata } from "next";
import { RootLayout } from "@krain/ui/layouts/root-layout";

export const metadata: Metadata = {
  title: "Krain Marketplace",
  description: "Krain Marketplace",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootLayout
      authConfig={{
        privyAppId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
        loadingTitle: "Welcome to the $KRAIN Marketplace",
        loadingDescription: "Please wait while we validate your session...",
        validateSession: false,
      }}
      intercomAppId={process.env.NEXT_PUBLIC_INTERCOM_APP_ID}
    >
      <div className="flex flex-grow flex-col">{children}</div>
    </RootLayout>
  );
}
