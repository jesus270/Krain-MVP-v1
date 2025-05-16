import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Link from "next/link";
import { Nav } from "@/components/nav";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Krain AI - Infrastracture for the AI Economy",
  description:
    "From discovery to creation, we are accelerating the AI Agent ecosystem with intelligent infrastructure.",
  openGraph: {
    title: "Krain AI - Infrastracture for the AI Economy",
    description:
      "From discovery to creation, we are accelerating the AI Agent ecosystem with intelligent infrastructure.",
    images: [
      {
        url: "/social-share-image.webp",
        width: 1200,
        height: 630,
        alt: "Krain AI - Infrastracture for the AI Economy - From discovery to creation, we are accelerating the AI Agent ecosystem with intelligent infrastructure.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Krain AI - Infrastracture for the AI Economy",
    description:
      "From discovery to creation, we are accelerating the AI Agent ecosystem with intelligent infrastructure.",
    images: ["/social-share-image.webp"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div
            className="fixed top-0 left-0 right-0 z-[60] h-10 flex items-center justify-center text-white text-sm font-medium px-4 hidden"
            style={{
              background: `linear-gradient(120deg, #1FC5D6 0%, #915BF0 50%, rgb(47, 45, 64) 75%)`,
            }}
          >
            Announcing the Founders Key Sale!&nbsp;
            <Link
              href="/founders-key"
              className="underline hover:opacity-80 transition-opacity"
            >
              Learn More
            </Link>
          </div>
          <Nav />
          {/* with top banner use "pt-[calc(2.5rem+theme(spacing.24))]" */}
          <main className="pt-0">{children}</main>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
