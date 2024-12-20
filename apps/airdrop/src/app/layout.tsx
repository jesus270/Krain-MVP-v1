import type { Metadata } from "next";
import { Red_Hat_Mono, Manrope } from "next/font/google";
import "ui/src/globals.css";
import { Toaster } from "ui/src/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import Footer from "@/components/footer";
import LeftNavBar from "@/components/left-nav-bar";
import { SidebarInset, SidebarProvider } from "ui/components/ui/sidebar";
import Header from "@/components/header";

const redHatMono = Red_Hat_Mono({
  variable: "--font-red-hat-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "$KRAIN Airdrop",
  description: "Add your wallet to the $KRAIN airdrop list",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        </ThemeProvider>
      </body>
    </html>
  );
}
