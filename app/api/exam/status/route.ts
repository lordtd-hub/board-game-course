import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decodeExamSession, EXAM_COOKIE, EXAM_TOTAL, formCode } from "@/lib/exam/core.server";
import { examState } from "@/lib/exam/actions.server";

export async function GET() {
  const session = decodeExamSession((await cookies()).get(EXAM_COOKIE)?.value);
  if (!session) return NextResponse.json({ status: "missing" });
  const state = await examState(session.studentId);
  return NextResponse.json({
    status: state.disqualified ? "disqualified" : state.result?.status || "active",
    studentId: session.studentId, studentName: session.studentName, sectionId: session.sectionId,
    startedAt: session.startedAt, expiresAt: session.expiresAt, serverNow: new Date().toISOString(),
    total: EXAM_TOTAL, formCode: formCode(session.seed), leaveCount: state.leaveCount,
    receipt: state.result?.receipt || ""
  });
}
