"use server";

import { NextRequest } from "next/server";
import { handleAuthCallback } from "@krain/session/server";

export async function POST(request: NextRequest) {
  return handleAuthCallback(request);
}
