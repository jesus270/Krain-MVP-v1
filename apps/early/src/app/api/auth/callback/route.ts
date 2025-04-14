"use server";

import { NextRequest } from "next/server";
// import { handleAuthCallback } from "@krain/session"; // Removed incorrect import
import { handleAuthCallback } from "@krain/session/server"; // Correct import path

export async function POST(request: NextRequest) {
  return handleAuthCallback(request);
}
