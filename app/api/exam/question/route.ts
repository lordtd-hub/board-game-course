import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { assembleExam, decodeExamSession, EXAM_COOKIE, formCode, renderQuestionSvg } from "@/lib/exam/core.server";
import { examState } from "@/lib/exam/actions.server";

export async function GET(request: Request) {
  const session = decodeExamSession((await cookies()).get(EXAM_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Session หมดอายุ" }, { status: 401 });
  const state = await examState(session.studentId);
  if (state.disqualified || state.result) return NextResponse.json({ error: "ข้อสอบถูกล็อกแล้ว" }, { status: 423 });
  const index = Number(new URL(request.url).searchParams.get("index"));
  if (!Number.isInteger(index) || index < 0 || index >= 24) return NextResponse.json({ error: "ไม่พบข้อสอบ" }, { status: 404 });
  const question = assembleExam(session.seed)[index];
  const svg = renderQuestionSvg(question, index, session.studentId, formCode(session.seed));
  return new NextResponse(svg, {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff" }
  });
}
