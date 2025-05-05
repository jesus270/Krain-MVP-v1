"use server";

import { db, userTable, whitelistSignupTable, User as DbUser } from "@krain/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import {
  withServerActionProtection,
  getSession,
  Session,
} from "@krain/session/server";
import { log, isValidEthereumAddress } from "@krain/utils";
import type { WhitelistSignupResult, User } from "@krain/session/types";

export async function signupForWhitelist() {
  throw new Error("Server actions are disabled");
}

export async function checkWhitelistSignup() {
  throw new Error("Server actions are disabled");
}

export async function updateWhitelistWallet() {
  throw new Error("Server actions are disabled");
}

// export async function signupForWhitelist(input: {
//   userId: string;
//   clientVerifiedEthAddress?: string | null;
//   clientVerifiedEmailAddress?: string | null;
// }): Promise<WhitelistSignupResult> {
//   log.info("signupForWhitelist: Action started", {
//     operation: "signup_for_whitelist",
//     userId: input.userId,
//     receivedInput: JSON.stringify(input),
//   });

//   try {
//     const protectionResponse = await withServerActionProtection(
//       { headers: headers() },
//       "default",
//     );
//     if (protectionResponse !== null) {
//       throw new Error(
//         protectionResponse.statusText ||
//           "Protection check failed or unauthorized",
//       );
//     }

//     log.info("signupForWhitelist: Manual session retrieval", {
//       operation: "signup_for_whitelist_manual_session_retrieval",
//       userId: input.userId,
//     });
//     const session: Session | null = await getSession(input.userId);

//     if (!session) {
//       log.warn("signupForWhitelist failed: No session", {
//         operation: "signup_for_whitelist_failed_no_session",
//         userId: input.userId,
//       });
//       throw new Error("Authentication required: Session not found");
//     }

//     const isActive = await session.checkActivity();
//     if (!isActive) {
//       log.warn("signupForWhitelist failed: Session inactive", {
//         operation: "signup_for_whitelist_failed_session_inactive",
//         userId: input.userId,
//       });
//       throw new Error("Authentication required: Session expired");
//     }

//     if (!session.get("isLoggedIn")) {
//       log.warn("signupForWhitelist: Session missing isLoggedIn flag", {
//         operation: "signup_for_whitelist_session_missing_isLoggedIn_flag",
//         userId: input.userId,
//       });
//       session.set("isLoggedIn", true);
//       await session.save();
//     }

//     const user: User | undefined = session.get("user");
//     log.info("User object from session", {
//       operation: "signup_for_whitelist_get_user_from_session",
//       userId: input.userId,
//       retrievedUser: user,
//     });

//     if (!user) throw new Error("No user in session after checks");

//     // --- Re-fetch latest user data from DB within the action ---
//     let latestDbUser: DbUser | null = null;
//     try {
//       latestDbUser =
//         (await db.query.userTable.findFirst({
//           where: eq(userTable.privyId, user.id), // Use user.id from session
//         })) ?? null;
//     } catch (dbFetchError) {
//       log.error("Failed to re-fetch user from DB in signup action", {
//         operation: "signup_db_refetch_error",
//         entity: "ACTION",
//         userId: input.userId,
//         error:
//           dbFetchError instanceof Error
//             ? dbFetchError.message
//             : String(dbFetchError),
//       });
//       // Proceed with potentially stale session data if refetch fails?
//       // Or throw? Let's throw for now to be safe.
//       throw new Error("Could not verify user data. Please try again.");
//     }

//     if (!latestDbUser) {
//       log.error("User not found in DB during signup action re-fetch", {
//         operation: "signup_db_refetch_not_found",
//         entity: "ACTION",
//         userId: input.userId,
//       });
//       throw new Error("User data inconsistency. Please try again.");
//     }

//     // Determine Email: Prioritize client-provided, fallback to DB/session
//     let emailAddress = input.clientVerifiedEmailAddress;
//     log.info("signupForWhitelist: Initial email check", {
//       operation: "signup_email_check_initial",
//       userId: input.userId,
//       clientProvidedEmail: input.clientVerifiedEmailAddress,
//       derivedEmailAddress: emailAddress,
//     });

//     if (!emailAddress) {
//       log.warn(
//         "Client did not provide email, falling back to DB/session check",
//         {
//           operation: "signup_email_fallback_db_session",
//           userId: input.userId,
//         },
//       );
//       emailAddress = latestDbUser.email || user?.email?.address;
//     }
//     // Final email check
//     if (!emailAddress) {
//       log.error("Email address check failed: Email missing everywhere.", {
//         operation: "signup_for_whitelist_email_check_failed_final",
//         userId: input.userId,
//         dbEmail: latestDbUser.email,
//         sessionEmail: user?.email?.address,
//         clientEmail: input.clientVerifiedEmailAddress,
//       });
//       throw new Error("Email address is required for whitelist signup");
//     }

