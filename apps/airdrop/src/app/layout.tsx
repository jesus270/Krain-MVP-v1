"use client";

import "@krain/ui/globals.css";
import { RootLayout } from "@krain/ui/layouts/root-layout";
import { Toaster } from "@krain/ui/components/ui/sonner";
import Footer from "@/components/footer";
import { SidebarNav } from "@/components/nav-sidebar";
import { SidebarInset, SidebarProvider } from "@krain/ui/components/ui/sidebar";
import Header from "@/components/header";
import { ErrorBoundary } from "@/components/error-boundary";

import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { authenticated } = usePrivy();

  if (pathname === "/blocked") return <>{children}</>;

  return (
    <SidebarProvider>
      <>
        {authenticated && <SidebarNav />}
        <SidebarInset>
          {authenticated && <Header />}
          <div className="flex flex-grow flex-col">
            {children}
            <Toaster richColors />
          </div>
          <Footer />
        </SidebarInset>
      </>
    </SidebarProvider>
  );
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set");
  }

  return (
    <ErrorBoundary>
      <RootLayout
        authConfig={{
          privyAppId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
          loadingTitle: "Welcome to the $KRAIN Airdrop",
          loadingDescription: "Please wait while we validate your session...",
        }}
        intercomAppId={process.env.NEXT_PUBLIC_INTERCOM_APP_ID}
      >
        <LayoutContent>{children}</LayoutContent>
      </RootLayout>
    </ErrorBoundary>
  );
}
