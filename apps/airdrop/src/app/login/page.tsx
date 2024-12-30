"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSearchParams } from "next/navigation";
import { ConnectWalletCard } from "@/components/dashboard/connect-wallet-card";

export default function LoginPage() {
  const { ready, authenticated, user } = usePrivy();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Only redirect once when all conditions are met
    if (ready && authenticated && user?.id && !hasRedirected) {
      // Add a small delay to allow session revalidation to complete
      const timer = setTimeout(() => {
        setHasRedirected(true);
        window.location.href = returnTo;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [ready, authenticated, user?.id, returnTo, hasRedirected]);

  // Show nothing while Privy is initializing
  if (!ready) {
    return null;
  }

  // Show login UI if not authenticated
  if (!authenticated) {
    return (
      <div className="container mx-auto py-8">
        <ConnectWalletCard />
      </div>
    );
  }

  // Show nothing while redirecting
  return null;
}
