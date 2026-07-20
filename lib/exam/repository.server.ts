import "server-only";
import { appConfig } from "@/lib/config";
import { listSections } from "@/lib/repository";
import { appendRow, getRows, primeSheetRows, updateRowById } from "@/lib/sheets";
import type { ExamConfigRow, ExamEventRow, ExamResultRow } from "@/lib/exam/types";

const EXAM_CONFIG_ID = "sma2106-week1-2-v1-config";

const globalForExam = globalThis as typeof globalThis & {
  __sma2106ExamDevelopmentStore?: {
    results: ExamResultRow[];
    events: ExamEventRow[];
    config: ExamConfigRow | null;
    stateReads: number;
  };
  __sma2106ExamResultWrites?: Map<string, Promise<ExamResultRow>>;
  __sma2106ExamEventWrites?: Map<string, Promise<ExamEventRow>>;
};
const developmentStore = globalForExam.__sma2106ExamDevelopmentStore || { results: [], events: [], config: null, stateReads: 0 };
const resultWrites = globalForExam.__sma2106ExamResultWrites || new Map<string, Promise<ExamResultRow>>();
const eventWrites = globalForExam.__sma2106ExamEventWrites || new Map<string, Promise<ExamEventRow>>();
if (!Number.isFinite(developmentStore.stateReads)) developmentStore.stateReads = 0;
globalForExam.__sma2106ExamDevelopmentStore = developmentStore;
globalForExam.__sma2106ExamResultWrites = resultWrites;
globalForExam.__sma2106ExamEventWrites = eventWrites;

export function examUsesMemoryStorage() {
  return process.env.NODE_ENV !== "production" && appConfig.examStorageMode === "memory";
}

function usesSheetStorage() {
  return Boolean(appConfig.googleSheetId) && !examUsesMemoryStorage();
}

export function noteExamStateRead() {
  if (examUsesMemoryStorage()) developmentStore.stateReads += 1;
}

export function getMemoryExamDiagnostics() {
  if (!examUsesMemoryStorage()) return undefined;
  const duplicateResultKeys = [...developmentStore.results.reduce((counts, row) => {
    const key = `${row.examId}:${row.studentId}`;
    counts.set(key, (counts.get(key) || 0) + 1);
    return counts;
  }, new Map<string, number>())].filter(([, count]) => count > 1).map(([key]) => key);
  return {
    resultCount: developmentStore.results.length,
    eventCount: developmentStore.events.length,
    stateReads: developmentStore.stateReads,
    duplicateResultKeys
  };
}

function dedupeExamResults(rows: ExamResultRow[]) {
  const unique = new Map<string, ExamResultRow>();
  for (const row of rows) {
    const key = `${row.examId}:${row.studentId}`;
    const existing = unique.get(key);
    if (!existing || row.status === "disqualified" && existing.status !== "disqualified" ||
      row.status === existing.status && row.submittedAt < existing.submittedAt) {
      unique.set(key, row);
    }
  }
  return [...unique.values()];
}

export async function listExamSections() {
  if (usesSheetStorage()) {
    const sections = await listSections();
    return sections
      .filter((section) => section.status === "active")
      .map((section) => ({ id: section.id, label: section.title || section.code }));
  }

  return appConfig.examSectionOptions.split(",").map((entry) => {
    const [id, ...labelParts] = entry.split(":");
    return { id: id.trim(), label: (labelParts.join(":") || id).trim() };
  }).filter((item) => item.id);
}

export async function listExamResults() {
  if (!usesSheetStorage()) return dedupeExamResults([...developmentStore.results]);
  return dedupeExamResults(await getRows<ExamResultRow>("exam_results"));
}

export async function listExamEvents() {
  if (!usesSheetStorage()) return [...developmentStore.events];
  return getRows<ExamEventRow>("exam_events");
}

export async function primeExamState() {
  if (usesSheetStorage()) await primeSheetRows(["exam_results", "exam_events"]);
}

export async function primeExamAdmission() {
  if (usesSheetStorage()) {
    await primeSheetRows(["exam_config", "sections", "exam_results", "exam_events"]);
  }
}

export async function appendExamResultOnce(row: ExamResultRow) {
  if (!usesSheetStorage()) {
    if (process.env.NODE_ENV === "production") throw new Error("Google Sheet storage is required in production.");
    const existing = developmentStore.results.find((item) => item.examId === row.examId && item.studentId === row.studentId);
    if (existing) return existing;
    developmentStore.results.push(row);
    return row;
  }

  const key = `${row.examId}:${row.studentId}`;
  const existing = (await listExamResults()).find((item) => item.examId === row.examId && item.studentId === row.studentId);
  if (existing) return existing;
  const pending = resultWrites.get(key);
  if (pending) return pending;

  const write = (async () => {
    // values.append is concurrency-safe for different students. The deterministic
    // row id and receipt make a rare cross-instance retry harmless and dedupable.
    await appendRow("exam_results", row);
    return row;
  })();
  resultWrites.set(key, write);
  try {
    return await write;
  } finally {
    if (resultWrites.get(key) === write) resultWrites.delete(key);
  }
}

export async function appendExamEventOnce(row: ExamEventRow) {
  if (!usesSheetStorage()) {
    if (process.env.NODE_ENV === "production") throw new Error("GOOGLE_SHEET_ID is required for exam events.");
    const existing = developmentStore.events.find((item) => item.id === row.id);
    if (existing) return existing;
    developmentStore.events.push(row);
    return row;
  }

  const existing = (await listExamEvents()).find((item) => item.id === row.id);
  if (existing) return existing;
  const pending = eventWrites.get(row.id);
  if (pending) return pending;
  const write = (async () => {
    await appendRow("exam_events", row);
    return row;
  })();
  eventWrites.set(row.id, write);
  try {
    return await write;
  } finally {
    if (eventWrites.get(row.id) === write) eventWrites.delete(row.id);
  }
}

export async function disqualifyExamResult(row: ExamResultRow, leaveCount: number) {
  const updated: ExamResultRow = {
    ...row,
    score: "0",
    leaveCount: String(Math.max(2, leaveCount)),
    status: "disqualified"
  };
  if (!usesSheetStorage()) {
    if (process.env.NODE_ENV === "production") throw new Error("Google Sheet storage is required in production.");
    const index = developmentStore.results.findIndex((item) => item.id === row.id);
    if (index >= 0) developmentStore.results[index] = updated;
    else developmentStore.results.push(updated);
    return updated;
  }
  await updateRowById("exam_results", row.id, updated);
  return updated;
}

export async function getExamConfig(examId: string) {
  if (!usesSheetStorage()) return developmentStore.config?.examId === examId ? developmentStore.config : null;
  const rows = await getRows<ExamConfigRow>("exam_config");
  return rows.find((row) => row.id === EXAM_CONFIG_ID && row.examId === examId) || null;
}

export async function saveExamConfig(config: {
  examId: string;
  roomCodeHash: string;
  openAt: string;
  closeAt: string;
  status: "open" | "closed";
  updatedBy: string;
  updatedAt: string;
}) {
  const row: ExamConfigRow = { id: EXAM_CONFIG_ID, ...config };
  if (!usesSheetStorage()) {
    if (process.env.NODE_ENV === "production") throw new Error("GOOGLE_SHEET_ID is required for exam control.");
    developmentStore.config = row;
    return row;
  }
  const existing = await getExamConfig(config.examId);
  if (existing) await updateRowById("exam_config", EXAM_CONFIG_ID, row);
  else await appendRow("exam_config", row);
  return row;
}
