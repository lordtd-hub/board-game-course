import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  EXAM_COOKIE, EXAM_DURATION_MS, EXAM_ID, EXAM_TOTAL, encodeExamSession, examConfigurationReady, examWindowStatus,
  formCode, formSeed, normalizeStudentId, roomCodeIsValid
} from "@/lib/exam/core.server";
import { examState } from "@/lib/exam/actions.server";
import { getExamConfig, listExamSections, primeExamAdmission } from "@/lib/exam/repository.server";
import type { ExamSession } from "@/lib/exam/types";

const StartSchema = z.object({
  studentId: z.string().trim().min(4).max(24).regex(/^[0-9A-Za-z_-]+$/),
  studentName: z.string().trim().min(2).max(120),
  sectionId: z.string().trim().min(1).max(80),
  roomCode: z.string().trim().regex(/^\d{6}$/)
});

export async function POST(request: Request) {
  const parsed = StartSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "กรอกข้อมูลให้ครบและตรวจรูปแบบรหัสนักศึกษา" }, { status: 400 });
  if (!examConfigurationReady()) return NextResponse.json({ error: "ระบบสอบยังไม่ได้ตั้งค่าพร้อมใช้งาน" }, { status: 503 });
  await primeExamAdmission().catch(() => undefined);
  const savedConfig = await getExamConfig(EXAM_ID).catch(() => null);
  const now = Date.now();
  const window = savedConfig
    ? {
        open: savedConfig.status === "open"
          && now >= Date.parse(savedConfig.openAt)
          && now <= Date.parse(savedConfig.closeAt)
      }
    : examWindowStatus(now);
  if (!window.open) return NextResponse.json({ error: "ยังไม่อยู่ในช่วงเวลาเปิดเข้าสอบ" }, { status: 403 });
  if (!roomCodeIsValid(parsed.data.roomCode, savedConfig?.roomCodeHash)) return NextResponse.json({ error: "รหัสห้องสอบไม่ถูกต้อง" }, { status: 403 });

  const sections = await listExamSections().catch(() => []);
  if (!sections.some((section) => section.id === parsed.data.sectionId)) {
    return NextResponse.json({ error: "ไม่พบ Section ที่เลือก" }, { status: 400 });
  }

  const studentId = normalizeStudentId(parsed.data.studentId);
  const state = await examState(studentId).catch(() => null);
  if (!state) return NextResponse.json(
    { error: "ตรวจสถานะการสอบจาก Google Sheet ไม่สำเร็จ กรุณาลองอีกครั้ง" },
    { status: 503, headers: { "Retry-After": "2" } }
  );
  if (state.disqualified) return NextResponse.json({ error: "รหัสนี้ถูกตัดสิทธิ์จากการสอบแล้ว", status: "disqualified" }, { status: 423 });
  if (state.result) return NextResponse.json({ error: "รหัสนี้ส่งข้อสอบแล้ว", status: "submitted", receipt: state.result.receipt }, { status: 409 });

  const startedAt = new Date().toISOString();
  const session: ExamSession = {
    examId: EXAM_ID,
    studentId,
    studentName: parsed.data.studentName.trim(),
    sectionId: parsed.data.sectionId,
    seed: formSeed(studentId),
    startedAt,
    expiresAt: new Date(Date.now() + EXAM_DURATION_MS).toISOString()
  };
  const store = await cookies();
  store.set(EXAM_COOKIE, encodeExamSession(session), {
    httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 65 * 60
  });
  return NextResponse.json({
    examId: EXAM_ID, studentId, studentName: session.studentName, sectionId: session.sectionId,
    startedAt, expiresAt: session.expiresAt, serverNow: new Date().toISOString(),
    total: EXAM_TOTAL, formCode: formCode(session.seed), leaveCount: state.leaveCount
  });
}
