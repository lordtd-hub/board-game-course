import { appConfig } from "@/lib/config";
import { getSheetsClient } from "@/lib/google";
import { SHEET_SCHEMAS, SheetName } from "@/lib/sheet-schema";

type Row = Record<string, string>;

type RowCacheEntry = { rows: Row[]; expiresAt: number };
type PendingAppend = { row: Row; resolve: () => void; reject: (error: unknown) => void };
type AppendQueue = { pending: PendingAppend[]; timer?: ReturnType<typeof setTimeout> };

const globalForSheets = globalThis as typeof globalThis & {
  __sheetRowsCache?: Map<SheetName, RowCacheEntry>;
  __sheetRowsInflight?: Map<string, Promise<void>>;
  __sheetAppendQueues?: Map<SheetName, AppendQueue>;
  __sheetNumericIds?: Map<SheetName, number>;
};

const rowCache = globalForSheets.__sheetRowsCache || new Map<SheetName, RowCacheEntry>();
const rowInflight = globalForSheets.__sheetRowsInflight || new Map<string, Promise<void>>();
const appendQueues = globalForSheets.__sheetAppendQueues || new Map<SheetName, AppendQueue>();
const sheetNumericIds = globalForSheets.__sheetNumericIds || new Map<SheetName, number>();
globalForSheets.__sheetRowsCache = rowCache;
globalForSheets.__sheetRowsInflight = rowInflight;
globalForSheets.__sheetAppendQueues = appendQueues;
globalForSheets.__sheetNumericIds = sheetNumericIds;

const CACHE_TTL_MS: Partial<Record<SheetName, number>> = {
  sections: 60_000,
  exam_config: 1_000,
  exam_results: 1_500,
  exam_events: 1_500
};

function cacheTtl(sheetName: SheetName) {
  return CACHE_TTL_MS[sheetName] || 5_000;
}

function rowsFromValues(values: unknown[][] | undefined): Row[] {
  const [headers = [], ...rows] = values || [];
  if (!headers.length) return [];
  return rows
    .filter((row) => row.some((value) => String(value || "").trim()))
    .map((row) => Object.fromEntries(headers.map((header, index) => [String(header), String(row[index] || "")]))) as Row[];
}

function isQuotaError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { status?: number; code?: number; response?: { status?: number } };
  return candidate.status === 429 || candidate.code === 429 || candidate.response?.status === 429;
}

function isNonRetryableClientError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { status?: number; code?: number; response?: { status?: number } };
  const status = candidate.status || candidate.code || candidate.response?.status || 0;
  return status >= 400 && status < 500 && status !== 429;
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (isNonRetryableClientError(error)) break;
      if (i + 1 >= attempts) break;
      const delay = isQuotaError(error) ? 21_000 * (i + 1) : 300 * (i + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

function sheetId() {
  if (!appConfig.googleSheetId) throw new Error("Missing GOOGLE_SHEET_ID.");
  return appConfig.googleSheetId;
}

export async function getRows<T extends Row>(sheetName: SheetName): Promise<T[]> {
  await primeSheetRows([sheetName]);
  return (rowCache.get(sheetName)?.rows || []) as T[];
}

export async function getRowsFresh<T extends Row>(sheetName: SheetName): Promise<T[]> {
  rowCache.delete(sheetName);
  await primeSheetRows([sheetName]);
  return (rowCache.get(sheetName)?.rows || []) as T[];
}

async function numericSheetId(sheetName: SheetName) {
  const cached = sheetNumericIds.get(sheetName);
  if (cached !== undefined) return cached;
  const sheets = getSheetsClient();
  const result = await withRetry(() => sheets.spreadsheets.get({
    spreadsheetId: sheetId(),
    fields: "sheets.properties(sheetId,title)"
  }));
  for (const sheet of result.data.sheets || []) {
    const title = sheet.properties?.title as SheetName | undefined;
    const id = sheet.properties?.sheetId;
    if (title && typeof id === "number") sheetNumericIds.set(title, id);
  }
  const resolved = sheetNumericIds.get(sheetName);
  if (resolved === undefined) throw new Error(`Sheet not found: ${sheetName}`);
  return resolved;
}

function duplicateNamedRange(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { message?: string; response?: { data?: { error?: { message?: string } } } };
  const message = `${candidate.message || ""} ${candidate.response?.data?.error?.message || ""}`;
  return /named range with that name already exists/i.test(message);
}

function rowCell(header: string, value: string) {
  if (["score", "maxScore", "leaveCount", "eventCount"].includes(header) && value !== "" && Number.isFinite(Number(value))) {
    return { userEnteredValue: { numberValue: Number(value) } };
  }
  return { userEnteredValue: { stringValue: value } };
}

export async function appendRowWithLock(sheetName: SheetName, row: Row, lockName: string) {
  if (!/^[A-Z][A-Z0-9_]{1,249}$/.test(lockName)) throw new Error("Invalid sheet lock name.");
  const headers = [...SHEET_SCHEMAS[sheetName]];
  const values = headers.map((header) => rowCell(header, row[header] || ""));
  const targetSheetId = await numericSheetId(sheetName);
  // Insert and write a concrete row in the same batch as the idempotency claim.
  // appendCells is not safe here: concurrent batchUpdate calls can all resolve the
  // append position from the same grid state and report success while overwriting
  // one another. Inserting at the same logical end index is serialized by Sheets;
  // each later insert pushes the previous row down before writing its own row.
  const dataRowIndex = (await getRowsFresh<Row>(sheetName)).length + 1;
  const sheets = getSheetsClient();
  try {
    await withRetry(() => sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId(),
      requestBody: {
        requests: [
          {
            addNamedRange: {
              namedRange: {
                name: lockName,
                range: {
                  sheetId: targetSheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: 1
                }
              }
            }
          },
          {
            insertDimension: {
              range: {
                sheetId: targetSheetId,
                dimension: "ROWS",
                startIndex: dataRowIndex,
                endIndex: dataRowIndex + 1
              },
              inheritFromBefore: true
            }
          },
          {
            updateCells: {
              range: {
                sheetId: targetSheetId,
                startRowIndex: dataRowIndex,
                endRowIndex: dataRowIndex + 1,
                startColumnIndex: 0,
                endColumnIndex: headers.length
              },
              rows: [{ values }],
              fields: "userEnteredValue"
            }
          }
        ]
      }
    }));
    // Another instance may have inserted at the same index immediately before
    // this request. Discard the local ordering cache rather than guessing it.
    rowCache.delete(sheetName);
    return true;
  } catch (error) {
    if (duplicateNamedRange(error)) return false;
    throw error;
  }
}

