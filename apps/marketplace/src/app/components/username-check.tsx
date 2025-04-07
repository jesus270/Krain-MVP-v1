"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePrivyAuth } from "../utils/use-privy-auth";

export function UsernameCheck() {
  const { authenticated, user } = usePrivyAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkUsername() {
      // Only proceed if user is authenticated
      if (!authenticated || !user) {
        setIsChecking(false);
        return;
      }

      try {
        // If already on the edit profile page, no need to redirect
        if (pathname === "/profile/edit") {
          setIsChecking(false);
          return;
        }

        // Fetch user data to see if username is set
        const response = await fetch("/api/me");

        if (response.ok) {
          const userData = await response.json();

          // If user doesn't have a username, redirect to profile edit
          if (!userData?.username) {
            console.log("No username set, redirecting to profile edit");
            router.push("/profile/edit");
          }
        }

        setIsChecking(false);
      } catch (error) {
        console.error("Error checking username:", error);
        setIsChecking(false);
      }
    }

    checkUsername();
  }, [authenticated, user, router, pathname]);

  // Return null since this is just a utility component
  return null;
}
