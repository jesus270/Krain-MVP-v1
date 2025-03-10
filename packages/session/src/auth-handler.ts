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

  // Create new user object
  const user: User = {
    id: privyData.id,
    email: { address: privyData.email ?? "" },
    wallet: { address: privyData.wallet?.address ?? "" },
    createdAt: new Date(),
  };

  log.info("Created new user from Privy", {
    operation: "handle_privy_auth",
    entity: "AUTH",
    userId: user.id,
  });

  return user;
}