export async function primeSheetRows(sheetNames: SheetName[]) {
  const now = Date.now();
  const missing = [...new Set(sheetNames)].filter((name) => (rowCache.get(name)?.expiresAt || 0) <= now);
  if (!missing.length) return;

  const inflightKey = missing.slice().sort().join(",");
  const existing = rowInflight.get(inflightKey);
  if (existing) return existing;

  const load = (async () => {
    const sheets = getSheetsClient();
    const result = await withRetry(() => sheets.spreadsheets.values.batchGet({
      spreadsheetId: sheetId(),
      ranges: missing.map((name) => `${name}!A:Z`)
    }));
    const loadedAt = Date.now();
    missing.forEach((name, index) => {
      rowCache.set(name, {
        rows: rowsFromValues(result.data.valueRanges?.[index]?.values as unknown[][] | undefined),
        expiresAt: loadedAt + cacheTtl(name)
      });
    });
  })();

  rowInflight.set(inflightKey, load);
  try {
    await load;
  } finally {
    rowInflight.delete(inflightKey);
  }
}

async function appendRows(sheetName: SheetName, rows: Row[]) {
  const headers = [...SHEET_SCHEMAS[sheetName]];
  const values = rows.map((row) => headers.map((header) => row[header] || ""));
  const sheets = getSheetsClient();
  await withRetry(() =>
    sheets.spreadsheets.values.append({
      spreadsheetId: sheetId(),
      range: `${sheetName}!A:Z`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values }
    })
  );
  const cached = rowCache.get(sheetName);
  if (cached && cached.expiresAt > Date.now()) {
    cached.rows.push(...rows.map((row) => ({ ...row })));
    cached.expiresAt = Date.now() + cacheTtl(sheetName);
  } else {
    rowCache.delete(sheetName);
  }
}

async function flushAppendQueue(sheetName: SheetName) {
  const queue = appendQueues.get(sheetName);
  if (!queue?.pending.length) return;
  appendQueues.delete(sheetName);
  const batch = queue.pending;
  try {
    await appendRows(sheetName, batch.map((item) => item.row));
    batch.forEach((item) => item.resolve());
  } catch (error) {
    batch.forEach((item) => item.reject(error));
  }
}

export async function appendRow(sheetName: SheetName, row: Row) {
  if (sheetName !== "exam_results" && sheetName !== "exam_events") {
    await appendRows(sheetName, [row]);
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const queue = appendQueues.get(sheetName) || { pending: [] };
    queue.pending.push({ row, resolve, reject });
    if (!queue.timer) {
      queue.timer = setTimeout(() => void flushAppendQueue(sheetName), 75);
    }
    appendQueues.set(sheetName, queue);
  });
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
  const cached = rowCache.get(sheetName);
  if (cached) {
    cached.rows[rowIndex] = Object.fromEntries(headers.map((header, index) => [header, next[index]]));
    cached.expiresAt = Date.now() + cacheTtl(sheetName);
  }
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
