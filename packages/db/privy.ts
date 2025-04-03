import { db } from "./client";
import {
  userTable,
  privyWalletTable,
  type LinkedAccount,
  type EmailLinkedAccount,
  type WalletLinkedAccount,
  type TwitterOAuthLinkedAccount,
} from "./schema";
import { eq } from "drizzle-orm";

export interface PrivyUserImport {
  id: string;
  created_at: string;
  is_guest: boolean;
  linked_accounts: LinkedAccount[];
}

export async function importPrivyUser(user: PrivyUserImport) {
  const emailAccount = user.linked_accounts.find(
    (acc): acc is EmailLinkedAccount => acc.type === "email",
  );
  const walletAccount = user.linked_accounts.find(
    (acc): acc is WalletLinkedAccount => acc.type === "wallet",
  );
  const twitterAccount = user.linked_accounts.find(
    (acc): acc is TwitterOAuthLinkedAccount => acc.type === "twitter_oauth",
  );

  // First check if user already exists
  const existingUser = await db.query.userTable.findFirst({
    where: eq(userTable.privyId, user.id),
  });

  if (existingUser) {
    // Update existing user
    await db
      .update(userTable)
      .set({
        email: emailAccount?.address,
        twitterHandle: twitterAccount?.username,
        twitterName: twitterAccount?.name,
        twitterProfilePictureUrl: twitterAccount?.profile_picture_url,
        twitterSubject: twitterAccount?.subject,
        privyCreatedAt: new Date(user.created_at),
        isGuest: user.is_guest,
        linkedAccounts: user.linked_accounts,
      })
      .where(eq(userTable.privyId, user.id));
  } else {
    // Insert new user
    await db.insert(userTable).values({
      privyId: user.id,
      email: emailAccount?.address,
      twitterHandle: twitterAccount?.username,
      twitterName: twitterAccount?.name,
      twitterProfilePictureUrl: twitterAccount?.profile_picture_url,
      twitterSubject: twitterAccount?.subject,
      privyCreatedAt: new Date(user.created_at),
      isGuest: user.is_guest,
      linkedAccounts: user.linked_accounts,
    });
  }

  // Handle wallet account separately
  if (walletAccount?.type === "wallet") {
    const existingWallet = await db.query.privyWalletTable.findFirst({
      where: eq(privyWalletTable.address, walletAccount.address),
    });

    if (existingWallet) {
      // Update existing wallet
      await db
        .update(privyWalletTable)
        .set({
          chainType: walletAccount.chain_type,
          walletClient: walletAccount.wallet_client,
          walletClientType: walletAccount.wallet_client_type,
          connectorType: walletAccount.connector_type,
          verifiedAt: walletAccount.verified_at
            ? new Date(walletAccount.verified_at)
            : null,
          updatedAt: new Date(),
        })
        .where(eq(privyWalletTable.address, walletAccount.address));
    } else {
      // Insert new wallet
      await db.insert(privyWalletTable).values({
        address: walletAccount.address,
        chainType: walletAccount.chain_type,
        walletClient: walletAccount.wallet_client,
        walletClientType: walletAccount.wallet_client_type,
        connectorType: walletAccount.connector_type,
        verifiedAt: walletAccount.verified_at
          ? new Date(walletAccount.verified_at)
          : null,
      });
    }
  }
}

export async function importPrivyUsers(users: PrivyUserImport[]) {
  for (const user of users) {
    try {
      await importPrivyUser(user);
    } catch (error) {
      console.error(`Error importing user ${user.id}:`, error);
    }
  }
}
