import "server-only";
import { EXAM_ID, EXAM_TOTAL, formCode, receiptFor } from "@/lib/exam/core.server";
import { appendExamEvent, appendExamResultOnce, listExamEvents, listExamResults, primeExamState } from "@/lib/exam/repository.server";
import type { ExamSession } from "@/lib/exam/types";
import { id, nowIso } from "@/lib/utils";

export async function examState(studentId: string) {
  await primeExamState();
  const [results, events] = await Promise.all([listExamResults(), listExamEvents()]);
  const result = results.find((row) => row.examId === EXAM_ID && row.studentId === studentId);
  const scopedEvents = events.filter((row) => row.examId === EXAM_ID && row.studentId === studentId && row.event === "screen_hidden");
  const leaveCount = scopedEvents.reduce((max, row) => Math.max(max, Number(row.eventCount) || 0), 0);
  const disqualified = result?.status === "disqualified" || scopedEvents.some((row) => row.status === "disqualified") || leaveCount >= 2;
  return { result, leaveCount, disqualified };
}

export async function recordScreenHidden(session: ExamSession, clientCount: number, detail: string) {
  const state = await examState(session.studentId);
  if (state.result) return { leaveCount: Math.max(state.leaveCount, clientCount), status: state.result.status };
  const eventCount = Math.max(state.leaveCount + 1, Math.min(2, Math.max(1, clientCount)));
  const status = eventCount >= 2 ? "disqualified" : "warning";
  const occurredAt = nowIso();
  await appendExamEvent({
    id: id("exev"), examId: EXAM_ID, studentId: session.studentId, event: "screen_hidden",
    eventCount: String(eventCount), occurredAt, status, detail: detail.slice(0, 500)
  });
  if (status === "disqualified") {
    const receipt = receiptFor(session.studentId, occurredAt);
    const result = await appendExamResultOnce({
      id: id("exr"), examId: EXAM_ID, studentId: session.studentId, studentName: session.studentName,
      sectionId: session.sectionId, formCode: formCode(session.seed), answers: "[]", score: "0",
      maxScore: String(EXAM_TOTAL), startedAt: session.startedAt, submittedAt: occurredAt,
      leaveCount: String(eventCount), status: "disqualified", receipt
    });
    return { leaveCount: Number(result.leaveCount) || eventCount, status: result.status, receipt: result.receipt };
  }
  return { leaveCount: eventCount, status };
}
