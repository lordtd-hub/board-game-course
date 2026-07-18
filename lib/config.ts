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
  googlePrivateKey: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  examSecret: process.env.EXAM_SECRET || process.env.AUTH_SECRET || "dev-exam-secret-change-before-deploy",
  examControlPinHash: process.env.EXAM_CONTROL_PIN_HASH || "",
  examRoomCodeHash: process.env.EXAM_ROOM_CODE_HASH || "",
  examOpenAt: process.env.EXAM_OPEN_AT || "",
  examCloseAt: process.env.EXAM_CLOSE_AT || "",
  examSectionOptions: process.env.EXAM_SECTION_OPTIONS || "SEC-1:Section 1,SEC-2:Section 2,SEC-3:Section 3"
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
