import { Inter } from "next/font/google";
import { cn } from "../lib/utils";
import { Providers } from "../components/providers";
import "@krain/ui/globals.css";
import { AuthConfig } from "../components/providers/auth-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export interface RootLayoutProps {
  children: React.ReactNode;
  authConfig: AuthConfig;
  intercomAppId: string | undefined;
}

export function RootLayout({
  children,
  authConfig,
  intercomAppId,
}: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          "antialiased bg-background text-foreground",
        )}
      >
        <Providers authConfig={authConfig} intercomAppId={intercomAppId}>
          <div className="flex flex-col h-screen w-screen">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
