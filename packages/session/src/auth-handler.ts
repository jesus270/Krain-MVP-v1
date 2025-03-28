import { Session } from "./session";
import { SessionOptions, User } from "./types";
import { getSession } from "./server";
import { log } from "@krain/utils";

export interface PrivyUserData {
  id: string;
  email?: string;
  wallet?: {
    address: string;
    chainId: string;
  };
  linkedAccounts?: Array<{
    type: string;
    address?: string;
    chainId?: string;
  }>;
}

/**
 * Handle Privy authentication
 * @param privyData User data from Privy
 * @returns The user object
 */
export async function handlePrivyAuth(privyData: PrivyUserData): Promise<User> {
  if (!privyData.id) {
    throw new Error("Invalid Privy user data: missing id");
  }

  log.info("Handling Privy auth", {
    operation: "handle_privy_auth",
    entity: "AUTH",
    userId: privyData.id,
  });

  // Check if user already exists in session
  const existingSession = await getSession(privyData.id);
  if (existingSession) {
    const user = existingSession.get("user");
    if (user) {
      log.info("User already exists in session", {
        operation: "handle_privy_auth",
        entity: "AUTH",
        userId: privyData.id,
      });
      return user;
    }
  }

  try {
    // Create or update user via API
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

    const { user: dbUser } = await response.json();

    if (!dbUser) {
      throw new Error("No user data returned from API");
    }

    // Create user object for session
    const user: User = {
      id: dbUser.id.toString(),
      email: { address: dbUser.email || "" },
      wallet: { address: dbUser.walletAddress || "" },
      createdAt: dbUser.createdAt || new Date(),
    };

    log.info("Created/updated user from Privy", {
      operation: "handle_privy_auth",
      entity: "AUTH",
      userId: user.id,
    });

    return user;
  } catch (error) {
    log.error("Error in auth handler", {
      operation: "handle_privy_auth",
      entity: "AUTH",
      error,
    });
    throw error;
  }
}
