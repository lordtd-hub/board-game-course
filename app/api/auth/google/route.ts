import { NextResponse } from "next/server";
import { googleAuthUrl } from "@/lib/oauth";
import { createOAuthState } from "@/lib/session";

export async function GET() {
  const state = await createOAuthState();
  return NextResponse.redirect(googleAuthUrl(state));
}
