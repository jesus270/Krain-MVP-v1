"use client";

import { usePrivyAuth } from "@krain/ui/hooks/index";
import { Dashboard } from "./dashboard";
import { ConnectWalletCard } from "@/components/dashboard/connect-wallet-card";
import { log } from "@krain/utils";
import { useEffect } from "react";

interface HomePageClientProps {
  params: {
    referredByCode?: string[];
  };
}

export function HomePageClient({ params }: HomePageClientProps) {
  const { ready, authenticated } = usePrivyAuth();
  const referredByCode = params.referredByCode?.[0];

  useEffect(() => {
    log.info("Client component mounted", {
      entity: "CLIENT",
      operation: "home_page_client_mount",
      ready,
      authenticated,
      referredByCode,
      timestamp: new Date().toISOString(),
    });
  }, [ready, authenticated, referredByCode]);

  if (!ready) {
    log.info("Client not ready", {
      entity: "CLIENT",
      operation: "home_page_client_loading",
      timestamp: new Date().toISOString(),
    });
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    log.info("Client not authenticated", {
      entity: "CLIENT",
      operation: "home_page_client_unauthenticated",
      timestamp: new Date().toISOString(),
    });
    return (
      <div className="container mx-auto py-8">
        <ConnectWalletCard />
      </div>
    );
  }

  log.info("Rendering dashboard", {
    entity: "CLIENT",
    operation: "home_page_client_render_dashboard",
    referredByCode,
    timestamp: new Date().toISOString(),
  });

  return <Dashboard referredByCode={referredByCode} />;
}