//     // Determine wallet address: Prioritize client-provided, then DB/session checks
//     let walletAddress: string | null = null;

//     // 1. Validate and use client-provided address if available
//     if (
//       input.clientVerifiedEthAddress &&
//       isValidEthereumAddress(input.clientVerifiedEthAddress)
//     ) {
//       walletAddress = input.clientVerifiedEthAddress;
//       log.info("Using client-verified ETH address", {
//         operation: "signup_use_client_verified_wallet",
//         userId: input.userId,
//         walletAddress,
//       });
//     }
//     // 2. If client didn't provide a valid one, attempt DB/session lookup (fallbacks)
//     else {
//       log.warn(
//         "Client-provided ETH address missing or invalid, attempting DB/session lookup",
//         {
//           operation: "signup_fallback_to_db_session_lookup",
//           userId: input.userId,
//           clientProvided: input.clientVerifiedEthAddress,
//         },
//       );

//       // 2a. Check primary DB wallet
//       if (
//         latestDbUser.walletAddress &&
//         isValidEthereumAddress(latestDbUser.walletAddress)
//       ) {
//         walletAddress = latestDbUser.walletAddress;
//         log.info("Using primary DB wallet address (fallback)", {
//           operation: "signup_use_primary_db_wallet_fallback",
//           userId: input.userId,
//           walletAddress,
//         });
//       }
//       // 2b. Check linked DB accounts
//       else if (latestDbUser.linkedAccounts) {
//         log.info("Checking linked DB accounts (fallback)", {
//           operation: "signup_check_db_linked_accounts",
//           userId: input.userId,
//           primaryDbWallet: latestDbUser.walletAddress,
//         });

//         let foundEthLinked: string | null = null;
//         if (Array.isArray(latestDbUser.linkedAccounts)) {
//           for (const account of latestDbUser.linkedAccounts) {
//             let addressToCheck: string | null = null;
//             if (typeof account === "string") {
//               addressToCheck = account;
//             } else if (
//               typeof account === "object" &&
//               account !== null &&
//               typeof (account as any).address === "string"
//             ) {
//               addressToCheck = (account as any).address;
//             }

//             if (addressToCheck && isValidEthereumAddress(addressToCheck)) {
//               foundEthLinked = addressToCheck;
//               break; // Found the first valid ETH linked account
//             }
//           }
//         }
//         if (foundEthLinked) {
//           walletAddress = foundEthLinked;
//           log.info("Found ETH in DB linked accounts (fallback)", {
//             operation: "signup_db_linked_account_found",
//             userId: input.userId,
//             walletAddress,
//           });
//         }
//       }

//       // 2c. Check linked session accounts (last resort fallback)
//       if (!walletAddress && user?.linkedAccounts) {
//         log.warn("Checking session linked accounts (last resort fallback)", {
//           operation: "signup_check_session_linked_accounts",
//           userId: input.userId,
//         });
//         let foundEthInSession: string | null = null;
//         if (Array.isArray(user.linkedAccounts)) {
//           for (const account of user.linkedAccounts) {
//             let addressToCheck: string | null = null;
//             if (typeof account === "string") {
//               addressToCheck = account;
//             } else if (
//               typeof account === "object" &&
//               account !== null &&
//               typeof (account as any).address === "string"
//             ) {
//               addressToCheck = (account as any).address;
//             }
//             if (addressToCheck && isValidEthereumAddress(addressToCheck)) {
//               foundEthInSession = addressToCheck;
//               break;
//             }
//           }
//         }
//         if (foundEthInSession) {
//           walletAddress = foundEthInSession;
//           log.info(
//             "Found ETH in Session linked accounts (last resort fallback)",
//             {
//               operation: "signup_session_linked_account_found",
//               userId: input.userId,
//               walletAddress,
//             },
//           );
//         }
//       }
//     }

//     // 3. Final Check: If STILL no valid Ethereum address found
//     if (!walletAddress) {
//       log.error(
//         "No valid Ethereum wallet address found (checked client, DB primary, DB linked, session linked)",
//         {
//           operation: "signup_for_whitelist_wallet_check_failed_final",
//           userId: input.userId,
//           dbPrimaryWallet: latestDbUser.walletAddress,
//         },
//       );
//       throw new Error(
//         "A valid Ethereum wallet address is required. Please ensure one is connected.",
//       );
//     }

//     // At this point, walletAddress holds a valid Ethereum address found in the DB or session
//     log.info("Proceeding with signup using valid Ethereum address from DB", {
//       operation: "signup_for_whitelist_wallet_ok",
//       userId: input.userId,
//       walletAddress, // This is guaranteed to be a valid ETH address
//     });

//     // --> VALIDATION using the walletAddress derived from DB <--
//     // This check is now redundant as we ensured walletAddress is valid ETH above, but harmless to keep.
//     // if (!isValidEthereumAddress(walletAddress)) { ... } // Can be removed or kept

