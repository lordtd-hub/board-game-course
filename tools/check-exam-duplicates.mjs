import { loadEnvConfig } from "@next/env";
import { google } from "googleapis";

loadEnvConfig(process.cwd());

const sheetId = process.env.GOOGLE_SHEET_ID || "";
const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "";
const privateKey = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
if (!sheetId || !clientEmail || !privateKey) {
  throw new Error("Missing Google Sheet credentials. Pull the intended Vercel environment before running this check.");
}

const auth = new google.auth.GoogleAuth({
  credentials: { client_email: clientEmail, private_key: privateKey },
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
});
const sheets = google.sheets({ version: "v4", auth });
const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "exam_results!A:Z" });
const [headers = [], ...values] = response.data.values || [];
const examIdIndex = headers.indexOf("examId");
const studentIdIndex = headers.indexOf("studentId");
if (examIdIndex < 0 || studentIdIndex < 0) throw new Error("exam_results headers are incomplete.");

const counts = new Map();
for (const row of values) {
  const examId = String(row[examIdIndex] || "").trim();
  const studentId = String(row[studentIdIndex] || "").trim();
  if (!examId || !studentId) continue;
  const key = `${examId}:${studentId}`;
  counts.set(key, (counts.get(key) || 0) + 1);
}
const duplicates = [...counts].filter(([, count]) => count > 1);
console.log(`Checked ${values.length} physical result rows; found ${duplicates.length} duplicate exam/student key(s).`);
for (const [key, count] of duplicates) console.log(`${key} -> ${count} rows`);
if (duplicates.length) process.exitCode = 1;
