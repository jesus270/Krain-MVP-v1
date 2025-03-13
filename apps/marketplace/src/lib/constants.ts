// Session configuration
export const SESSION_SECRET =
  // Only access process.env on the server side
  typeof window === "undefined"
    ? process.env.SESSION_SECRET || "marketplace-production-secret"
    : "client-side-placeholder"; // Safe placeholder for client side
