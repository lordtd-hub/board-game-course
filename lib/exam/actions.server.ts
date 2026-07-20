import "server-only";
import { EXAM_ID, EXAM_TOTAL, formCode, receiptFor, resultIdFor } from "@/lib/exam/core.server";
import {
  appendExamEventOnce,
  appendExamResultOnce,
  disqualifyExamResult,
  listExamEvents,
  listExamResults,
  noteExamStateRead,
  primeExamState
} from "@/lib/exam/repository.server";
import type { ExamSession } from "@/lib/exam/types";
import { nowIso } from "@/lib/utils";

export async function examState(studentId: string) {
  noteExamStateRead();
  await primeExamState();
  const [results, events] = await Promise.all([listExamResults(), listExamEvents()]);
  const result = results.find((row) => row.examId === EXAM_ID && row.studentId === studentId);
  const scopedEvents = events.filter((row) => row.examId === EXAM_ID && row.studentId === studentId && row.event === "screen_hidden");
  const leaveCount = scopedEvents.reduce((max, row) => Math.max(max, Number(row.eventCount) || 0), 0);
  const disqualified = result?.status === "disqualified" || scopedEvents.some((row) => row.status === "disqualified") || leaveCount >= 2;
  return { result, scopedEvents, leaveCount, disqualified };
}

export async function recordScreenHidden(session: ExamSession, eventId: string, clientCount: number, detail: string) {
  const state = await examState(session.studentId);
  const duplicate = state.scopedEvents.find((event) => event.id === eventId);
  if (duplicate) {
    return {
      leaveCount: Math.max(state.leaveCount, Number(duplicate.eventCount) || 0),
      status: state.disqualified ? "disqualified" : state.result?.status || duplicate.status,
      receipt: state.result?.receipt
    };
  }
  if (state.result?.status === "disqualified") {
    return { leaveCount: Math.max(2, state.leaveCount, clientCount), status: "disqualified", receipt: state.result.receipt };
  }
  const eventCount = Math.max(state.leaveCount + 1, Math.min(2, Math.max(1, clientCount)));
  const status = eventCount >= 2 ? "disqualified" : "warning";
  const occurredAt = nowIso();
  await appendExamEventOnce({
    id: eventId, examId: EXAM_ID, studentId: session.studentId, event: "screen_hidden",
    eventCount: String(eventCount), occurredAt, status, detail: detail.slice(0, 500)
  });
  if (status === "disqualified") {
    const receipt = receiptFor(session.studentId, session.startedAt);
    const result = state.result
      ? await disqualifyExamResult(state.result, eventCount)
      : await appendExamResultOnce({
        id: resultIdFor(session.studentId), examId: EXAM_ID, studentId: session.studentId, studentName: session.studentName,
        sectionId: session.sectionId, formCode: formCode(session.seed), answers: "[]", score: "0",
        maxScore: String(EXAM_TOTAL), startedAt: session.startedAt, submittedAt: occurredAt,
        leaveCount: String(eventCount), status: "disqualified", receipt
      });
    return { leaveCount: Number(result.leaveCount) || eventCount, status: result.status, receipt: result.receipt };
  }
  return { leaveCount: eventCount, status: state.result?.status || status, receipt: state.result?.receipt };
}
