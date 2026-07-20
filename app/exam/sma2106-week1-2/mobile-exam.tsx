"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./exam.module.css";

type SectionOption = { id: string; label: string };
type Phase = "setup" | "active" | "warning" | "submitting" | "submitted" | "disqualified" | "error";
type SessionInfo = {
  studentId: string; studentName: string; sectionId: string; startedAt: string; expiresAt: string;
  serverNow?: string; total: number; formCode: string; leaveCount: number; receipt?: string; status?: string;
};
type PendingExamEvent = { eventId: string; count: number; clientAt: string };
type LocalDraft = { answers: string[]; current: number; leaveCount: number; pendingEvents: PendingExamEvent[] };

const LETTERS = ["A", "B", "C", "D"] as const;
const TOTAL = 24;
const MONITORED_PHASES: Phase[] = ["active", "warning", "submitting", "error"];

function attemptStorageKey(session: Pick<SessionInfo, "studentId" | "startedAt">) {
  return `sma2106-exam:${session.studentId}:${session.startedAt}`;
}

function eventId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (digit) =>
    (Number(digit) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(digit) / 4).toString(16)
  );
}

async function responseData(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  if (!text) return { error: `เซิร์ฟเวอร์ไม่ส่งรายละเอียดกลับมา (HTTP ${response.status})` };
  try { return JSON.parse(text) as Record<string, unknown>; }
  catch { return { error: `เซิร์ฟเวอร์ตอบกลับในรูปแบบที่อ่านไม่ได้ (HTTP ${response.status})` }; }
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 15_000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(input, { ...init, signal: controller.signal }); }
  finally { window.clearTimeout(timer); }
}

