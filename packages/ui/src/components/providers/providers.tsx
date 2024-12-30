"use client";

import {
  AuthConfig,
  AuthProvider,
} from "@krain/ui/components/providers/auth-provider";
import { IntercomProvider } from "@krain/ui/components/providers/intercom-provider";
import { ThemeProvider } from "next-themes";

export function Providers({
  children,
  authConfig,
  intercomAppId,
}: {
  children: React.ReactNode;
  authConfig: AuthConfig;
  intercomAppId: string | undefined;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider config={authConfig}>
        {({ user }) => {
          return (
            <IntercomProvider
              config={{
                appId: intercomAppId,
                user: user
                  ? {
                      email: user.email?.address,
                      name: user.email?.address,
                      id: user.id,
                      createdAt: user.createdAt,
                    }
                  : undefined,
              }}
            >
              {children}
            </IntercomProvider>
          );
        }}
      </AuthProvider>
    </ThemeProvider>
  );
}