//     const existingSignup = await db
//       .select()
//       .from(whitelistSignupTable)
//       .where(
//         and(
//           eq(whitelistSignupTable.email, emailAddress),
//           eq(whitelistSignupTable.walletAddress, walletAddress),
//         ),
//       )
//       .limit(1);
//     log.info("Database check result", {
//       operation: "signup_for_whitelist_db_check_result",
//       userId: input.userId,
//       result: existingSignup.length > 0,
//     });

//     if (existingSignup.length > 0) {
//       const returnPayload: WhitelistSignupResult = {
//         status: "already_signed_up",
//         message: "Already signed up for whitelist",
//       };
//       log.info("Returning already signed up", {
//         operation: "signup_for_whitelist_return_already_signed_up",
//         userId: input.userId,
//         payload: returnPayload,
//       });
//       return returnPayload;
//     }

//     log.info("Attempting to insert new signup into database", {
//       operation: "signup_for_whitelist_db_insert_start",
//       userId: input.userId,
//     });
//     await db.insert(whitelistSignupTable).values({
//       email: emailAddress,
//       walletAddress: walletAddress,
//     });
//     log.info("Database insert successful", {
//       operation: "signup_for_whitelist_db_insert_success",
//       userId: input.userId,
//     });

//     // Return the details used for success
//     const successPayload: WhitelistSignupResult = {
//       success: true,
//       email: emailAddress, // Include email used
//       walletAddress: walletAddress, // Include wallet used
//     };
//     log.info("Returning success object with details", {
//       operation: "signup_for_whitelist_return_success_obj",
//       userId: input.userId,
//       payload: successPayload,
//     });
//     return successPayload;
//   } catch (error) {
//     log.error("Error in signupForWhitelist", {
//       entity: "ACTION",
//       operation: "signup_for_whitelist",
//       userId: input.userId,
//       error: error instanceof Error ? error.message : String(error),
//       stack: error instanceof Error ? error.stack : undefined,
//     });
//     // Keep the original error returning logic
//     if (
//       error instanceof Error &&
//       error.message.includes("Authentication required")
//     ) {
//       return {
//         status: "error",
//         message: "Authentication failed. Please ensure you are logged in.",
//       };
//     }
//     return {
//       status: "error",
//       message:
//         error instanceof Error ? error.message : "An unknown error occurred.",
//     };
//   }
// }

// export async function checkWhitelistSignup(input: { userId: string }): Promise<{
//   sessionReady: boolean;
//   isSignedUp: boolean;
//   isAddressValid: boolean | null; // null if not signed up
//   walletAddress: string | null; // The stored address if signed up
// }> {
//   log.info("checkWhitelistSignup: Action started", {
//     operation: "check_whitelist_signup",
//     userId: input.userId,
//   });
//   try {
//     const protectionResponse = await withServerActionProtection(
//       { headers: headers() },
//       "default",
//     );
//     if (protectionResponse !== null) {
//       throw new Error(
//         protectionResponse.statusText ||
//           "Protection check failed or unauthorized",
//       );
//     }

//     const session = await getSession(input.userId);
//     if (!session) {
//       log.info("checkWhitelistSignup: Session not ready yet", {
//         operation: "check_whitelist_signup",
//         userId: input.userId,
//       });
//       // Return default state indicating session isn't ready
//       return {
//         sessionReady: false,
//         isSignedUp: false,
//         isAddressValid: null,
//         walletAddress: null,
//       };
//     }

//     const user = session.get("user");
//     // Add null check for user before accessing email
//     const emailAddress = user?.email?.address;

//     if (!emailAddress) {
//       // No email, cannot be signed up
//       log.info("checkWhitelistSignup: No email in session", {
//         operation: "check_whitelist_signup_no_email",
//         userId: input.userId,
//       });
//       return {
//         sessionReady: true,
//         isSignedUp: false,
//         isAddressValid: null,
//         walletAddress: null,
//       };
//     }

//     // Check database using only email first
//     const existingSignup = await db
//       .select({
//         walletAddress: whitelistSignupTable.walletAddress,
//       })
//       .from(whitelistSignupTable)
//       .where(eq(whitelistSignupTable.email, emailAddress))
//       .limit(1);

//     if (existingSignup.length > 0) {
//       // Add an explicit check for the element although length check should suffice
//       const firstSignup = existingSignup[0];
//       if (firstSignup) {
//         const storedWalletAddress = firstSignup.walletAddress;
//         const isValid = isValidEthereumAddress(storedWalletAddress);
//         log.info("checkWhitelistSignup: Found signup record", {
//           operation: "check_whitelist_signup_found",
//           userId: input.userId,
//           email: emailAddress,
//           storedWalletAddress: storedWalletAddress,
//           isValid: isValid,
//         });
//         return {
//           sessionReady: true,
//           isSignedUp: true,
//           isAddressValid: isValid,
//           walletAddress: storedWalletAddress,
//         };
//       }
//     }
//     // If length was > 0 but firstSignup was somehow undefined,
//     // it will fall through to the 'not found' case implicitly, which is acceptable.

