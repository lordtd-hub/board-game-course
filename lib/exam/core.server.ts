import "server-only";
import crypto from "node:crypto";
import { appConfig } from "@/lib/config";
import type { AssembledQuestion, ExamQuestion, ExamSession } from "@/lib/exam/types";
import { EXAM_QUESTION_BANK } from "@/lib/exam/question-bank.server";

export const EXAM_ID = "sma2106-week1-2-v1";
export const EXAM_DURATION_MS = 60 * 60 * 1000;
export const EXAM_COOKIE = "sma2106_exam_attempt";
export const EXAM_TOTAL = 24;

function hmac(value: string) {
  return crypto.createHmac("sha256", appConfig.examSecret).update(value).digest("base64url");
}

export function hashRoomCode(value: string) {
  return crypto.createHash("sha256").update(value.trim()).digest("hex");
}

export function roomCodeIsValid(value: string, configuredHash = appConfig.examRoomCodeHash) {
  if (!configuredHash) return process.env.NODE_ENV !== "production" && value === "246810";
  const actual = Buffer.from(hashRoomCode(value));
  const expected = Buffer.from(configuredHash.toLowerCase());
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export function examConfigurationReady() {
  if (process.env.NODE_ENV !== "production") return true;
  return Boolean(process.env.EXAM_SECRET && appConfig.googleSheetId);
}

export function examWindowStatus(now = Date.now()) {
  if (!examConfigurationReady()) return { open: false, openAt: Number.NaN, closeAt: Number.NaN };
  const openAt = appConfig.examOpenAt ? Date.parse(appConfig.examOpenAt) : Number.NEGATIVE_INFINITY;
  const closeAt = appConfig.examCloseAt ? Date.parse(appConfig.examCloseAt) : Number.POSITIVE_INFINITY;
  return { open: now >= openAt && now <= closeAt, openAt, closeAt };
}

export function normalizeStudentId(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function formSeed(studentId: string) {
  return hmac(`${EXAM_ID}:${normalizeStudentId(studentId)}`);
}

export function formCode(seed: string) {
  return seed.slice(0, 8).toUpperCase();
}

export function encodeExamSession(session: ExamSession) {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  return `${payload}.${hmac(payload)}`;
}

export function decodeExamSession(value: string | undefined): ExamSession | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const actual = Buffer.from(hmac(payload));
  const expected = Buffer.from(signature);
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as ExamSession;
    if (session.examId !== EXAM_ID || Date.parse(session.expiresAt) <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

function seededNumber(seed: string, key: string) {
  const hex = crypto.createHmac("sha256", seed).update(key).digest("hex").slice(0, 12);
  return Number.parseInt(hex, 16) / 0xffffffffffff;
}

function shuffle<T>(values: T[], seed: string, key: string) {
  const next = [...values];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(seededNumber(seed, `${key}:${index}`) * (index + 1));
    [next[index], next[swap]] = [next[swap], next[index]];
  }
  return next;
}

export function assembleExam(seed: string): AssembledQuestion[] {
  const grouped = new Map<string, ExamQuestion[]>();
  for (const question of EXAM_QUESTION_BANK) {
    grouped.set(question.slot, [...(grouped.get(question.slot) || []), question]);
  }
  const slots = [...grouped.keys()].sort();
  const selected = slots.map((slot) => {
    const variants = grouped.get(slot) || [];
    const variant = variants[Math.floor(seededNumber(seed, `variant:${slot}`) * variants.length)];
    if (!variant) throw new Error(`Missing question variant for ${slot}`);
    const indexed = variant.choices.map((choice, index) => ({ choice, original: index }));
    const shuffled = shuffle(indexed, seed, `choices:${variant.id}`);
    return {
      ...variant,
      choices: shuffled.map((item) => item.choice) as [string, string, string, string],
      answer: shuffled.findIndex((item) => item.original === variant.answer) as 0 | 1 | 2 | 3
    };
  });
  return shuffle(selected, seed, "question-order");
}

export function gradeExam(seed: string, answers: string[]) {
  const questions = assembleExam(seed);
  const letters = ["A", "B", "C", "D"];
  return questions.reduce((score, question, index) => score + (answers[index] === letters[question.answer] ? 1 : 0), 0);
}

export function receiptFor(studentId: string, submittedAt: string) {
  return `SMA-${hmac(`${EXAM_ID}:${studentId}:${submittedAt}`).slice(0, 10).toUpperCase()}`;
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char] || char);
}

function wrapThai(value: string, max = 50) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (word.length > max) {
      if (current) lines.push(current);
      for (let index = 0; index < word.length; index += max) lines.push(word.slice(index, index + max));
      current = "";
    } else if (!current || `${current} ${word}`.length <= max) {
      current = current ? `${current} ${word}` : word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function renderQuestionSvg(question: AssembledQuestion, displayIndex: number, studentId: string, form: string) {
  const promptLines = wrapThai(question.prompt, 54);
  const choiceLines = question.choices.map((choice) => wrapThai(choice, 48));
  const promptHeight = promptLines.length * 34;
  const choiceHeights = choiceLines.map((lines) => Math.max(68, lines.length * 27 + 28));
  const height = 150 + promptHeight + choiceHeights.reduce((sum, item) => sum + item + 14, 0) + 70;
  let y = 112;
  const prompt = promptLines.map((line) => `<text x="48" y="${y += 34}" class="prompt">${escapeXml(line)}</text>`).join("");
  y += 28;
  const letters = ["A", "B", "C", "D"];
  const choices = choiceLines.map((lines, index) => {
    const boxY = y;
    const boxHeight = choiceHeights[index];
    const text = lines.map((line, lineIndex) => `<text x="112" y="${boxY + 39 + lineIndex * 27}" class="choice">${escapeXml(line)}</text>`).join("");
    y += boxHeight + 14;
    return `<rect x="44" y="${boxY}" width="872" height="${boxHeight}" rx="15" class="choiceBox"/><circle cx="78" cy="${boxY + 35}" r="20" class="letterCircle"/><text x="78" y="${boxY + 42}" text-anchor="middle" class="letter">${letters[index]}</text>${text}`;
  }).join("");
  const watermark = Array.from({ length: 5 }, (_, index) => `<text x="${100 + index * 175}" y="${230 + index * 120}" transform="rotate(-25 ${100 + index * 175} ${230 + index * 120})" class="watermark">${escapeXml(studentId)} · ${escapeXml(form)}</text>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="${height}" viewBox="0 0 960 ${height}">
    <style>.bg{fill:#fffaf0}.bar{fill:#0f6f72}.kicker{font:700 18px Arial,'Noto Sans Thai',sans-serif;fill:#dffafa}.prompt{font:700 25px Arial,'Noto Sans Thai',sans-serif;fill:#211f1b}.choice{font:500 21px Arial,'Noto Sans Thai',sans-serif;fill:#2d2923}.choiceBox{fill:#fff;stroke:#ddcda9;stroke-width:2}.letterCircle{fill:#159a9c}.letter{font:700 18px Arial,sans-serif;fill:#fff}.watermark{font:700 15px Arial,sans-serif;fill:#9e7b50;opacity:.09}</style>
    <rect width="960" height="${height}" class="bg"/><rect width="960" height="78" class="bar"/>
    <text x="44" y="49" class="kicker">SMA2106 · ข้อ ${displayIndex + 1}/24 · ${escapeXml(studentId)} · ${escapeXml(form)}</text>
    ${watermark}${prompt}${choices}
  </svg>`;
}
