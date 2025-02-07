import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "KRAIN AI",
  description: "The Infrastructure Layer Fueling the AI Agent Economy",
  openGraph: {
    title: "KRAIN AI",
    description: "The Infrastructure Layer Fueling the AI Agent Economy",
    images: [
      {
        url: "/social-share-image.webp",
        width: 1200,
        height: 630,
        alt: "KRAIN AI - The Infrastructure Layer Fueling the AI Agent Economy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KRAIN AI",
    description: "The Infrastructure Layer Fueling the AI Agent Economy",
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
        </ThemeProvider>
      </body>
    </html>
  );
}
