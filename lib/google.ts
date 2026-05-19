import { google } from "googleapis";
import { appConfig } from "@/lib/config";

let authClient: InstanceType<typeof google.auth.JWT> | null = null;

function getAuthClient() {
  if (!authClient) {
    if (!appConfig.googleServiceAccountEmail || !appConfig.googlePrivateKey) {
      throw new Error("Google service account is not configured. Fill GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY.");
    }

    authClient = new google.auth.JWT({
      email: appConfig.googleServiceAccountEmail,
      key: appConfig.googlePrivateKey,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file"
      ]
    });
  }

  return authClient;
}

export function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getAuthClient() });
}

export function getDriveClient() {
  return google.drive({ version: "v3", auth: getAuthClient() });
}
