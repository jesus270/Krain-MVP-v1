import { NextResponse } from "next/server";
import { generateMockReviews } from "../../actions/reviews";

export async function GET() {
  try {
    const result = await generateMockReviews();
    return NextResponse.json({
      success: true,
      message: "Mock reviews generated successfully",
      result,
    });
  } catch (error) {
    console.error("Error generating mock reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate mock reviews" },
      { status: 500 },
    );
  }
}
