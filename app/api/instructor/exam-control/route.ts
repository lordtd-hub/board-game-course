import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { appConfig } from "@/lib/config";
import { EXAM_ID, hashRoomCode } from "@/lib/exam/core.server";
import { getExamConfig, saveExamConfig } from "@/lib/exam/repository.server";

const CONTROL_COOKIE = "sma2106_exam_control";
const CONTROL_SESSION_MS = 8 * 60 * 60 * 1000;

function storageIsReady() {
  return Boolean(appConfig.googleSheetId && appConfig.googleServiceAccountEmail && appConfig.googlePrivateKey);
}

const CommandSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("unlock"), pin: z.string().regex(/^\d{8,12}$/) }),
  z.object({
    action: z.literal("open"),
    roomCode: z.string().regex(/^\d{6}$/),
    closeAt: z.string().datetime()
  }),
  z.object({ action: z.literal("close") })
]);

function signature(expiresAt: string) {
  return crypto.createHmac("sha256", appConfig.examSecret)
    .update(`${EXAM_ID}:control:${expiresAt}`)
    .digest("base64url");
}

function safeEqual(actual: string, expected: string) {
  const left = Buffer.from(actual);
  const right = Buffer.from(expected);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function pinIsValid(pin: string) {
  const configured = appConfig.examControlPinHash.toLowerCase();
  if (!configured) return process.env.NODE_ENV !== "production" && pin === "13579024";
  return safeEqual(hashRoomCode(pin), configured);
}

async function controlIsUnlocked() {
  const value = (await cookies()).get(CONTROL_COOKIE)?.value;
  if (!value) return false;
  const [expiresAt, signed] = value.split(".");
  return Boolean(expiresAt && signed && Number(expiresAt) > Date.now() && safeEqual(signed, signature(expiresAt)));
}

function publicConfig(config: Awaited<ReturnType<typeof getExamConfig>>) {
  if (!config) return { configured: false, storageReady: storageIsReady(), status: "closed" as const };
  const now = Date.now();
  const live = config.status === "open" && now >= Date.parse(config.openAt) && now <= Date.parse(config.closeAt);
  return {
    configured: true,
    storageReady: storageIsReady(),
    status: live ? "open" as const : "closed" as const,
    openAt: config.openAt,
    closeAt: config.closeAt,
    updatedAt: config.updatedAt
  };
}

export async function GET() {
  if (!await controlIsUnlocked()) return NextResponse.json({ error: "กรุณาใส่ PIN ผู้ควบคุม" }, { status: 401 });
  if (!storageIsReady()) return NextResponse.json(publicConfig(null));
  try {
    const config = await getExamConfig(EXAM_ID);
    return NextResponse.json(publicConfig(config));
  } catch (error) {
    console.error("Failed to read exam control configuration", error);
    return NextResponse.json({ error: "อ่าน Google Sheet ไม่สำเร็จ กรุณาตรวจการแชร์ Sheet และ Service Account" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const parsed = CommandSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "ข้อมูลไม่ครบหรือรูปแบบไม่ถูกต้อง" }, { status: 400 });

  if (parsed.data.action === "unlock") {
    if (!appConfig.examControlPinHash && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "ระบบยังไม่ได้ตั้งค่า PIN ผู้ควบคุม" }, { status: 503 });
    }
    if (!pinIsValid(parsed.data.pin)) return NextResponse.json({ error: "PIN ไม่ถูกต้อง" }, { status: 401 });
    const expiresAt = String(Date.now() + CONTROL_SESSION_MS);
    const response = NextResponse.json({ unlocked: true });
    response.cookies.set(CONTROL_COOKIE, `${expiresAt}.${signature(expiresAt)}`, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: CONTROL_SESSION_MS / 1000
    });
    return response;
  }

  if (!await controlIsUnlocked()) return NextResponse.json({ error: "กรุณาใส่ PIN ผู้ควบคุม" }, { status: 401 });
  if (!storageIsReady()) {
    return NextResponse.json({ error: "ยังไม่ได้เชื่อม Google Sheet จึงยังเปิดสอบไม่ได้" }, { status: 503 });
  }
  const now = new Date();
  let existing;
  try {
    existing = await getExamConfig(EXAM_ID);
  } catch (error) {
    console.error("Failed to read exam control configuration", error);
    return NextResponse.json({ error: "อ่าน Google Sheet ไม่สำเร็จ กรุณาตรวจการแชร์ Sheet และ Service Account" }, { status: 503 });
  }
  if (parsed.data.action === "close") {
    if (!existing) return NextResponse.json({ error: "ยังไม่มีการเปิดสอบ" }, { status: 409 });
    try {
      const saved = await saveExamConfig({
        examId: EXAM_ID,
        roomCodeHash: existing.roomCodeHash,
        openAt: existing.openAt,
        closeAt: now.toISOString(),
        status: "closed",
        updatedBy: "exam-control-pin",
        updatedAt: now.toISOString()
      });
      return NextResponse.json(publicConfig(saved));
    } catch (error) {
      console.error("Failed to close exam entry", error);
      return NextResponse.json({ error: "บันทึกสถานะลง Google Sheet ไม่สำเร็จ" }, { status: 503 });
    }
  }

  if (Date.parse(parsed.data.closeAt) <= now.getTime()) {
    return NextResponse.json({ error: "เวลาปิดรับเข้าต้องอยู่หลังเวลาปัจจุบัน" }, { status: 400 });
  }
  try {
    const saved = await saveExamConfig({
      examId: EXAM_ID,
      roomCodeHash: hashRoomCode(parsed.data.roomCode),
      openAt: now.toISOString(),
      closeAt: parsed.data.closeAt,
      status: "open",
      updatedBy: "exam-control-pin",
      updatedAt: now.toISOString()
    });
    return NextResponse.json(publicConfig(saved));
  } catch (error) {
    console.error("Failed to open exam entry", error);
    return NextResponse.json({ error: "บันทึกการเปิดสอบลง Google Sheet ไม่สำเร็จ" }, { status: 503 });
  }
}
