import { Red_Hat_Mono, Manrope } from "next/font/google";
import { cn } from "../lib/utils";
import { Providers } from "../components/providers";
import "@krain/ui/globals.css";
import { AuthConfig } from "../components/providers/auth-provider";

const redHatMono = Red_Hat_Mono({
  variable: "--font-red-hat-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
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
          `${redHatMono.variable} ${manrope.variable}`,
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
