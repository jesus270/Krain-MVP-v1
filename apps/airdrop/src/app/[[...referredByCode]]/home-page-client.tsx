"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Dashboard } from "./dashboard";
import { ConnectWalletCard } from "@/components/dashboard/connect-wallet-card";

interface HomePageClientProps {
  params: {
    referredByCode?: string[];
  };
}

export function HomePageClient({ params }: HomePageClientProps) {
  const { ready, authenticated } = usePrivy();
  const referredByCode = params.referredByCode?.[0];

  if (!ready) {
    return <div>Loading...</div>;
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