function formatTime(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function MobileExam({ sections }: { sections: SectionOption[] }) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(TOTAL).fill(""));
  const [remaining, setRemaining] = useState(60 * 60 * 1000);
  const [zoom, setZoom] = useState(1);
  const [questionRetry, setQuestionRetry] = useState(0);
  const [questionError, setQuestionError] = useState(false);
  const [message, setMessage] = useState("");
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine);
  const [checks, setChecks] = useState([false, false, false, false]);
  const [entry, setEntry] = useState({ studentId: "", studentName: "", sectionId: sections[0]?.id || "", roomCode: "" });
  const leaveCountRef = useRef(0);
  const phaseRef = useRef<Phase>("setup");
  const autoSubmitted = useRef(false);
  const startingRef = useRef(false);
  const clockOffsetRef = useRef(0);
  const questionViewportRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<SessionInfo | null>(null);
  const answersRef = useRef(answers);
  const currentRef = useRef(current);
  const pendingEventsRef = useRef<PendingExamEvent[]>([]);
  const flushPromiseRef = useRef<Promise<boolean> | null>(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { currentRef.current = current; }, [current]);

  useEffect(() => {
    questionViewportRef.current?.scrollTo({ top: 0, left: 0 });
  }, [current, session?.formCode]);

  const storageKey = useMemo(() => session ? attemptStorageKey(session) : "", [session]);
  const persist = useCallback((nextAnswers = answersRef.current, nextCurrent = currentRef.current) => {
    const activeSession = sessionRef.current;
    if (!activeSession) return;
    try {
      const draft: LocalDraft = {
        answers: nextAnswers,
        current: nextCurrent,
        leaveCount: leaveCountRef.current,
        pendingEvents: pendingEventsRef.current
      };
      localStorage.setItem(attemptStorageKey(activeSession), JSON.stringify(draft));
    } catch { /* localStorage is a convenience, server remains authoritative for violations. */ }
  }, []);

  const hydrateSession = useCallback((data: SessionInfo) => {
    sessionRef.current = data;
    setSession(data);
    leaveCountRef.current = data.leaveCount || 0;
    const serverNow = Date.parse(data.serverNow || data.startedAt);
    clockOffsetRef.current = Number.isFinite(serverNow) ? serverNow - Date.now() : 0;
    setRemaining(Date.parse(data.expiresAt) - (Date.now() + clockOffsetRef.current));
    try {
      const key = attemptStorageKey(data);
      const legacyKey = `sma2106-exam:${data.studentId}`;
      const saved = JSON.parse(localStorage.getItem(key) || localStorage.getItem(legacyKey) || "null") as LocalDraft | null;
      if (saved?.answers?.length === TOTAL) { answersRef.current = saved.answers; setAnswers(saved.answers); }
      if (Number.isInteger(saved?.current)) {
        currentRef.current = Math.max(0, Math.min(TOTAL - 1, saved!.current));
        setCurrent(currentRef.current);
      }
      leaveCountRef.current = Math.max(leaveCountRef.current, Number(saved?.leaveCount) || 0);
      pendingEventsRef.current = Array.isArray(saved?.pendingEvents) ? saved.pendingEvents.filter((event) =>
        typeof event?.eventId === "string" && Number.isInteger(event?.count) && typeof event?.clientAt === "string"
      ) : [];
      if (!pendingEventsRef.current.length && leaveCountRef.current > (Number(data.leaveCount) || 0)) {
        pendingEventsRef.current = [{
          eventId: eventId(),
          count: Math.min(2, leaveCountRef.current),
          clientAt: new Date().toISOString()
        }];
      }
      if (localStorage.getItem(legacyKey) && !localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify({ ...saved, pendingEvents: pendingEventsRef.current }));
        localStorage.removeItem(legacyKey);
      } else if (pendingEventsRef.current.length) {
        localStorage.setItem(key, JSON.stringify({
          answers: answersRef.current,
          current: currentRef.current,
          leaveCount: leaveCountRef.current,
          pendingEvents: pendingEventsRef.current
        }));
      }
    } catch { /* ignore corrupt local draft */ }
    return leaveCountRef.current;
  }, []);

  const applyServerStatus = useCallback((data: Record<string, unknown>) => {
    leaveCountRef.current = Math.max(leaveCountRef.current, Number(data.leaveCount) || 0);
    if (data.status === "disqualified" || leaveCountRef.current >= 2) {
      phaseRef.current = "disqualified";
      setPhase("disqualified");
      return "disqualified" as const;
    }
    if (data.status === "submitted") {
      setSession((value) => value ? { ...value, receipt: String(data.receipt || "") } : value);
      phaseRef.current = "submitted";
      setPhase("submitted");
      return "submitted" as const;
    }
    return "active" as const;
  }, []);

  const reconcileStatus = useCallback(async () => {
    try {
      const response = await fetchWithTimeout("/api/exam/status", { cache: "no-store" });
      if (!response.ok) return false;
      const data = await responseData(response);
      applyServerStatus(data);
      persist();
      return true;
    } catch { return false; }
  }, [applyServerStatus, persist]);

  const flushPendingEvents = useCallback(async () => {
    if (flushPromiseRef.current) return flushPromiseRef.current;
    const work = (async () => {
      while (pendingEventsRef.current.length) {
        const event = pendingEventsRef.current[0];
        try {
          const response = await fetchWithTimeout("/api/exam/event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(event),
            keepalive: true
          }, 12_000);
          const data = await responseData(response);
          if (!response.ok) return false;
          pendingEventsRef.current = pendingEventsRef.current.filter((item) => item.eventId !== event.eventId);
          applyServerStatus(data);
          persist();
          if (data.status === "disqualified") return true;
        } catch { return false; }
      }
      return true;
    })();
    flushPromiseRef.current = work;
    try { return await work; }
    finally { if (flushPromiseRef.current === work) flushPromiseRef.current = null; }
  }, [applyServerStatus, persist]);

  useEffect(() => {
    const syncAfterResume = () => {
      setOnline(true);
      window.setTimeout(() => { void flushPendingEvents().then(() => reconcileStatus()); }, 350);
    };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", syncAfterResume);
    window.addEventListener("pageshow", syncAfterResume);
    window.addEventListener("offline", onOffline);
    void fetchWithTimeout("/api/exam/status", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) return;
      const data = await responseData(response) as SessionInfo;
      if (!data.studentId) return;
      const effectiveLeaveCount = hydrateSession(data);
      if (data.status === "disqualified" || effectiveLeaveCount >= 2) {
        phaseRef.current = "disqualified"; setPhase("disqualified");
      } else if (data.status === "submitted" && !pendingEventsRef.current.length) {
        phaseRef.current = "submitted"; setPhase("submitted");
      } else {
        phaseRef.current = effectiveLeaveCount === 1 ? "warning" : "active";
        setPhase(phaseRef.current);
      }
      if (pendingEventsRef.current.length) await flushPendingEvents();
      await reconcileStatus();
    }).catch(() => undefined);
    return () => {
      window.removeEventListener("online", syncAfterResume);
      window.removeEventListener("pageshow", syncAfterResume);
      window.removeEventListener("offline", onOffline);
    };
  }, [flushPendingEvents, hydrateSession, reconcileStatus]);

  const submitExam = useCallback(async (automatic = false) => {
    if (!sessionRef.current || phaseRef.current === "submitted" || phaseRef.current === "disqualified" || phaseRef.current === "submitting") return;
    phaseRef.current = "submitting";
    setPhase("submitting");
    setMessage(automatic ? "หมดเวลา กำลังส่งคำตอบอัตโนมัติ กรุณาอยู่หน้านี้จนได้รับเลขรับผล" : "กำลังส่งคำตอบ กรุณาอยู่หน้านี้จนได้รับเลขรับผล");
    try {
      const eventsSaved = await flushPendingEvents();
      if ((phaseRef.current as Phase) === "disqualified" || leaveCountRef.current >= 2) return;
      if (!eventsSaved) throw new Error("ยังบันทึกเหตุการณ์ออกจากหน้าสอบไม่สำเร็จ กรุณาอยู่หน้านี้และกดลองส่งอีกครั้ง");
      const response = await fetchWithTimeout("/api/exam/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersRef.current, leaveCount: leaveCountRef.current })
      }, 20_000);
      const data = await responseData(response);
      if (data.status === "disqualified") { phaseRef.current = "disqualified"; setPhase("disqualified"); return; }
      if (!response.ok) {
        if (await reconcileStatus() && ["submitted", "disqualified"].includes(phaseRef.current)) return;
        throw new Error(String(data.error || "ส่งข้อสอบไม่สำเร็จ"));
      }
      if (pendingEventsRef.current.length || leaveCountRef.current >= 2) {
        await flushPendingEvents();
        await reconcileStatus();
        if ((phaseRef.current as Phase) === "disqualified") return;
      }
      setSession((value) => value ? { ...value, receipt: String(data.receipt || "") } : value);
      if (storageKey) localStorage.removeItem(storageKey);
      phaseRef.current = "submitted";
      setPhase("submitted");
    } catch (error) {
      if (await reconcileStatus() && ["submitted", "disqualified"].includes(phaseRef.current)) return;
      setMessage(error instanceof Error ? error.message : "ส่งข้อสอบไม่สำเร็จ โปรดลองอีกครั้ง");
      phaseRef.current = "error";
      setPhase("error");
    }
  }, [flushPendingEvents, reconcileStatus, storageKey]);

  useEffect(() => {
    if (!session || !["active", "warning", "error"].includes(phase)) return;
    const tick = () => {
      const next = Date.parse(session.expiresAt) - (Date.now() + clockOffsetRef.current);
      setRemaining(next);
      if (next <= 0 && !autoSubmitted.current) { autoSubmitted.current = true; void submitExam(true); }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [phase, session, submitExam]);

  useEffect(() => {
    const block = (event: Event) => { if (MONITORED_PHASES.includes(phaseRef.current)) event.preventDefault(); };
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("contextmenu", block);
    document.addEventListener("selectstart", block);
    return () => {
      document.removeEventListener("copy", block); document.removeEventListener("cut", block);
      document.removeEventListener("contextmenu", block); document.removeEventListener("selectstart", block);
    };
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden" && sessionRef.current && MONITORED_PHASES.includes(phaseRef.current) && leaveCountRef.current < 2) {
        leaveCountRef.current = Math.min(2, leaveCountRef.current + 1);
        const pendingEvent: PendingExamEvent = {
          eventId: eventId(),
          count: leaveCountRef.current,
          clientAt: new Date().toISOString()
        };
        pendingEventsRef.current = [...pendingEventsRef.current, pendingEvent];
        phaseRef.current = pendingEvent.count >= 2 ? "disqualified" : "warning";
        setPhase(phaseRef.current);
        persist();
        const body = JSON.stringify(pendingEvent);
        try { navigator.sendBeacon("/api/exam/event", new Blob([body], { type: "application/json" })); }
        catch { /* The durable outbox retries when this page becomes visible or online. */ }
      } else if (document.visibilityState === "visible" && sessionRef.current) {
        window.setTimeout(() => { void flushPendingEvents().then(() => reconcileStatus()); }, 350);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [flushPendingEvents, persist, reconcileStatus]);

  async function startExam(event: FormEvent) {
    event.preventDefault();
    if (startingRef.current) return;
    if (!checks.every(Boolean)) { setMessage("กรุณายืนยันการเตรียมมือถือและกติกาให้ครบ"); return; }
    startingRef.current = true;
    setMessage("กำลังเปิดข้อสอบ...");
    try {
      const response = await fetch("/api/exam/start", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry)
      });
      const data = await responseData(response);
      if (!response.ok) throw new Error(String(data.error || "ไม่สามารถเริ่มสอบได้"));
      hydrateSession(data as SessionInfo);
      answersRef.current = Array(TOTAL).fill(""); currentRef.current = 0; pendingEventsRef.current = [];
      setAnswers(answersRef.current); setCurrent(0); setMessage(""); phaseRef.current = "active"; setPhase("active");
    } catch (error) { setMessage(error instanceof Error ? error.message : "ไม่สามารถเริ่มสอบได้"); }
    finally { startingRef.current = false; }
  }

  function choose(letter: string) {
    const next = [...answers]; next[current] = letter; answersRef.current = next; setAnswers(next); persist(next);
  }

  function moveTo(index: number) { const next = Math.max(0, Math.min(TOTAL - 1, index)); currentRef.current = next; setQuestionError(false); setCurrent(next); persist(answers, next); }

  if (phase === "setup") return (
    <div className={styles.examRoot}>
      <section className={styles.setupCard}>
        <div className={styles.kicker}>SMA2106 · Mobile Examination</div>
        <h1>ข้อสอบ Week 1-2</h1>
        <p className={styles.lead}>ข้อสอบปรนัย 24 ข้อ เวลา 60 นาที ห้ามใช้ AI เอกสาร เว็บไซต์ หรือความช่วยเหลือจากบุคคลอื่น</p>
        <div className={styles.dangerNotice}><strong>กติกาสำคัญ</strong><br/>ออกจากหน้าสอบครั้งแรกจะได้รับคำเตือน ครั้งที่สองระบบจะยุติการสอบและให้คะแนน 0 ทันทีโดยแก้คืนไม่ได้</div>
        <form onSubmit={startExam} className={styles.form}>
          <label>รหัสนักศึกษา<input value={entry.studentId} onChange={(e) => setEntry({ ...entry, studentId: e.target.value })} inputMode="numeric" autoComplete="off" required /></label>
          <label>ชื่อ-นามสกุล<input value={entry.studentName} onChange={(e) => setEntry({ ...entry, studentName: e.target.value })} autoComplete="off" required /></label>
          <label>Section<select value={entry.sectionId} onChange={(e) => setEntry({ ...entry, sectionId: e.target.value })} required><option value="">เลือก Section</option>{sections.map((section) => <option value={section.id} key={section.id}>{section.label}</option>)}</select></label>
          <label>รหัสห้องสอบ 6 หลัก<input value={entry.roomCode} onChange={(e) => setEntry({ ...entry, roomCode: e.target.value.replace(/\D/g, "").slice(0, 6) })} inputMode="numeric" autoComplete="off" required /></label>
          <fieldset className={styles.checklist}><legend>ยืนยันก่อนเริ่มสอบ</legend>{[
            "เปิดโหมดห้ามรบกวนและปิดการแจ้งเตือนแล้ว", "ปิดการล็อกหน้าจออัตโนมัติและปิดแอปอื่นแล้ว",
            "มีอินเทอร์เน็ตและแบตเตอรี่เพียงพอ", "เข้าใจว่าสลับหน้าจอครั้งที่สองจะได้ 0 ทันที"
          ].map((label, index) => <label key={label}><input type="checkbox" checked={checks[index]} onChange={(e) => setChecks(checks.map((value, item) => item === index ? e.target.checked : value))}/><span>{label}</span></label>)}</fieldset>
          {message ? <p className={styles.errorText} role="alert">{message}</p> : null}
          <button className={styles.primary} type="submit" disabled={!sections.length}>ยืนยันและเริ่มจับเวลา 60 นาที</button>
          {!sections.length ? <p className={styles.errorText}>ยังไม่มี Section ที่เปิดใช้งาน กรุณาแจ้งผู้คุมสอบ</p> : null}
        </form>
      </section>
    </div>
  );

  if (phase === "warning") return <div className={styles.blockScreen}><div className={styles.warningIcon}>⚠</div><h1>คำเตือนครั้งที่ 1</h1><p>ระบบตรวจพบว่าคุณออกจากหน้าสอบหรือสลับไปยังแอปอื่นแล้ว</p><strong>หากเกิดขึ้นอีกครั้ง ระบบจะยุติการสอบและให้คะแนน 0 ทันที</strong><p>เวลาสอบยังคงเดินต่อ</p><button className={styles.warningButton} onClick={() => { phaseRef.current = "active"; setPhase("active"); }}>ข้าพเจ้ารับทราบและกลับเข้าสอบ</button></div>;
  if (phase === "submitting") return <div className={styles.blockScreen}><div className={styles.warningIcon}>…</div><h1>กำลังส่งคำตอบ</h1><strong>กรุณารอจนกว่าหน้าจอจะแจ้งว่า “ส่งข้อสอบเรียบร้อย” และแสดงเลขรับผล</strong><p>หากนักศึกษาหลายคนกดส่งพร้อมกัน ระบบอาจใช้เวลาประมาณ 1–2 นาที</p><p>ห้ามปิดหน้านี้ ห้ามรีเฟรช และห้ามสลับไปแอปอื่นระหว่างรอ</p></div>;
  if (phase === "disqualified") return <div className={`${styles.blockScreen} ${styles.disqualified}`}><div className={styles.warningIcon}>×</div><h1>การสอบถูกยุติ</h1><p>ระบบตรวจพบการออกจากหน้าสอบเป็นครั้งที่ 2</p><strong>สถานะ: ทุจริต · คะแนน 0</strong><p>โปรดยกมือและติดต่อผู้คุมสอบโดยไม่ปิดหน้านี้</p></div>;
  if (phase === "submitted") return <div className={styles.blockScreen}><div className={styles.successIcon}>✓</div><h1>ส่งข้อสอบเรียบร้อย</h1><p>ระบบบันทึกคำตอบแล้ว กรุณาแสดงหน้านี้ต่อผู้คุมสอบก่อนปิด</p><div className={styles.receipt}>{session?.receipt || "กำลังออกเลขรับผล"}</div><p>ระบบจะไม่แสดงคะแนนหรือเฉลยในขณะนี้</p></div>;

  return (
    <div className={styles.examRoot}>
      <header className={styles.examHeader}><div><span>SMA2106</span><strong>{session?.studentId} · ชุด {session?.formCode}</strong></div><div className={remaining < 5 * 60 * 1000 ? styles.timeDanger : styles.timer}>{formatTime(remaining)}</div></header>
      {!online ? <div className={styles.offline}>ออฟไลน์: คำตอบยังบันทึกในเครื่อง ห้ามปิดหน้านี้</div> : null}
      <main className={styles.questionShell}>
        <div className={styles.progressRow}><strong>ข้อ {current + 1} จาก {TOTAL}</strong><span>ตอบแล้ว {answers.filter(Boolean).length}/{TOTAL}</span></div>
        <div className={styles.zoomBar}><button type="button" onClick={() => setZoom(Math.max(.8, zoom - .1))}>A-</button><button type="button" onClick={() => setZoom(Math.min(1.5, zoom + .1))}>A+</button></div>
        <div className={styles.questionViewport} ref={questionViewportRef}>
          {questionError ? <div className={styles.submitStatus}><p>โหลดภาพคำถามไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ตแล้วลองใหม่</p><button type="button" onClick={() => { setQuestionError(false); setQuestionRetry((value) => value + 1); }}>โหลดคำถามอีกครั้ง</button></div> : <>
            {/* eslint-disable-next-line @next/next/no-img-element -- authenticated SVG has dynamic height and must not be optimized or cached */}
            <img key={`${current}-${session?.formCode}-${questionRetry}`} src={`/api/exam/question?index=${current}&retry=${questionRetry}`} alt={`ภาพโจทย์ข้อ ${current + 1}`} draggable={false} onError={() => setQuestionError(true)} style={{ width: `${zoom * 100}%` }} />
          </>}
        </div>
        <div className={styles.answerButtons}>{LETTERS.map((letter) => <button type="button" className={answers[current] === letter ? styles.selected : ""} onClick={() => choose(letter)} key={letter}>{letter}</button>)}</div>
        <div className={styles.navButtons}><button type="button" onClick={() => moveTo(current - 1)} disabled={current === 0}>ก่อนหน้า</button>{current < TOTAL - 1 ? <button type="button" onClick={() => moveTo(current + 1)}>ถัดไป</button> : <button type="button" className={styles.submitButton} onClick={() => { if (confirm(`ยืนยันส่งข้อสอบ? ยังไม่ตอบ ${answers.filter((answer) => !answer).length} ข้อ`)) void submitExam(false); }}>ส่งข้อสอบ</button>}</div>
        <div className={styles.palette}>{answers.map((answer, index) => <button type="button" className={`${index === current ? styles.current : ""} ${answer ? styles.answered : ""}`} onClick={() => moveTo(index)} key={index}>{index + 1}</button>)}</div>
        {phase === "error" ? <div className={styles.submitStatus}><p>{message}</p><button onClick={() => void submitExam(false)}>ลองส่งอีกครั้ง</button></div> : null}
      </main>
    </div>
  );
}
