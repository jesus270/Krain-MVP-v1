"use client";

import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { Dashboard } from "./dashboard";

interface HomePageClientProps {
  params: {
    referredByCode?: string[];
  };
}

export function HomePageClient({ params }: HomePageClientProps) {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();
  const referredByCode = params.referredByCode?.[0];

  useEffect(() => {
    if (ready && !authenticated) {
      // If there's a referral code, include it in the redirect
      if (referredByCode) {
        router.push(`/login?returnTo=/${referredByCode}`);
      } else {
        router.push("/login");
      }
    }
  }, [ready, authenticated, router, referredByCode, user?.id]);

  if (!ready) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return null;
  }

  return <Dashboard referredByCode={referredByCode} />;
}
