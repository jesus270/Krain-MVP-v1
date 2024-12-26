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

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${redHatMono.variable} ${manrope.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
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
                      </div>
                      <Footer />
                    </SidebarInset>
                  </>
                )}
              </AuthWrapper>
            </SidebarProvider>
          </PrivyProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

function AuthWrapper({
  children,
}: {
  children: (authenticated: boolean) => React.ReactNode;
}) {
  const { authenticated, ready } = usePrivy();

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
