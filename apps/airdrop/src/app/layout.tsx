import type { Metadata } from "next";
import { Red_Hat_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "ui";
import { ThemeProvider } from "next-themes";
import Footer from "@/components/Footer";

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
          <div className="flex flex-col min-h-screen min-w-screen overflow-hidden">
            {children}
            <Toaster richColors />
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
