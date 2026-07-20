import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  decodeExamSession, EXAM_COOKIE, EXAM_ID, EXAM_TOTAL, formCode, gradeExam, receiptFor, resultIdFor
} from "@/lib/exam/core.server";
import { examState } from "@/lib/exam/actions.server";
import { appendExamResultOnce } from "@/lib/exam/repository.server";
import { nowIso } from "@/lib/utils";

const SubmitSchema = z.object({
  answers: z.array(z.enum(["", "A", "B", "C", "D"])).length(EXAM_TOTAL),
  leaveCount: z.number().int().min(0).max(2)
});

export async function POST(request: Request) {
  const store = await cookies();
  const session = decodeExamSession(store.get(EXAM_COOKIE)?.value, { allowExpiredMs: 5 * 60 * 1000 });
  if (!session) return NextResponse.json({ error: "Session หมดอายุ" }, { status: 401 });
  const parsed = SubmitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "รูปแบบคำตอบไม่ถูกต้อง" }, { status: 400 });
  const state = await examState(session.studentId).catch(() => null);
  if (!state) return NextResponse.json(
    { error: "ตรวจสถานะการสอบจาก Google Sheet ไม่สำเร็จ กรุณาลองส่งอีกครั้ง" },
    { status: 503, headers: { "Retry-After": "2" } }
  );
  if (state.disqualified) return NextResponse.json({ error: "การสอบถูกตัดสิทธิ์", status: "disqualified" }, { status: 423 });
  if (state.result) return NextResponse.json({ status: state.result.status, receipt: state.result.receipt });

  const submittedAt = nowIso();
  const score = gradeExam(session.seed, parsed.data.answers);
  const receipt = receiptFor(session.studentId, session.startedAt);
  let result;
  try {
    result = await appendExamResultOnce({
      id: resultIdFor(session.studentId), examId: EXAM_ID, studentId: session.studentId, studentName: session.studentName,
      sectionId: session.sectionId, formCode: formCode(session.seed), answers: JSON.stringify(parsed.data.answers),
      score: String(score), maxScore: String(EXAM_TOTAL), startedAt: session.startedAt, submittedAt,
      leaveCount: String(Math.max(state.leaveCount, parsed.data.leaveCount)), status: "submitted", receipt
    });
  } catch (error) {
    const pending = error instanceof Error && error.message === "EXAM_RESULT_WRITE_IN_PROGRESS";
    return NextResponse.json(
      { error: pending ? "กำลังบันทึกผลสอบ กรุณากดลองส่งอีกครั้ง" : "บันทึกผลสอบลง Google Sheet ไม่สำเร็จ กรุณากดลองส่งอีกครั้ง" },
      { status: pending ? 409 : 503, headers: { "Retry-After": "2" } }
    );
  }
  return NextResponse.json({ status: result.status, receipt: result.receipt });
}
