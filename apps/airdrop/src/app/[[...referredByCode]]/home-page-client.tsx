"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Dashboard } from "./dashboard";
import { ConnectWalletCard } from "@/components/dashboard/connect-wallet-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@krain/ui/components/ui/card";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/use-session";

interface HomePageClientProps {
  params: {
    referredByCode?: string[];
  };
}

export function HomePageClient({ params }: HomePageClientProps) {
  const { ready, authenticated } = usePrivy();
  const { error } = useSession();
  const referredByCode = params.referredByCode?.[0];

  if (!ready) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Loading</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="container mx-auto py-8">
        <ConnectWalletCard />
      </div>
    );
  }

  return <Dashboard referredByCode={referredByCode} />;
}
