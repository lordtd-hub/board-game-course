import { appConfig, isAllowedEmail } from "@/lib/config";

type GoogleTokenResponse = {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

type GoogleProfile = {
  email: string;
  email_verified: string | boolean;
  name?: string;
  picture?: string;
};

export function googleRedirectUri() {
  return `${appConfig.appUrl}/api/auth/callback/google`;
}

export function googleAuthUrl(state: string) {
  if (!appConfig.googleOAuthClientId) throw new Error("Missing GOOGLE_OAUTH_CLIENT_ID.");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", appConfig.googleOAuthClientId);
  url.searchParams.set("redirect_uri", googleRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export async function exchangeGoogleCode(code: string) {
  if (!appConfig.googleOAuthClientSecret) throw new Error("Missing GOOGLE_OAUTH_CLIENT_SECRET.");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: appConfig.googleOAuthClientId,
      client_secret: appConfig.googleOAuthClientSecret,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code"
    })
  });

  if (!response.ok) throw new Error("Google OAuth token exchange failed.");
  return (await response.json()) as GoogleTokenResponse;
}

export async function verifyGoogleIdToken(idToken: string) {
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, {
    cache: "no-store"
  });
  if (!response.ok) throw new Error("Google ID token verification failed.");

  const profile = (await response.json()) as GoogleProfile;
  const verified = profile.email_verified === true || profile.email_verified === "true";
  if (!verified) throw new Error("Google account email is not verified.");
  if (!isAllowedEmail(profile.email)) throw new Error("This email domain is not allowed for this course system.");

  return {
    email: profile.email.toLowerCase(),
    name: profile.name || profile.email
  };
}
