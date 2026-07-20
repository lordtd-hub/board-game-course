"use client";

import { useEffect, useMemo, useState } from "react";

type ControlState = {
  configured: boolean;
  storageReady: boolean;
  status: "open" | "closed";
  openAt?: string;
  closeAt?: string;
  updatedAt?: string;
  updatedBy?: string;
};

async function responseData(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  if (!text) return { error: `เซิร์ฟเวอร์ไม่ส่งรายละเอียดกลับมา (HTTP ${response.status})` };
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: `เซิร์ฟเวอร์ตอบกลับในรูปแบบที่อ่านไม่ได้ (HTTP ${response.status})` };
  }
}

const ENTRY_WINDOW_OPTIONS = [30, 60, 90, 120] as const;

export function ExamControl() {
  const [state, setState] = useState<ControlState | null>(null);
  const [locked, setLocked] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [entryWindowMinutes, setEntryWindowMinutes] = useState<number>(60);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const examUrl = useMemo(() => typeof window === "undefined" ? "" : `${window.location.origin}/exam/sma2106-week1-2`, []);

  useEffect(() => {
    fetch("/api/instructor/exam-control", { cache: "no-store" })
      .then(async (response) => ({ response, data: await responseData(response) }))
      .then(({ response, data }) => {
        if (response.ok) {
          setState(data as ControlState);
          setLocked(false);
        } else if (response.status === 401) {
          setLocked(true);
        } else {
          setMessage(String(data.error || "โหลดสถานะไม่สำเร็จ"));
          setLocked(true);
        }
      })
      .catch(() => {
        setMessage("โหลดสถานะไม่สำเร็จ");
        setLocked(true);
      });
  }, []);

  async function unlock() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/instructor/exam-control", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "unlock", pin })
      });
      const data = await responseData(response);
      if (!response.ok) throw new Error(String(data.error || "ปลดล็อกไม่สำเร็จ"));
      const statusResponse = await fetch("/api/instructor/exam-control", { cache: "no-store" });
      const status = await responseData(statusResponse);
      if (!statusResponse.ok) throw new Error(String(status.error || "โหลดสถานะไม่สำเร็จ"));
      setState(status as ControlState);
      setLocked(false);
      setPin("");
      setMessage("ปลดล็อกแล้ว เครื่องนี้ใช้งานได้ 8 ชั่วโมง");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ปลดล็อกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function command(body: object) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/instructor/exam-control", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await responseData(response);
      if (!response.ok) throw new Error(String(data.error || "ดำเนินการไม่สำเร็จ"));
      setState(data as ControlState);
      setMessage(body && "action" in body && body.action === "open" ? "เปิดรับนักศึกษาใหม่แล้ว" : "ปิดรับนักศึกษาใหม่ก่อนกำหนดแล้ว");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ดำเนินการไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setMessage(`คัดลอก${label}แล้ว`);
  }

  const live = state?.status === "open";
  if (locked === null) {
    return <section className="card"><h1>กำลังตรวจสอบสิทธิ์ควบคุมการสอบ…</h1></section>;
  }

  if (locked) {
    return (
      <div className="stack">
        <section className="hero">
          <span className="badge">Instructor control</span>
          <h1>ควบคุมการสอบ SMA2106</h1>
          <p>ไม่ต้อง Sign in — ใช้ PIN ผู้ควบคุมที่ตั้งไว้สำหรับอาจารย์</p>
        </section>
        <section className="card stack" style={{ maxWidth: 520 }}>
          <h2>ใส่ PIN ผู้ควบคุม</h2>
          <label className="field">PIN 8–12 หลัก
            <input type="password" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 12))} inputMode="numeric" autoComplete="one-time-code" onKeyDown={(event) => {
              if (event.key === "Enter" && pin.length >= 8 && !busy) void unlock();
            }} />
          </label>
          <button disabled={busy || pin.length < 8} onClick={() => void unlock()}>{busy ? "กำลังตรวจสอบ…" : "ปลดล็อกหน้าควบคุม"}</button>
          <p className="muted">เมื่อผ่านแล้ว ระบบจะจำเครื่องนี้ไว้ 8 ชั่วโมง ห้ามใช้ PIN เดียวกับรหัสห้องนักศึกษา</p>
          {message && <p role="alert"><strong>{message}</strong></p>}
        </section>
      </div>
    );
  }

  return (
    <div className="stack">
      <section className="hero">
        <span className="badge">Instructor only</span>
        <h1>ควบคุมการสอบ SMA2106</h1>
        <p>เตรียมสอบในหน้าเดียว ไม่ต้องแก้ environment และไม่ต้อง deploy ใหม่</p>
      </section>

      <section className="grid">
        <article className="card stack">
          <div>
            <span className="badge">1 · ตั้งค่าห้อง</span>
            <h2>เปิดรับนักศึกษาใหม่</h2>
            <p className="muted">กำหนดช่วงเวลาที่นักศึกษาสามารถเริ่มสอบได้ ผู้ที่เริ่มทันเวลายังทำข้อสอบได้ครบ 60 นาที</p>
          </div>
          <label className="field">รหัสห้อง 6 หลัก
            <input value={roomCode} onChange={(event) => setRoomCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="เช่น 482731" autoComplete="off" />
          </label>
          <fieldset className="field">
            <legend>อนุญาตให้เริ่มสอบภายในกี่นาที</legend>
            <div className="nav" role="group" aria-label="ระยะเวลาที่อนุญาตให้นักศึกษาเริ่มสอบ">
              {ENTRY_WINDOW_OPTIONS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={entryWindowMinutes === minutes ? undefined : "secondary"}
                  aria-pressed={entryWindowMinutes === minutes}
                  onClick={() => setEntryWindowMinutes(minutes)}
                >
                  {minutes} นาที
                </button>
              ))}
            </div>
            <span className="muted">ระบบจะปิดรับนักศึกษาใหม่อัตโนมัติเมื่อครบเวลานี้ ไม่ใช่เวลาทำข้อสอบของนักศึกษา</span>
          </fieldset>
          {state?.storageReady === false && <p role="alert"><strong>ยังไม่ได้เชื่อม Google Sheet จึงยังเปิดสอบไม่ได้</strong></p>}
          <button disabled={busy || state?.storageReady === false || roomCode.length !== 6} onClick={() => void command({
            action: "open",
            roomCode,
            closeAt: new Date(Date.now() + entryWindowMinutes * 60_000).toISOString()
          })}>
            {busy ? "กำลังบันทึก…" : live ? "อัปเดตรหัสและช่วงเวลา" : "เปิดรับนักศึกษาใหม่"}
          </button>
        </article>

        <article className="card stack">
          <div>
            <span className="badge">2 · แจกให้นักศึกษา</span>
            <h2>ลิงก์เข้าสอบ</h2>
            <p className="muted">แจก URL ผ่าน LINE, Classroom หรือ QR และแจ้งรหัสห้องแยกกัน</p>
          </div>
          <label className="field">URL สำหรับนักศึกษา
            <input readOnly value={examUrl} aria-label="ลิงก์เข้าสอบ" />
          </label>
          <div className="nav">
            <button disabled={!examUrl} onClick={() => void copy(examUrl, "ลิงก์")}>คัดลอกลิงก์</button>
            <button className="secondary" disabled={roomCode.length !== 6} onClick={() => void copy(roomCode, "รหัสห้อง")}>คัดลอกรหัสห้อง</button>
          </div>
        </article>
      </section>

      <section className="card stack">
        <div>
          <span className="badge">3 · ตรวจสถานะ</span>
          <h2>{state === null ? "กำลังตรวจสอบ…" : live ? "กำลังเปิดรับนักศึกษาใหม่" : "ขณะนี้ไม่รับนักศึกษาใหม่"}</h2>
          {state?.closeAt && <p className="muted">{live ? "ระบบจะปิดรับนักศึกษาใหม่อัตโนมัติ" : "รอบล่าสุดปิดรับเมื่อ"}: {new Date(state.closeAt).toLocaleString("th-TH")}</p>}
        </div>
        {live && <button className="secondary" disabled={busy} onClick={() => {
          if (window.confirm("ยืนยันปิดรับนักศึกษาใหม่ก่อนกำหนด? ผู้ที่เริ่มสอบแล้วจะยังทำต่อได้จนครบเวลา")) void command({ action: "close" });
        }}>ปิดรับก่อนกำหนด</button>}
        {message && <p role="status"><strong>{message}</strong></p>}
      </section>
    </div>
  );
}
