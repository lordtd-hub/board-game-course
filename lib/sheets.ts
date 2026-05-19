import { appConfig } from "@/lib/config";
import { getSheetsClient } from "@/lib/google";
import { SHEET_SCHEMAS, SheetName } from "@/lib/sheet-schema";

type Row = Record<string, string>;

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 300 * (i + 1)));
    }
  }
  throw lastError;
}

function sheetId() {
  if (!appConfig.googleSheetId) throw new Error("Missing GOOGLE_SHEET_ID.");
  return appConfig.googleSheetId;
}

export async function getRows<T extends Row>(sheetName: SheetName): Promise<T[]> {
  const sheets = getSheetsClient();
  const result = await withRetry(() =>
    sheets.spreadsheets.values.get({
      spreadsheetId: sheetId(),
      range: `${sheetName}!A:Z`
    })
  );

  const [headers = [], ...rows] = result.data.values || [];
  if (!headers.length) return [];

  return rows
    .filter((row) => row.some((value) => String(value || "").trim()))
    .map((row) =>
      Object.fromEntries(headers.map((header, index) => [String(header), String(row[index] || "")]))
    ) as T[];
}

export async function appendRow(sheetName: SheetName, row: Row) {
  const headers = [...SHEET_SCHEMAS[sheetName]];
  const values = headers.map((header) => row[header] || "");
  const sheets = getSheetsClient();
  await withRetry(() =>
    sheets.spreadsheets.values.append({
      spreadsheetId: sheetId(),
      range: `${sheetName}!A:Z`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [values] }
    })
  );
}

export async function updateRowById(sheetName: SheetName, id: string, updates: Row) {
  const rows = await getRows(sheetName);
  const rowIndex = rows.findIndex((row) => row.id === id);
  if (rowIndex < 0) throw new Error(`${sheetName} row not found: ${id}`);

  const headers = [...SHEET_SCHEMAS[sheetName]];
  const current = rows[rowIndex];
  const next = headers.map((header) => updates[header] ?? current[header] ?? "");
  const sheetRowNumber = rowIndex + 2;
  const sheets = getSheetsClient();

  await withRetry(() =>
    sheets.spreadsheets.values.update({
      spreadsheetId: sheetId(),
      range: `${sheetName}!A${sheetRowNumber}:Z${sheetRowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [next] }
    })
  );
}

export async function ensureSheetSchema() {
  const sheets = getSheetsClient();
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId() });
  const existing = new Set((spreadsheet.data.sheets || []).map((sheet) => sheet.properties?.title).filter(Boolean));

  const addSheetRequests = Object.keys(SHEET_SCHEMAS)
    .filter((name) => !existing.has(name))
    .map((title) => ({ addSheet: { properties: { title } } }));

  if (addSheetRequests.length) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId(),
      requestBody: { requests: addSheetRequests }
    });
  }

  await Promise.all(
    Object.entries(SHEET_SCHEMAS).map(([name, headers]) =>
      sheets.spreadsheets.values.update({
        spreadsheetId: sheetId(),
        range: `${name}!A1:Z1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[...headers]] }
      })
    )
  );
}
