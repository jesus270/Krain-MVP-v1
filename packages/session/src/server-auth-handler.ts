"use server";

import { log } from "@krain/utils";
import { headers } from "next/headers";

export interface PrivyUserData {
  id: string;
  email?: string;
  wallet?: {
    address: string;
  };
  linkedAccounts?: string[];
  createdAt?: number;
  isGuest?: boolean;
  hasAcceptedTerms?: boolean;
}

/**
 * Handle Privy authentication on the server
 * @param privyData User data from Privy
 * @returns The user object
 */
export async function handlePrivyAuthServer(privyData: PrivyUserData) {
  try {
    log.info("Handling Privy auth on server", {
      operation: "handle_auth_server",
      entity: "AUTH",
      userId: privyData.id,
    });

    const headersList = headers();
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const host = headersList.get("x-forwarded-host") || "localhost:3000";
    const origin = `${protocol}://${host}`;

    // Make server-to-server request
    const response = await fetch(`${origin}/api/auth/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(privyData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create/update user: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    log.error("Error handling Privy auth on server", {
      operation: "handle_auth_server",
      entity: "AUTH",
      error,
    });
    throw error;
  }
}