//     // No signup found for this email or issue with accessing the record
//     log.info(
//       "checkWhitelistSignup: No signup found for email or issue accessing record",
//       {
//         operation: "check_whitelist_signup_not_found",
//         userId: input.userId,
//         email: emailAddress,
//       },
//     );
//     return {
//       sessionReady: true,
//       isSignedUp: false,
//       isAddressValid: null,
//       walletAddress: null,
//     };

//     // Old logic removed - we now check DB first based on email
//   } catch (error) {
//     log.error("Error in checkWhitelistSignup", {
//       entity: "ACTION",
//       operation: "check_whitelist_signup",
//       userId: input.userId,
//       error: error instanceof Error ? error.message : String(error),
//       stack: error instanceof Error ? error.stack : undefined,
//     });
//     // Return default non-ready/non-signed-up state on error
//     return {
//       sessionReady: false,
//       isSignedUp: false,
//       isAddressValid: null,
//       walletAddress: null,
//     };
//   }
// }

// // New action to update wallet address
// export async function updateWhitelistWallet(input: {
//   userId: string;
//   newWalletAddress: string;
// }): Promise<{ success: boolean; message?: string }> {
//   log.info("updateWhitelistWallet: Action started", {
//     operation: "update_whitelist_wallet",
//     userId: input.userId,
//   });

//   try {
//     const protectionResponse = await withServerActionProtection(
//       { headers: headers() },
//       "default",
//     );
//     if (protectionResponse !== null) {
//       throw new Error(
//         protectionResponse.statusText ||
//           "Protection check failed or unauthorized",
//       );
//     }

//     // Validate the new address
//     if (!isValidEthereumAddress(input.newWalletAddress)) {
//       log.warn("updateWhitelistWallet: Invalid new address provided", {
//         operation: "update_whitelist_wallet_invalid_address",
//         userId: input.userId,
//         newAddress: input.newWalletAddress,
//       });
//       return {
//         success: false,
//         message: "Invalid Ethereum wallet address provided.",
//       };
//     }

//     const session = await getSession(input.userId);
//     if (!session) {
//       throw new Error("Authentication required: Session not found");
//     }

//     const user = session.get("user");
//     // Explicitly check user before accessing email
//     if (!user || !user.email?.address) {
//       const emailAddress = user?.email?.address; // Keep for logging consistency
//       log.error("updateWhitelistWallet: Email address not found in session", {
//         operation: "update_whitelist_wallet_no_email",
//         userId: input.userId,
//         user: user, // Log the user object if it exists
//       });
//       throw new Error("Email address not found in session, cannot update.");
//     }
//     // Now we know user and user.email.address exist
//     const emailAddress = user.email.address;

//     // Check if a record exists for this email
//     const existingRecord = await db
//       .select({ id: whitelistSignupTable.id })
//       .from(whitelistSignupTable)
//       .where(eq(whitelistSignupTable.email, emailAddress))
//       .limit(1);

//     if (existingRecord.length === 0) {
//       log.error("updateWhitelistWallet: No existing record found for email", {
//         operation: "update_whitelist_wallet_no_record",
//         userId: input.userId,
//         email: emailAddress,
//       });
//       return {
//         success: false,
//         message: "No existing whitelist record found to update.",
//       };
//     }

//     // Update the wallet address for the found record
//     await db
//       .update(whitelistSignupTable)
//       .set({ walletAddress: input.newWalletAddress })
//       .where(eq(whitelistSignupTable.email, emailAddress));

