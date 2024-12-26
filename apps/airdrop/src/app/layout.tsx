"use client";

// import type { Metadata } from "next";
import { Red_Hat_Mono, Manrope } from "next/font/google";
import "@repo/ui/globals.css";
import { Toaster } from "@repo/ui/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import Footer from "@/components/footer";
import { SidebarNav } from "@/components/nav-sidebar";
import { SidebarInset, SidebarProvider } from "@repo/ui/components/ui/sidebar";
import Header from "@/components/header";
import { PrivyProviderWrapper } from "@/components/privy-provider-wrapper";
import { usePrivy } from "@privy-io/react-auth";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { ErrorBoundary } from "@/components/error-boundary";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { usePathname } from "next/navigation";
import Intercom from "@intercom/messenger-js-sdk";

const redHatMono = Red_Hat_Mono({
  variable: "--font-red-hat-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "$KRAIN Airdrop",
//   description: "Add your wallet to the $KRAIN airdrop list",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set");
  }

  const pathname = usePathname();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${redHatMono.variable} ${manrope.variable} antialiased`}
      >
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {pathname !== "/blocked" ? (
              <PrivyProviderWrapper>
                <SidebarProvider>
                  <AuthWrapper>
                    {(authenticated) => (
                      <>
                        {authenticated && <SidebarNav />}
                        <SidebarInset>
                          {authenticated && <Header />}
                          <div className="flex flex-grow flex-col">
                            {children}
                            <Toaster richColors />
                            <SpeedInsights />
                            <Analytics />
                          </div>
                          <Footer />
                        </SidebarInset>
                      </>
                    )}
                  </AuthWrapper>
                </SidebarProvider>
              </PrivyProviderWrapper>
            ) : (
              <>{children}</>
            )}
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

function AuthWrapper({
  children,
}: {
  children: (authenticated: boolean) => React.ReactNode;
}) {
  const { authenticated, ready, user } = usePrivy();

  Intercom({
    app_id: "jys4yu7r",
    email: user?.email?.address,
    created_at: user?.createdAt ? user.createdAt.getTime() / 1000 : undefined,
    name: user?.email?.address,
    user_id: user?.id,
  });

  if (!ready)
    return (
      <main className="flex flex-grow justify-center items-center min-h-[400px]">
        <Card className="max-w-2xl mx-auto animate-pulse">
          <CardHeader>
            <CardTitle>Welcome to the $KRAIN Airdrop</CardTitle>
            <CardDescription>
              Please wait while we validate your session...
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  return <>{children(authenticated)}</>;
}
