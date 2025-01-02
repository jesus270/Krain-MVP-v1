"use server";

import { NextRequest } from "next/server";
import { handleAuthCallback } from "@krain/session";

export async function POST(request: NextRequest) {
  return handleAuthCallback(request);
}
