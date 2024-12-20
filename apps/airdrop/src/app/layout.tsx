"use client";

import type { Metadata } from "next";
import { Red_Hat_Mono, Manrope } from "next/font/google";
import "@repo/ui/globals.css";
import { Toaster } from "@repo/ui/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import Footer from "@/components/footer";
import LeftNavBar from "@/components/left-nav-bar";
import { SidebarInset, SidebarProvider } from "@repo/ui/components/ui/sidebar";
import Header from "@/components/header";
import { PrivyProviderWrapper as PrivyProvider } from "@/components/privy-provider-wrapper";
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
          <PrivyProvider>
            <SidebarProvider>
              <LeftNavBar />
              <SidebarInset>
                <Header />
                <div className="flex flex-grow flex-col p-4">
                  {children}
                  <Toaster richColors />
                </div>
                <Footer />
              </SidebarInset>
            </SidebarProvider>
          </PrivyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
