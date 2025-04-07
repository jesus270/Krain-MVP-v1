"use client";

import { log } from "@krain/utils";

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
 * Handle Privy authentication
 * @param privyData User data from Privy
 * @returns The user object
 */
export async function handlePrivyAuth(privyData: PrivyUserData) {
  try {
    log.info("Handling Privy auth", {
      operation: "handle_auth",
      entity: "AUTH",
      userId: privyData.id,
    });

    const response = await fetch("/api/auth/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(privyData),
    });

    if (!response.ok) {
      throw new Error("Failed to create/update user");
    }

    return await response.json();
  } catch (error) {
    log.error("Error handling Privy auth", {
      operation: "handle_auth",
      entity: "AUTH",
      error,
    });
    throw error;
  }
}
