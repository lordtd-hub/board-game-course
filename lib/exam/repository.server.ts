import "server-only";
import { appConfig } from "@/lib/config";
import { listSections } from "@/lib/repository";
import { appendRow, getRows, primeSheetRows, updateRowById } from "@/lib/sheets";
import type { ExamConfigRow, ExamEventRow, ExamResultRow } from "@/lib/exam/types";

const EXAM_CONFIG_ID = "sma2106-week1-2-v1-config";

const globalForExam = globalThis as typeof globalThis & {
  __sma2106ExamDevelopmentStore?: { results: ExamResultRow[]; events: ExamEventRow[]; config: ExamConfigRow | null };
  __sma2106ExamResultWrites?: Map<string, Promise<ExamResultRow>>;
};
const developmentStore = globalForExam.__sma2106ExamDevelopmentStore || { results: [], events: [], config: null };
const resultWrites = globalForExam.__sma2106ExamResultWrites || new Map<string, Promise<ExamResultRow>>();
globalForExam.__sma2106ExamDevelopmentStore = developmentStore;
globalForExam.__sma2106ExamResultWrites = resultWrites;

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
  if (appConfig.googleSheetId) {
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
  if (!appConfig.googleSheetId) return dedupeExamResults([...developmentStore.results]);
  return dedupeExamResults(await getRows<ExamResultRow>("exam_results"));
}

export async function listExamEvents() {
  if (!appConfig.googleSheetId) return [...developmentStore.events];
  return getRows<ExamEventRow>("exam_events");
}

export async function primeExamState() {
  if (appConfig.googleSheetId) await primeSheetRows(["exam_results", "exam_events"]);
}

export async function primeExamAdmission() {
  if (appConfig.googleSheetId) {
    await primeSheetRows(["exam_config", "sections", "exam_results", "exam_events"]);
  }
}

export async function appendExamResultOnce(row: ExamResultRow) {
  if (!appConfig.googleSheetId) {
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

export async function appendExamEvent(row: ExamEventRow) {
  if (!appConfig.googleSheetId) {
    if (process.env.NODE_ENV === "production") throw new Error("GOOGLE_SHEET_ID is required for exam events.");
    developmentStore.events.push(row);
    return;
  }
  await appendRow("exam_events", row);
}

export async function getExamConfig(examId: string) {
  if (!appConfig.googleSheetId) return developmentStore.config?.examId === examId ? developmentStore.config : null;
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
  if (!appConfig.googleSheetId) {
    if (process.env.NODE_ENV === "production") throw new Error("GOOGLE_SHEET_ID is required for exam control.");
    developmentStore.config = row;
    return row;
  }
  const existing = await getExamConfig(config.examId);
  if (existing) await updateRowById("exam_config", EXAM_CONFIG_ID, row);
  else await appendRow("exam_config", row);
  return row;
}
