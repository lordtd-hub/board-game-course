import "server-only";
import { appConfig } from "@/lib/config";
import { listSections } from "@/lib/repository";
import { appendRow, getRows, primeSheetRows, updateRowById } from "@/lib/sheets";
import type { ExamConfigRow, ExamEventRow, ExamResultRow } from "@/lib/exam/types";

const EXAM_CONFIG_ID = "sma2106-week1-2-v1-config";

const globalForExam = globalThis as typeof globalThis & {
  __sma2106ExamDevelopmentStore?: { results: ExamResultRow[]; events: ExamEventRow[]; config: ExamConfigRow | null };
};
const developmentStore = globalForExam.__sma2106ExamDevelopmentStore || { results: [], events: [], config: null };
globalForExam.__sma2106ExamDevelopmentStore = developmentStore;

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
  if (!appConfig.googleSheetId) return [...developmentStore.results];
  return getRows<ExamResultRow>("exam_results");
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

export async function appendExamResult(row: ExamResultRow) {
  if (!appConfig.googleSheetId) {
    if (process.env.NODE_ENV === "production") throw new Error("GOOGLE_SHEET_ID is required for exam results.");
    developmentStore.results.push(row);
    return;
  }
  await appendRow("exam_results", row);
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
