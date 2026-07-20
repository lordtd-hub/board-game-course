import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { decodeExamSession, EXAM_COOKIE } from "@/lib/exam/core.server";
import { recordScreenHidden } from "@/lib/exam/actions.server";

const EventSchema = z.object({ count: z.number().int().min(1).max(2), clientAt: z.string().max(80).optional() });

export async function POST(request: Request) {
  const session = decodeExamSession((await cookies()).get(EXAM_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Session หมดอายุ" }, { status: 401 });
  const parsed = EventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "ข้อมูลเหตุการณ์ไม่ถูกต้อง" }, { status: 400 });
  try {
    const result = await recordScreenHidden(session, parsed.data.count, `clientAt=${parsed.data.clientAt || "unknown"}`);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "บันทึกเหตุการณ์ลง Google Sheet ไม่สำเร็จ กรุณาคงหน้านี้ไว้และลองอีกครั้ง" }, { status: 503 });
  }
}
