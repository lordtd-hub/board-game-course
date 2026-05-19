import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode, verifyGoogleIdToken } from "@/lib/oauth";
import { upsertUserFromLogin } from "@/lib/repository";
import { setSessionUser, validateOAuthState } from "@/lib/session";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !(await validateOAuthState(state))) {
    return NextResponse.redirect(new URL("/?error=oauth_state", request.url));
  }

  try {
    const token = await exchangeGoogleCode(code);
    const profile = await verifyGoogleIdToken(token.id_token);
    const user = await upsertUserFromLogin(profile);
    await setSessionUser({ email: user.email, name: user.name, role: user.role, status: user.status });
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "login_failed";
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(message)}`, request.url));
  }
}
