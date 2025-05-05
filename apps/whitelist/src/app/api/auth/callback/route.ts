"use server";

import { NextRequest, NextResponse } from "next/server";
import { handleAuthCallback } from "@krain/session/server";

export async function POST() {
  return NextResponse.json({ error: "API disabled" }, { status: 403 });
}
