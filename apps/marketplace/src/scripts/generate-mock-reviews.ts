"use server";

import { generateMockReviews } from "../app/actions/reviews";

// This script will generate mock reviews for all agents in the database
export async function runGenerateMockReviews() {
  try {
    console.log("Generating mock reviews for agents...");
    const result = await generateMockReviews();
    console.log("Done:", result);
    return result;
  } catch (error) {
    console.error("Error generating mock reviews:", error);
    throw error;
  }
}

// Run the script if executed directly
if (require.main === module) {
  runGenerateMockReviews();
}
