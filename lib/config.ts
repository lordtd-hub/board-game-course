export const appConfig = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  authSecret: process.env.AUTH_SECRET || "dev-secret-change-before-deploy",
  allowedEmailDomains: (process.env.ALLOWED_EMAIL_DOMAINS || "sru.ac.th")
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean),
  bootstrapSuperAdminEmail: (process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL || "sittichoke.son@sru.ac.th").toLowerCase(),
  googleOAuthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
  googleOAuthClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || "",
  googleSheetId: process.env.GOOGLE_SHEET_ID || "",
  googleDriveRootFolderId: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || "",
  googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "",
  googlePrivateKey: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n")
};

export function isAllowedEmail(email: string) {
  const domain = email.toLowerCase().split("@")[1] || "";
  return appConfig.allowedEmailDomains.includes(domain);
}

export function requireEnv(name: keyof typeof appConfig) {
  const value = appConfig[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
