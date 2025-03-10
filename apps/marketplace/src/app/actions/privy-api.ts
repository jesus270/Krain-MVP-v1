"use server";

import { PrivyUser } from "./import-privy-users";

/**
 * Parameters for fetching users from the Privy API
 */
export interface FetchUsersParams {
  cursor?: string;
  created_after?: number;
  limit?: number;
}

/**
 * Paginated response from the Privy API
 */
export interface PrivyResponse {
  data: PrivyUser[];
  next_cursor: string | null;
}

/**
 * Error response from the Privy API
 */
export interface PrivyErrorResponse {
  error: string;
  message?: string;
  status_code?: number;
}

// Configuration
const CONFIG = {
  // Default to 1 request per second (1000ms between requests)
  rateLimitMs: 1000,
  // Rate limit configuration (30 requests per minute)
  rateLimit: {
    maxRequestsPerMinute: 30,
    // Exponential backoff parameters
    initialBackoffMs: 1000,
    maxBackoffMs: 60000,
    backoffFactor: 2,
    jitterFactor: 0.1,
  },
};

// Add sleep utility function
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch users from the Privy API
 * @param params Optional parameters for pagination and filtering
 * @returns Promise with the Privy API response
 */
export async function fetchPrivyUsers(
  params: FetchUsersParams = {},
): Promise<PrivyResponse> {
  // Get API credentials from environment variables
  const PRIVY_APP_ID = process.env.PRIVY_APP_ID;
  const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;

  if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
    throw new Error(
      "PRIVY_APP_ID and PRIVY_APP_SECRET environment variables are required",
    );
  }

  // Build URL with query parameters
  let url = "https://auth.privy.io/api/v1/users";
  const queryParams = new URLSearchParams();

  if (params.cursor) queryParams.append("cursor", params.cursor);
  if (params.created_after)
    queryParams.append("created_after", params.created_after.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());

  const queryString = queryParams.toString();
  if (queryString) url += `?${queryString}`;

  let retries = 0;
  let backoffMs = CONFIG.rateLimit.initialBackoffMs;

  while (true) {
    try {
      console.log(`Fetching users from ${url}`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${PRIVY_APP_ID}:${PRIVY_APP_SECRET}`,
          ).toString("base64")}`,
          "privy-app-id": PRIVY_APP_ID,
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit hit - apply exponential backoff
          retries++;
          // Add jitter to avoid thundering herd problem
          const jitter =
            1 + (Math.random() * 2 - 1) * CONFIG.rateLimit.jitterFactor;
          backoffMs = Math.min(
            backoffMs * CONFIG.rateLimit.backoffFactor * jitter,
            CONFIG.rateLimit.maxBackoffMs,
          );

          console.log(
            `Rate limit exceeded. Retrying in ${Math.round(
              backoffMs / 1000,
            )} seconds... (Retry ${retries})`,
          );
          await sleep(backoffMs);
          continue;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Apply standard rate limiting delay after successful request
      // Ensure we don't exceed 30 requests per minute
      await sleep(
        Math.max(
          CONFIG.rateLimitMs,
          60000 / CONFIG.rateLimit.maxRequestsPerMinute,
        ),
      );

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes("HTTP error")) {
        throw error; // Don't retry on HTTP errors other than 429
      }

      // For network errors, also apply exponential backoff
      retries++;
      if (retries > 5) {
        throw new Error(
          `Failed after ${retries} retries: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }

      // Add jitter to avoid thundering herd problem
      const jitter =
        1 + (Math.random() * 2 - 1) * CONFIG.rateLimit.jitterFactor;
      backoffMs = Math.min(
        backoffMs * CONFIG.rateLimit.backoffFactor * jitter,
        CONFIG.rateLimit.maxBackoffMs,
      );

      console.log(
        `Network error. Retrying in ${Math.round(
          backoffMs / 1000,
        )} seconds... (Retry ${retries})`,
      );
      await sleep(backoffMs);
    }
  }
}

/**
 * Fetch a single user from the Privy API by ID
 * @param userId The Privy user ID
 * @returns Promise with the Privy user
 */
export async function fetchPrivyUserById(userId: string): Promise<PrivyUser> {
  // Get API credentials from environment variables
  const PRIVY_APP_ID = process.env.PRIVY_APP_ID;
  const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;

  if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
    throw new Error(
      "PRIVY_APP_ID and PRIVY_APP_SECRET environment variables are required",
    );
  }

  // Build URL
  const url = `https://auth.privy.io/api/v1/users/${userId}`;

  let retries = 0;
  let backoffMs = CONFIG.rateLimit.initialBackoffMs;

  while (true) {
    try {
      console.log(`Fetching user ${userId} from Privy API`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${PRIVY_APP_ID}:${PRIVY_APP_SECRET}`,
          ).toString("base64")}`,
          "privy-app-id": PRIVY_APP_ID,
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit hit - apply exponential backoff
          retries++;
          // Add jitter to avoid thundering herd problem
          const jitter =
            1 + (Math.random() * 2 - 1) * CONFIG.rateLimit.jitterFactor;
          backoffMs = Math.min(
            backoffMs * CONFIG.rateLimit.backoffFactor * jitter,
            CONFIG.rateLimit.maxBackoffMs,
          );

          console.log(
            `Rate limit exceeded. Retrying in ${Math.round(
              backoffMs / 1000,
            )} seconds... (Retry ${retries})`,
          );
          await sleep(backoffMs);
          continue;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Apply standard rate limiting delay after successful request
      await sleep(CONFIG.rateLimitMs);

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes("HTTP error")) {
        throw error; // Don't retry on HTTP errors other than 429
      }

      // For network errors, also apply exponential backoff
      retries++;
      if (retries > 5) {
        throw new Error(
          `Failed after ${retries} retries: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }

      // Add jitter to avoid thundering herd problem
      const jitter =
        1 + (Math.random() * 2 - 1) * CONFIG.rateLimit.jitterFactor;
      backoffMs = Math.min(
        backoffMs * CONFIG.rateLimit.backoffFactor * jitter,
        CONFIG.rateLimit.maxBackoffMs,
      );

      console.log(
        `Network error. Retrying in ${Math.round(
          backoffMs / 1000,
        )} seconds... (Retry ${retries})`,
      );
      await sleep(backoffMs);
    }
  }
}

/**
 * Fetch all users from the Privy API by paginating through results
 * @param params Optional parameters for filtering
 * @returns Promise with all Privy users
 */
export async function fetchAllPrivyUsers(
  params: Omit<FetchUsersParams, "cursor"> = {},
): Promise<PrivyUser[]> {
  let allUsers: PrivyUser[] = [];
  let cursor: string | null = null;
  let totalUsers = 0;
  let batchCount = 0;

  // Number of users to process before taking a longer break
  const usersBatchSize = 2500;
  // How long to pause after hitting the batch size (10 seconds)
  const batchCooldownMs = 10 * 1000;

  try {
    do {
      // Add cooldown period after every batch of users
      if (totalUsers > 0 && totalUsers % usersBatchSize === 0) {
        console.log(
          `Reached ${totalUsers} users. Taking a ${
            batchCooldownMs / 1000
          } second break to avoid rate limits...`,
        );
        await sleep(batchCooldownMs);
      }

      // Fetch a page of users
      const response = await fetchPrivyUsers({
        ...params,
        cursor: cursor || undefined,
        limit: 100, // Maximum allowed by Privy API
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response format from Privy API");
      }

      // Add users to the result array
      if (response.data.length > 0) {
        allUsers = [...allUsers, ...response.data];
        totalUsers += response.data.length;
        batchCount++;
        console.log(
          `Batch ${batchCount}: Fetched ${response.data.length} users (total: ${totalUsers})`,
        );
      }

      // Update cursor for next page
      cursor = response.next_cursor;

      // If we got an empty array and no next cursor, we're done
      if (response.data.length === 0 && !cursor) {
        break;
      }
    } while (cursor !== null);

    console.log(`Successfully fetched ${totalUsers} users from Privy API`);
    return allUsers;
  } catch (error) {
    console.error("Error during user fetching:", error);
    throw error;
  }
}
