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
    console.log("Home page auth state:", {
      ready,
      authenticated,
      userId: user?.id,
      referredByCode,
    });

    if (ready && !authenticated) {
      console.log("Redirecting to login from home page");
      // If there's a referral code, include it in the redirect
      if (referredByCode) {
        router.push(`/login?returnTo=/${referredByCode}`);
      } else {
        router.push("/login");
      }
    }
  }, [ready, authenticated, router, referredByCode, user?.id]);

  if (!ready) {
    console.log("Privy not ready yet");
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    console.log("User not authenticated");
    return null;
  }

  console.log(
    "Rendering dashboard with referral code:",
    referredByCode || "none",
  );

  return <Dashboard referredByCode={referredByCode} />;
}
