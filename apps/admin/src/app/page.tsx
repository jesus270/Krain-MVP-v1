"use client"

import Image from "next/image";
import { AmbassadorList } from "@/components/ambassador-list";
import { AddAmbassadorForm } from "@/components/add-ambassador-form";
import { useState, useEffect } from "react";
import { useSession } from "@krain/session";
import { usePrivyAuth } from "@krain/ui/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@krain/ui/components/ui/card";
import { Button } from "@krain/ui/components/ui/button";
import { Wallet as WalletIcon, AlertCircle, LogOut, User as UserIcon } from "lucide-react";
import { ConnectWalletCard } from "@/components/connect-wallet-card";
import { log } from "@krain/utils";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const {
    user,
    ready,
    authenticated,
    sessionValidated,
    isValidatingSession,
    error: sessionError,
  } = useSession();
  const { login, logout, privyUser } = usePrivyAuth();
  const userWalletAddress = user?.wallet?.address ?? undefined;
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(true);

  // Show ConnectWalletCard if not authenticated or not ready
  if (!ready || !authenticated) {
    return <ConnectWalletCard />;
  }

  // Show loading card if session is being validated
  if (isValidatingSession) {
    log.info("Rendering Loading State (isValidatingSession)", {
      operation: "render_loading_validating_session",
    });
    return (
      <Card className="max-w-2xl mx-auto animate-pulse">
        <CardHeader>
          <CardTitle>Loading Dashboard...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Verifying your session...</p>
        </CardContent>
      </Card>
    );
  }

  // Show error card if there is a session error
  if (sessionError) {
    log.error("Rendering Session Error State", {
      operation: "render_session_error",
      sessionError,
    });
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Session Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            {sessionError}. Please try refreshing the page.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </CardFooter>
      </Card>
    );
  }

  // Show error card if there is a component error
  if (error) {
    log.error("Rendering Component Error State", {
      operation: "render_component_error",
      error,
    });
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardFooter>
      </Card>
    );
  }

  // Show null if session is not validated and no other state matches
  if (!sessionValidated) {
    log.warn(
      "Rendering null (session not validated, but no error/loading state?)",
      { operation: "render_null_unexpected_state" },
    );
    return null;
  }

  // Show loading if user is not yet loaded
  if (!user) {
    return <div>Loading user data...</div>;
  }

  // Not admin
  if (user.role !== "admin") {
    return <div>Only admins can access this dashboard.</div>;
  }

  // Authenticated and admin
  return (
    <div className="max-w-5xl mx-auto py-10">
      {/* User account button at top right */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg shadow border">
          <UserIcon className="h-5 w-5 text-primary/80" />
          <span className="font-medium text-sm">
            {user.email?.address || privyUser?.email?.address || "Admin"}
          </span>
          <Button size="sm" variant="outline" onClick={logout}>
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Ambassador Management</h1>
      <AddAmbassadorForm onAdded={() => setRefreshKey((k) => k + 1)} />
      <AmbassadorList refreshKey={refreshKey} />
    </div>
  );
}