//     log.info("updateWhitelistWallet: Successfully updated wallet address", {
//       operation: "update_whitelist_wallet_success",
//       userId: input.userId,
//       email: emailAddress,
//       newAddress: input.newWalletAddress,
//     });
//     return { success: true };
//   } catch (error) {
//     log.error("Error in updateWhitelistWallet", {
//       entity: "ACTION",
//       operation: "update_whitelist_wallet",
//       userId: input.userId,
//       error: error instanceof Error ? error.message : String(error),
//       stack: error instanceof Error ? error.stack : undefined,
//     });
//     return {
//       success: false,
//       message:
//         error instanceof Error ? error.message : "An unknown error occurred.",
//     };
//   }
// }
// export async function signupForWhitelist(input: {
  //   userId: string;
  //   clientVerifiedEthAddress?: string | null;
  //   clientVerifiedEmailAddress?: string | null;
  // }): Promise<WhitelistSignupResult> {
  //   log.info("signupForWhitelist: Action started", {
  //     operation: "signup_for_whitelist",
  //     userId: input.userId,
  //     receivedInput: JSON.stringify(input),
  //   });
  
  //   try {
  //     const protectionResponse = await withServerActionProtection(
  //       { headers: headers() },
  //       "default",
  //     );
  //     if (protectionResponse !== null) {
  //       throw new Error(
  //         protectionResponse.statusText ||
  //           "Protection check failed or unauthorized",
  //       );
  //     }
  
  //     log.info("signupForWhitelist: Manual session retrieval", {
  //       operation: "signup_for_whitelist_manual_session_retrieval",
  //       userId: input.userId,
  //     });
  //     const session: Session | null = await getSession(input.userId);
  
  //     if (!session) {
  //       log.warn("signupForWhitelist failed: No session", {
  //         operation: "signup_for_whitelist_failed_no_session",
  //         userId: input.userId,
  //       });
  //       throw new Error("Authentication required: Session not found");
  //     }
  
  //     const isActive = await session.checkActivity();
  //     if (!isActive) {
  //       log.warn("signupForWhitelist failed: Session inactive", {
  //         operation: "signup_for_whitelist_failed_session_inactive",
  //         userId: input.userId,
  //       });
  //       throw new Error("Authentication required: Session expired");
  //     }
  
  //     if (!session.get("isLoggedIn")) {
  //       log.warn("signupForWhitelist: Session missing isLoggedIn flag", {
  //         operation: "signup_for_whitelist_session_missing_isLoggedIn_flag",
  //         userId: input.userId,
  //       });
  //       session.set("isLoggedIn", true);
  //       await session.save();
  //     }
  
  //     const user: User | undefined = session.get("user");
  //     log.info("User object from session", {
  //       operation: "signup_for_whitelist_get_user_from_session",
  //       userId: input.userId,
  //       retrievedUser: user,
  //     });
  
  //     if (!user) throw new Error("No user in session after checks");
  
  //     // --- Re-fetch latest user data from DB within the action ---
  //     let latestDbUser: DbUser | null = null;
  //     try {
  //       latestDbUser =
  //         (await db.query.userTable.findFirst({
  //           where: eq(userTable.privyId, user.id), // Use user.id from session
  //         })) ?? null;
  //     } catch (dbFetchError) {
  //       log.error("Failed to re-fetch user from DB in signup action", {
  //         operation: "signup_db_refetch_error",
  //         entity: "ACTION",
  //         userId: input.userId,
  //         error:
  //           dbFetchError instanceof Error
  //             ? dbFetchError.message
  //             : String(dbFetchError),
  //       });
  //       // Proceed with potentially stale session data if refetch fails?
  //       // Or throw? Let's throw for now to be safe.
  //       throw new Error("Could not verify user data. Please try again.");
  //     }
  
  //     if (!latestDbUser) {
  //       log.error("User not found in DB during signup action re-fetch", {
  //         operation: "signup_db_refetch_not_found",
  //         entity: "ACTION",
  //         userId: input.userId,
  //       });
  //       throw new Error("User data inconsistency. Please try again.");
  //     }
  
  //     // Determine Email: Prioritize client-provided, fallback to DB/session
  //     let emailAddress = input.clientVerifiedEmailAddress;
  //     log.info("signupForWhitelist: Initial email check", {
  //       operation: "signup_email_check_initial",
  //       userId: input.userId,
  //       clientProvidedEmail: input.clientVerifiedEmailAddress,
  //       derivedEmailAddress: emailAddress,
  //     });
  
  //     if (!emailAddress) {
  //       log.warn(
  //         "Client did not provide email, falling back to DB/session check",
  //         {
  //           operation: "signup_email_fallback_db_session",
  //           userId: input.userId,
  //         },
  //       );
  //       emailAddress = latestDbUser.email || user?.email?.address;
  //     }
  //     // Final email check
  //     if (!emailAddress) {
  //       log.error("Email address check failed: Email missing everywhere.", {
  //         operation: "signup_for_whitelist_email_check_failed_final",
  //         userId: input.userId,
  //         dbEmail: latestDbUser.email,
  //         sessionEmail: user?.email?.address,
  //         clientEmail: input.clientVerifiedEmailAddress,
  //       });
  //       throw new Error("Email address is required for whitelist signup");
  //     }
  
  //     // Determine wallet address: Prioritize client-provided, then DB/session checks
  //     let walletAddress: string | null = null;
  
  //     // 1. Validate and use client-provided address if available
  //     if (
  //       input.clientVerifiedEthAddress &&
  //       isValidEthereumAddress(input.clientVerifiedEthAddress)
  //     ) {
  //       walletAddress = input.clientVerifiedEthAddress;
  //       log.info("Using client-verified ETH address", {
  //         operation: "signup_use_client_verified_wallet",
  //         userId: input.userId,
  //         walletAddress,
  //       });
  //     }
  //     // 2. If client didn't provide a valid one, attempt DB/session lookup (fallbacks)
  //     else {
  //       log.warn(
  //         "Client-provided ETH address missing or invalid, attempting DB/session lookup",
  //         {
  //           operation: "signup_fallback_to_db_session_lookup",
  //           userId: input.userId,
  //           clientProvided: input.clientVerifiedEthAddress,
  //         },
  //       );
  
  //       // 2a. Check primary DB wallet
  //       if (
  //         latestDbUser.walletAddress &&
  //         isValidEthereumAddress(latestDbUser.walletAddress)
  //       ) {
  //         walletAddress = latestDbUser.walletAddress;
  //         log.info("Using primary DB wallet address (fallback)", {
  //           operation: "signup_use_primary_db_wallet_fallback",
  //           userId: input.userId,
  //           walletAddress,
  //         });
  //       }
  //       // 2b. Check linked DB accounts
  //       else if (latestDbUser.linkedAccounts) {
  //         log.info("Checking linked DB accounts (fallback)", {
  //           operation: "signup_check_db_linked_accounts",
  //           userId: input.userId,
  //           primaryDbWallet: latestDbUser.walletAddress,
  //         });
  
  //         let foundEthLinked: string | null = null;
  //         if (Array.isArray(latestDbUser.linkedAccounts)) {
  //           for (const account of latestDbUser.linkedAccounts) {
  //             let addressToCheck: string | null = null;
  //             if (typeof account === "string") {
  //               addressToCheck = account;
  //             } else if (
  //               typeof account === "object" &&
  //               account !== null &&
  //               typeof (account as any).address === "string"
  //             ) {
  //               addressToCheck = (account as any).address;
  //             }
  
  //             if (addressToCheck && isValidEthereumAddress(addressToCheck)) {
  //               foundEthLinked = addressToCheck;
  //               break; // Found the first valid ETH linked account
  //             }
  //           }
  //         }
  //         if (foundEthLinked) {
  //           walletAddress = foundEthLinked;
  //           log.info("Found ETH in DB linked accounts (fallback)", {
  //             operation: "signup_db_linked_account_found",
  //             userId: input.userId,
  //             walletAddress,
  //           });
  //         }
  //       }
  
  //       // 2c. Check linked session accounts (last resort fallback)
  //       if (!walletAddress && user?.linkedAccounts) {
  //         log.warn("Checking session linked accounts (last resort fallback)", {
  //           operation: "signup_check_session_linked_accounts",
  //           userId: input.userId,
  //         });
  //         let foundEthInSession: string | null = null;
  //         if (Array.isArray(user.linkedAccounts)) {
  //           for (const account of user.linkedAccounts) {
  //             let addressToCheck: string | null = null;
  //             if (typeof account === "string") {
  //               addressToCheck = account;
  //             } else if (
  //               typeof account === "object" &&
  //               account !== null &&
  //               typeof (account as any).address === "string"
  //             ) {
  //               addressToCheck = (account as any).address;
  //             }
  //             if (addressToCheck && isValidEthereumAddress(addressToCheck)) {
  //               foundEthInSession = addressToCheck;
  //               break;
  //             }
  //           }
  //         }
  //         if (foundEthInSession) {
  //           walletAddress = foundEthInSession;
  //           log.info(
  //             "Found ETH in Session linked accounts (last resort fallback)",
  //             {
  //               operation: "signup_session_linked_account_found",
  //               userId: input.userId,
  //               walletAddress,
  //             },
  //           );
  //         }
  //       }
  //     }
  
  //     // 3. Final Check: If STILL no valid Ethereum address found
  //     if (!walletAddress) {
  //       log.error(
  //         "No valid Ethereum wallet address found (checked client, DB primary, DB linked, session linked)",
  //         {
  //           operation: "signup_for_whitelist_wallet_check_failed_final",
  //           userId: input.userId,
  //           dbPrimaryWallet: latestDbUser.walletAddress,
  //         },
  //       );
  //       throw new Error(
  //         "A valid Ethereum wallet address is required. Please ensure one is connected.",
  //       );
  //     }
  
  //     // At this point, walletAddress holds a valid Ethereum address found in the DB or session
  //     log.info("Proceeding with signup using valid Ethereum address from DB", {
  //       operation: "signup_for_whitelist_wallet_ok",
  //       userId: input.userId,
  //       walletAddress, // This is guaranteed to be a valid ETH address
  //     });
  
  //     // --> VALIDATION using the walletAddress derived from DB <--
  //     // This check is now redundant as we ensured walletAddress is valid ETH above, but harmless to keep.
  //     // if (!isValidEthereumAddress(walletAddress)) { ... } // Can be removed or kept
  
  //     const existingSignup = await db
  //       .select()
  //       .from(whitelistSignupTable)
  //       .where(
  //         and(
  //           eq(whitelistSignupTable.email, emailAddress),
  //           eq(whitelistSignupTable.walletAddress, walletAddress),
  //         ),
  //       )
  //       .limit(1);
  //     log.info("Database check result", {
  //       operation: "signup_for_whitelist_db_check_result",
  //       userId: input.userId,
  //       result: existingSignup.length > 0,
  //     });
  
  //     if (existingSignup.length > 0) {
  //       const returnPayload: WhitelistSignupResult = {
  //         status: "already_signed_up",
  //         message: "Already signed up for whitelist",
  //       };
  //       log.info("Returning already signed up", {
  //         operation: "signup_for_whitelist_return_already_signed_up",
  //         userId: input.userId,
  //         payload: returnPayload,
  //       });
  //       return returnPayload;
  //     }
  
  //     log.info("Attempting to insert new signup into database", {
  //       operation: "signup_for_whitelist_db_insert_start",
  //       userId: input.userId,
  //     });
  //     await db.insert(whitelistSignupTable).values({
  //       email: emailAddress,
  //       walletAddress: walletAddress,
  //     });
  //     log.info("Database insert successful", {
  //       operation: "signup_for_whitelist_db_insert_success",
  //       userId: input.userId,
  //     });
  
  //     // Return the details used for success
  //     const successPayload: WhitelistSignupResult = {
  //       success: true,
  //       email: emailAddress, // Include email used
  //       walletAddress: walletAddress, // Include wallet used
  //     };
  //     log.info("Returning success object with details", {
  //       operation: "signup_for_whitelist_return_success_obj",
  //       userId: input.userId,
  //       payload: successPayload,
  //     });
  //     return successPayload;
  //   } catch (error) {
  //     log.error("Error in signupForWhitelist", {
  //       entity: "ACTION",
  //       operation: "signup_for_whitelist",
  //       userId: input.userId,
  //       error: error instanceof Error ? error.message : String(error),
  //       stack: error instanceof Error ? error.stack : undefined,
  //     });
  //     // Keep the original error returning logic
  //     if (
  //       error instanceof Error &&
  //       error.message.includes("Authentication required")
  //     ) {
  //       return {
  //         status: "error",
  //         message: "Authentication failed. Please ensure you are logged in.",
  //       };
  //     }
  //     return {
  //       status: "error",
  //       message:
  //         error instanceof Error ? error.message : "An unknown error occurred.",
  //     };
  //   }
  // }
  
  // export async function checkWhitelistSignup(input: { userId: string }): Promise<{
  //   sessionReady: boolean;
  //   isSignedUp: boolean;
  //   isAddressValid: boolean | null; // null if not signed up
  //   walletAddress: string | null; // The stored address if signed up
  // }> {
  //   log.info("checkWhitelistSignup: Action started", {
  //     operation: "check_whitelist_signup",
  //     userId: input.userId,
  //   });
  //   try {
  //     const protectionResponse = await withServerActionProtection(
  //       { headers: headers() },
  //       "default",
  //     );
  //     if (protectionResponse !== null) {
  //       throw new Error(
  //         protectionResponse.statusText ||
  //           "Protection check failed or unauthorized",
  //       );
  //     }
  
  //     const session = await getSession(input.userId);
  //     if (!session) {
  //       log.info("checkWhitelistSignup: Session not ready yet", {
  //         operation: "check_whitelist_signup",
  //         userId: input.userId,
  //       });
  //       // Return default state indicating session isn't ready
  //       return {
  //         sessionReady: false,
  //         isSignedUp: false,
  //         isAddressValid: null,
  //         walletAddress: null,
  //       };
  //     }
  
  //     const user = session.get("user");
  //     // Add null check for user before accessing email
  //     const emailAddress = user?.email?.address;
  
  //     if (!emailAddress) {
  //       // No email, cannot be signed up
  //       log.info("checkWhitelistSignup: No email in session", {
  //         operation: "check_whitelist_signup_no_email",
  //         userId: input.userId,
  //       });
  //       return {
  //         sessionReady: true,
  //         isSignedUp: false,
  //         isAddressValid: null,
  //         walletAddress: null,
  //       };
  //     }
  
  //     // Check database using only email first
  //     const existingSignup = await db
  //       .select({
  //         walletAddress: whitelistSignupTable.walletAddress,
  //       })
  //       .from(whitelistSignupTable)
  //       .where(eq(whitelistSignupTable.email, emailAddress))
  //       .limit(1);
  
  //     if (existingSignup.length > 0) {
  //       // Add an explicit check for the element although length check should suffice
  //       const firstSignup = existingSignup[0];
  //       if (firstSignup) {
  //         const storedWalletAddress = firstSignup.walletAddress;
  //         const isValid = isValidEthereumAddress(storedWalletAddress);
  //         log.info("checkWhitelistSignup: Found signup record", {
  //           operation: "check_whitelist_signup_found",
  //           userId: input.userId,
  //           email: emailAddress,
  //           storedWalletAddress: storedWalletAddress,
  //           isValid: isValid,
  //         });
  //         return {
  //           sessionReady: true,
  //           isSignedUp: true,
  //           isAddressValid: isValid,
  //           walletAddress: storedWalletAddress,
  //         };
  //       }
  //     }
  //     // If length was > 0 but firstSignup was somehow undefined,
  //     // it will fall through to the 'not found' case implicitly, which is acceptable.
  
  //     // No signup found for this email or issue with accessing the record
  //     log.info(
  //       "checkWhitelistSignup: No signup found for email or issue accessing record",
  //       {
  //         operation: "check_whitelist_signup_not_found",
  //         userId: input.userId,
  //         email: emailAddress,
  //       },
  //     );
  //     return {
  //       sessionReady: true,
  //       isSignedUp: false,
  //       isAddressValid: null,
  //       walletAddress: null,
  //     };
  
  //     // Old logic removed - we now check DB first based on email
  //   } catch (error) {
  //     log.error("Error in checkWhitelistSignup", {
  //       entity: "ACTION",
  //       operation: "check_whitelist_signup",
  //       userId: input.userId,
  //       error: error instanceof Error ? error.message : String(error),
  //       stack: error instanceof Error ? error.stack : undefined,
  //     });
  //     // Return default non-ready/non-signed-up state on error
  //     return {
  //       sessionReady: false,
  //       isSignedUp: false,
  //       isAddressValid: null,
  //       walletAddress: null,
  //     };
  //   }
  // }
  
  // // New action to update wallet address
  // export async function updateWhitelistWallet(input: {
  //   userId: string;
  //   newWalletAddress: string;
  // }): Promise<{ success: boolean; message?: string }> {
  //   log.info("updateWhitelistWallet: Action started", {
  //     operation: "update_whitelist_wallet",
  //     userId: input.userId,
  //   });
  
  //   try {
  //     const protectionResponse = await withServerActionProtection(
  //       { headers: headers() },
  //       "default",
  //     );
  //     if (protectionResponse !== null) {
  //       throw new Error(
  //         protectionResponse.statusText ||
  //           "Protection check failed or unauthorized",
  //       );
  //     }
  
  //     // Validate the new address
  //     if (!isValidEthereumAddress(input.newWalletAddress)) {
  //       log.warn("updateWhitelistWallet: Invalid new address provided", {
  //         operation: "update_whitelist_wallet_invalid_address",
  //         userId: input.userId,
  //         newAddress: input.newWalletAddress,
  //       });
  //       return {
  //         success: false,
  //         message: "Invalid Ethereum wallet address provided.",
  //       };
  //     }
  
  //     const session = await getSession(input.userId);
  //     if (!session) {
  //       throw new Error("Authentication required: Session not found");
  //     }
  
  //     const user = session.get("user");
  //     // Explicitly check user before accessing email
  //     if (!user || !user.email?.address) {
  //       const emailAddress = user?.email?.address; // Keep for logging consistency
  //       log.error("updateWhitelistWallet: Email address not found in session", {
  //         operation: "update_whitelist_wallet_no_email",
  //         userId: input.userId,
  //         user: user, // Log the user object if it exists
  //       });
  //       throw new Error("Email address not found in session, cannot update.");
  //     }
  //     // Now we know user and user.email.address exist
  //     const emailAddress = user.email.address;
  
  //     // Check if a record exists for this email
  //     const existingRecord = await db
  //       .select({ id: whitelistSignupTable.id })
  //       .from(whitelistSignupTable)
  //       .where(eq(whitelistSignupTable.email, emailAddress))
  //       .limit(1);
  
  //     if (existingRecord.length === 0) {
  //       log.error("updateWhitelistWallet: No existing record found for email", {
  //         operation: "update_whitelist_wallet_no_record",
  //         userId: input.userId,
  //         email: emailAddress,
  //       });
  //       return {
  //         success: false,
  //         message: "No existing whitelist record found to update.",
  //       };
  //     }
  
  //     // Update the wallet address for the found record
  //     await db
  //       .update(whitelistSignupTable)
  //       .set({ walletAddress: input.newWalletAddress })
  //       .where(eq(whitelistSignupTable.email, emailAddress));
  
  //     log.info("updateWhitelistWallet: Successfully updated wallet address", {
  //       operation: "update_whitelist_wallet_success",
  //       userId: input.userId,
  //       email: emailAddress,
  //       newAddress: input.newWalletAddress,
  //     });
  //     return { success: true };
  //   } catch (error) {
  //     log.error("Error in updateWhitelistWallet", {
  //       entity: "ACTION",
  //       operation: "update_whitelist_wallet",
  //       userId: input.userId,
  //       error: error instanceof Error ? error.message : String(error),
  //       stack: error instanceof Error ? error.stack : undefined,
  //     });
  //     return {
  //       success: false,
  //       message:
  //         error instanceof Error ? error.message : "An unknown error occurred.",
  //     };
  //   }
  // }
  