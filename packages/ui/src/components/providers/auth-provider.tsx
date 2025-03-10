"use client";

import { usePrivyAuth } from "../../hooks/use-privy-auth";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { PrivyProviderWrapper } from "./privy-provider-wrapper";

export interface AuthConfig {
  privyAppId: string | undefined;
  loadingTitle?: string;
  loadingDescription?: string;
  privyLoginMethods?: ("wallet" | "email" | "twitter")[] | undefined;
  validateSession?: boolean;
}

interface AuthProviderProps {
  children: ({
    authenticated,
    user,
  }: {
    authenticated: boolean;
    user: ReturnType<typeof usePrivyAuth>["user"];
  }) => React.ReactNode;
  config: AuthConfig;
}

export function AuthProvider({ children, config }: AuthProviderProps) {
  if (!config.privyAppId) {
    throw new Error("Privy App ID is required");
  }

  return (
    <PrivyProviderWrapper
      privyAppId={config.privyAppId}
      loginMethods={config.privyLoginMethods}
      validateSession={config.validateSession}
    >
      <AuthStateManager config={config}>{children}</AuthStateManager>
    </PrivyProviderWrapper>
  );
}

function AuthStateManager({
  children,
  config,
}: {
  children: ({
    authenticated,
    user,
  }: {
    authenticated: boolean;
    user: ReturnType<typeof usePrivyAuth>["user"];
  }) => React.ReactNode;
  config: AuthConfig;
}) {
  const { authenticated, ready, user } = usePrivyAuth();
  if (!ready) {
    return (
      <main className="flex flex-grow justify-center items-center min-h-[400px]">
        <Card className="max-w-2xl mx-auto animate-pulse">
          <CardHeader>
            <CardTitle>{config.loadingTitle || "Welcome to KRAIN"}</CardTitle>
            <CardDescription>
              {config.loadingDescription ||
                "Please wait while we validate your session..."}
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return <>{children({ authenticated, user })}</>;
}
