import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
          {children}
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
