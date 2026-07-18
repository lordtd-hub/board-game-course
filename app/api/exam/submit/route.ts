import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  decodeExamSession, EXAM_COOKIE, EXAM_ID, EXAM_TOTAL, formCode, gradeExam, receiptFor
} from "@/lib/exam/core.server";
import { examState } from "@/lib/exam/actions.server";
import { appendExamResult } from "@/lib/exam/repository.server";
import { id, nowIso } from "@/lib/utils";

const SubmitSchema = z.object({
  answers: z.array(z.enum(["", "A", "B", "C", "D"])).length(EXAM_TOTAL),
  leaveCount: z.number().int().min(0).max(2)
});

export async function POST(request: Request) {
  const store = await cookies();
  const session = decodeExamSession(store.get(EXAM_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Session หมดอายุ" }, { status: 401 });
  const parsed = SubmitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "รูปแบบคำตอบไม่ถูกต้อง" }, { status: 400 });
  const state = await examState(session.studentId);
  if (state.disqualified) return NextResponse.json({ error: "การสอบถูกตัดสิทธิ์", status: "disqualified" }, { status: 423 });
  if (state.result) return NextResponse.json({ status: state.result.status, receipt: state.result.receipt });

  const submittedAt = nowIso();
  const score = gradeExam(session.seed, parsed.data.answers);
  const receipt = receiptFor(session.studentId, submittedAt);
  await appendExamResult({
    id: id("exr"), examId: EXAM_ID, studentId: session.studentId, studentName: session.studentName,
    sectionId: session.sectionId, formCode: formCode(session.seed), answers: JSON.stringify(parsed.data.answers),
    score: String(score), maxScore: String(EXAM_TOTAL), startedAt: session.startedAt, submittedAt,
    leaveCount: String(Math.max(state.leaveCount, parsed.data.leaveCount)), status: "submitted", receipt
  });
  store.delete(EXAM_COOKIE);
  return NextResponse.json({ status: "submitted", receipt });
}
