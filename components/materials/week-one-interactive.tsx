"use client";

import { useEffect, useMemo, useState } from "react";

type SlideId =
  | "title"
  | "why"
  | "question"
  | "outcomes"
  | "splendor"
  | "roles"
  | "checkpoint"
  | "strategy"
  | "sorter"
  | "decision"
  | "canvas"
  | "play"
  | "compound"
  | "timeline"
  | "debrief"
  | "exit";

type Slide = {
  id: SlideId;
  title: string;
  minutes: number;
  optional?: boolean;
};

const slides: Slide[] = [
  { id: "title", title: "บทนำสู่การคิดเชิงกลยุทธ์", minutes: 4 },
  { id: "why", title: "ทำไมต้องเรียนผ่านบอร์ดเกม", minutes: 6 },
  { id: "question", title: "คำถามเปิดคาบ", minutes: 8 },
  { id: "outcomes", title: "วันนี้ต้องทำอะไรได้", minutes: 6 },
  { id: "splendor", title: "Splendor แบบเร็ว", minutes: 12 },
  { id: "roles", title: "ก่อนเริ่มเล่น", minutes: 7 },
  { id: "checkpoint", title: "Guided play checkpoint", minutes: 14 },
  { id: "strategy", title: "กลยุทธ์ vs ยุทธวิธี", minutes: 10 },
  { id: "sorter", title: "Interactive sorter", minutes: 14 },
  { id: "decision", title: "โครงสร้าง Decision", minutes: 8 },
  { id: "canvas", title: "Decision canvas", minutes: 14 },
  { id: "play", title: "Play Lab", minutes: 80 },
  { id: "compound", title: "Compound Advantage", minutes: 12 },
  { id: "timeline", title: "Interactive timeline", minutes: 12 },
  { id: "debrief", title: "Debrief", minutes: 18 },
  { id: "exit", title: "Exit ticket", minutes: 5 }
];

const sorterCards = [
  { id: "engine", text: "ซื้อการ์ดถูกหลายสีเพื่อให้ตาถัดไปซื้อได้ง่ายขึ้น", answer: "strategy" },
  { id: "token", text: "เก็บ token สีเขียว เพราะขาดอีกหนึ่งเม็ด", answer: "tactics" },
  { id: "reserve", text: "จองการ์ดที่คู่แข่งกำลังเล็ง", answer: "tactics" },
  { id: "noble", text: "วางแผนไล่สีเพื่อดึง noble ในอีกหลายตา", answer: "strategy" }
] as const;

const engineSteps = [
  { id: "cheap", label: "ซื้อการ์ดถูก", detail: "ได้ส่วนลดถาวร", gain: 1 },
  { id: "chain", label: "ซื้อได้เร็วขึ้น", detail: "ใช้ token น้อยลง", gain: 2 },
  { id: "choice", label: "มีตัวเลือกมากขึ้น", detail: "ไม่ติดทรัพยากรเดิม", gain: 2 },
  { id: "points", label: "เร่งคะแนนปลายเกม", detail: "แต้มมาทีหลัง แต่หนักกว่า", gain: 3 }
] as const;

const splendorThaiVideo = {
  title: "วิธีเล่น Splendor โดย Wanderer",
  watchUrl: "https://www.youtube.com/watch?v=Mc8-4zA-nDw",
  embedUrl: "https://www.youtube.com/embed/Mc8-4zA-nDw"
};

const stanceFeedback: Record<string, { label: string; text: string }> = {
  "เอาแต้มตอนนี้": {
    label: "มุมคิดแบบ Tactical",
    text: "เหมาะเมื่อแต้มตรงหน้าทำให้เข้าใกล้จบเกม หรือกันคู่แข่งไม่ให้แซง แต่ต้องถามต่อว่าตาถัดไปเรายังมีทางไปไหม"
  },
  "สร้างทางให้ตาถัดไป": {
    label: "มุมคิดแบบ Strategic",
    text: "นี่คือการมองหลายตาต่อเนื่อง ยอมช้าบางจังหวะเพื่อให้อนาคตมีต้นทุนต่ำลงและมีตัวเลือกมากขึ้น"
  },
  "ขึ้นกับสถานการณ์": {
    label: "มุมคิดแบบ Adaptive",
    text: "เป็นคำตอบที่ดีถ้าบอกเงื่อนไขได้ เช่น แต้มของคู่แข่ง token ที่เหลือ หรือการ์ดที่กำลังจะถูกแย่ง"
  }
};

function normalizeChoiceParam(choice: string | null) {
  if (choice === "tactical") return "เอาแต้มตอนนี้";
  if (choice === "strategic") return "สร้างทางให้ตาถัดไป";
  if (choice === "adaptive") return "ขึ้นกับสถานการณ์";
  return choice || "";
}

type SortBucket = "unassigned" | "strategy" | "tactics";
type SortState = Record<string, SortBucket>;

function minutesLabel(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return hours ? `${hours} ชม. ${minutes} นาที` : `${minutes} นาที`;
}

function clock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function WeekOneInteractive() {
  const [index, setIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stance, setStance] = useState("");
  const [sorts, setSorts] = useState<SortState>(() =>
    Object.fromEntries(sorterCards.map((card) => [card.id, "unassigned"])) as SortState
  );
  const [canvas, setCanvas] = useState({ actor: "", options: "", environment: "", goal: "" });
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const [playSeconds, setPlaySeconds] = useState(80 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  const current = slides[index];
  const totalMinutes = slides.reduce((sum, slide) => sum + slide.minutes, 0);
  const elapsedMinutes = slides.slice(0, index).reduce((sum, slide) => sum + slide.minutes, 0);
  const progress = ((index + 1) / slides.length) * 100;
  const correctCount = sorterCards.filter((card) => sorts[card.id] === card.answer).length;
  const engineScore = useMemo(
    () => selectedSteps.reduce((sum, id) => sum + (engineSteps.find((step) => step.id === id)?.gain || 0), 0),
    [selectedSteps]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slideParam = params.get("slide") || "";
    const slide = Number(slideParam.split("_")[0]);
    const initialIndex = Number.isFinite(slide) && slide > 0 ? Math.min(Math.max(slide - 1, 0), slides.length - 1) : 0;
    const initialStance = normalizeChoiceParam(params.get("choice") || slideParam.split("_")[1]);
    window.requestAnimationFrame(() => {
      setIndex(initialIndex);
      setStance(initialStance);
    });
  }, []);

  useEffect(() => {
    if (!timerRunning) return;
    const timer = window.setInterval(() => {
      setPlaySeconds((seconds) => {
        if (seconds <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning]);

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      if (event.key === "ArrowRight" || event.key === " ") next();
      if (event.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  }

  function next() {
    setShowNotes(false);
    setIndex((value) => Math.min(value + 1, slides.length - 1));
  }

  function back() {
    setShowNotes(false);
    setIndex((value) => Math.max(value - 1, 0));
  }

  function toggleEngineStep(id: string) {
    setSelectedSteps((currentSteps) =>
      currentSteps.includes(id) ? currentSteps.filter((step) => step !== id) : [...currentSteps, id]
    );
  }

  return (
    <section className="presentation-deck">
      <div className="slide-frame">
        <div className="slide-progress-line" style={{ width: `${progress}%` }} />
        <div className="slide-meta">
          <span>Week 1</span>
          <span>{index + 1}/{slides.length}</span>
          <span>{current.minutes} นาที</span>
          <span>รวม {minutesLabel(totalMinutes)}</span>
        </div>

        <div className="slide-canvas">
          {current.id === "title" ? <TitleSlide /> : null}
          {current.id === "why" ? <WhySlide showNotes={showNotes} /> : null}
          {current.id === "question" ? <QuestionSlide stance={stance} setStance={setStance} /> : null}
          {current.id === "outcomes" ? <OutcomesSlide /> : null}
          {current.id === "splendor" ? <SplendorSlide /> : null}
          {current.id === "roles" ? <RolesSlide /> : null}
          {current.id === "checkpoint" ? <CheckpointSlide /> : null}
          {current.id === "strategy" ? <StrategySlide /> : null}
          {current.id === "sorter" ? (
            <SorterSlide sorts={sorts} setSorts={setSorts} correctCount={correctCount} />
          ) : null}
          {current.id === "decision" ? <DecisionSlide /> : null}
          {current.id === "canvas" ? <CanvasSlide canvas={canvas} setCanvas={setCanvas} /> : null}
          {current.id === "play" ? (
            <PlaySlide
              seconds={playSeconds}
              running={timerRunning}
              setRunning={setTimerRunning}
              reset={() => {
                setTimerRunning(false);
                setPlaySeconds(80 * 60);
              }}
            />
          ) : null}
          {current.id === "compound" ? <CompoundSlide /> : null}
          {current.id === "timeline" ? (
            <TimelineSlide selected={selectedSteps} toggle={toggleEngineStep} score={engineScore} />
          ) : null}
          {current.id === "debrief" ? <DebriefSlide /> : null}
          {current.id === "exit" ? <ExitSlide /> : null}
        </div>

        {showNotes ? <InstructorNotes slide={current.id} /> : null}
      </div>

      <div className="deck-controls">
        <button type="button" className="secondary" onClick={back} disabled={index === 0}>Back</button>
        <button type="button" className="secondary" onClick={() => setShowNotes((value) => !value)}>Notes</button>
        <button type="button" className="secondary" onClick={toggleFullscreen}>
          {isFullscreen ? "Exit full screen" : "Full screen"}
        </button>
        <span>{minutesLabel(elapsedMinutes)} / {minutesLabel(totalMinutes)}</span>
        <button type="button" onClick={next} disabled={index === slides.length - 1}>Next</button>
      </div>
    </section>
  );
}

function TitleSlide() {
  return (
    <div className="slide-layout title-slide">
      <p className="slide-eyebrow">SMA2106 · Week 1</p>
      <h1>บทนำสู่การคิดเชิงกลยุทธ์</h1>
      <p>เรียนผ่านการตัดสินใจจริงใน Splendor และเทียบกับการคิดล่วงหน้าใน Chess</p>
    </div>
  );
}

function WhySlide({ showNotes }: { showNotes: boolean }) {
  return (
    <div className="slide-layout split-slide">
      <div>
        <p className="slide-eyebrow">Bridge-in</p>
        <h2>บอร์ดเกมทำให้ “การคิด” มองเห็นได้</h2>
      </div>
      <div className="big-idea">
        <p>ทุกตาที่ผู้เล่นเลือก คือหลักฐานของการวางแผน การคาดการณ์ และการปรับตัว</p>
        {showNotes ? <small>ให้อาจารย์พูดสั้นๆ ว่า วันนี้ไม่ได้วัดว่าใครเล่นเก่ง แต่วัดว่าใครอธิบายการตัดสินใจได้</small> : null}
      </div>
    </div>
  );
}

function QuestionSlide({ stance, setStance }: { stance: string; setStance: (value: string) => void }) {
  const choices = ["เอาแต้มตอนนี้", "สร้างทางให้ตาถัดไป", "ขึ้นกับสถานการณ์"];
  const feedback = stance ? stanceFeedback[stance] : null;
  return (
    <div className="slide-layout question-slide">
      <p className="slide-eyebrow">Pre-assessment</p>
      <h2>ถ้าต้องเลือก คุณจะเลือกอะไร</h2>
      <div className="choice-row">
        {choices.map((choice) => (
          <button key={choice} type="button" className={stance === choice ? "active" : "secondary"} onClick={() => setStance(choice)}>
            {choice}
          </button>
        ))}
      </div>
      {feedback ? (
        <div className="choice-feedback">
          <strong>{feedback.label}</strong>
          <p>{feedback.text}</p>
        </div>
      ) : (
        <p className="slide-prompt">เลือกก่อนเรียน แล้วระบบจะสะท้อนให้เห็นว่าคำตอบนั้นเอนไปทางกลยุทธ์หรือยุทธวิธี</p>
      )}
    </div>
  );
}

function OutcomesSlide() {
  return (
    <div className="slide-layout">
      <p className="slide-eyebrow">Learning outcomes</p>
      <h2>จบคาบนี้ นักศึกษาต้องทำได้ 3 อย่าง</h2>
      <div className="three-columns">
        <div><strong>แยก</strong><span>กลยุทธ์ vs ยุทธวิธี</span></div>
        <div><strong>มอง</strong><span>ผู้เล่น ตัวเลือก สิ่งแวดล้อม เป้าหมาย</span></div>
        <div><strong>อธิบาย</strong><span>ความได้เปรียบสะสมใน Splendor</span></div>
      </div>
    </div>
  );
}

function SplendorSlide() {
  return (
    <div className="slide-layout video-slide-grid">
      <div>
        <p className="slide-eyebrow">Learn to play</p>
        <h2>สอนเล่น Splendor แบบพร้อมเริ่มโต๊ะจริง</h2>
        <div className="flow-row compact-flow">
          <div>เก็บ token</div>
          <div>ซื้อ/จองการ์ด</div>
          <div>สร้างส่วนลด</div>
          <div>ถึง 15 คะแนน</div>
        </div>
        <p className="slide-prompt">เปิดคลิปช่วงอธิบายกติกา แล้วหยุดเป็นช่วง ๆ เพื่อให้ผู้เรียนจับอุปกรณ์จริงตามทัน</p>
      </div>
      <div className="video-card">
        <div className="video-frame">
          <iframe
            src={splendorThaiVideo.embedUrl}
            title={splendorThaiVideo.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <a href={splendorThaiVideo.watchUrl} target="_blank" rel="noreferrer">
          เปิดบน YouTube ถ้าคลิปไม่โหลด
        </a>
      </div>
    </div>
  );
}

function RolesSlide() {
  return (
    <div className="slide-layout">
      <p className="slide-eyebrow">Classroom setup</p>
      <h2>หนึ่งโต๊ะต้องมี 3 บทบาท</h2>
      <div className="three-columns">
        <div><strong>Player</strong><span>ตัดสินใจและพูดเหตุผล</span></div>
        <div><strong>Observer</strong><span>จด key decision</span></div>
        <div><strong>Captain</strong><span>คุมเวลาและชวนทุกคนพูด</span></div>
      </div>
    </div>
  );
}

function CheckpointSlide() {
  return (
    <div className="slide-layout">
      <p className="slide-eyebrow">Guided first round</p>
      <h2>ก่อนเดิน ให้หยุดถาม 3 ข้อ</h2>
      <ol className="large-list">
        <li>ตานี้ฉันแก้ปัญหาอะไร</li>
        <li>ถ้าไม่เลือก action นี้ ฉันเสียโอกาสอะไร</li>
        <li>ตาถัดไปจะง่ายขึ้นหรือยากขึ้น</li>
      </ol>
    </div>
  );
}

function StrategySlide() {
  return (
    <div className="slide-layout compare-slide">
      <div>
        <p className="slide-eyebrow">Strategy</p>
        <h2>ทำให้หลายตาไปทางเดียวกัน</h2>
      </div>
      <div>
        <p className="slide-eyebrow">Tactics</p>
        <h2>แก้จังหวะตรงหน้าให้รอดหรือได้เปรียบ</h2>
      </div>
    </div>
  );
}

function SorterSlide({
  sorts,
  setSorts,
  correctCount
}: {
  sorts: SortState;
  setSorts: React.Dispatch<React.SetStateAction<SortState>>;
  correctCount: number;
}) {
  return (
    <div className="slide-layout">
      <p className="slide-eyebrow">Interactive</p>
      <h2>ข้อความนี้เป็น Strategy หรือ Tactics</h2>
      <div className="mini-card-grid">
        {sorterCards.map((card) => (
          <div className="mini-card" key={card.id}>
            <p>{card.text}</p>
            <div className="choice-row small">
              <button type="button" className={sorts[card.id] === "strategy" ? "active" : "secondary"} onClick={() => setSorts((current) => ({ ...current, [card.id]: "strategy" }))}>Strategy</button>
              <button type="button" className={sorts[card.id] === "tactics" ? "active" : "secondary"} onClick={() => setSorts((current) => ({ ...current, [card.id]: "tactics" }))}>Tactics</button>
            </div>
          </div>
        ))}
      </div>
      <p className="slide-prompt">ถูก {correctCount}/{sorterCards.length}</p>
    </div>
  );
}

function DecisionSlide() {
  return (
    <div className="slide-layout">
      <p className="slide-eyebrow">Decision structure</p>
      <h2>ก่อนวิเคราะห์ ต้องเห็น 4 ช่องนี้</h2>
      <div className="four-grid">
        <div>ผู้ตัดสินใจ</div>
        <div>ชุดตัวเลือก</div>
        <div>สภาพแวดล้อม</div>
        <div>วัตถุประสงค์</div>
      </div>
    </div>
  );
}

function CanvasSlide({
  canvas,
  setCanvas
}: {
  canvas: { actor: string; options: string; environment: string; goal: string };
  setCanvas: React.Dispatch<React.SetStateAction<{ actor: string; options: string; environment: string; goal: string }>>;
}) {
  return (
    <div className="slide-layout canvas-slide">
      <p className="slide-eyebrow">Interactive</p>
      <h2>กรอก decision จากโต๊ะของคุณ</h2>
      <div className="input-grid">
        <input value={canvas.actor} onChange={(event) => setCanvas({ ...canvas, actor: event.target.value })} placeholder="ใครตัดสินใจ" />
        <input value={canvas.options} onChange={(event) => setCanvas({ ...canvas, options: event.target.value })} placeholder="เลือกอะไรได้บ้าง" />
        <input value={canvas.environment} onChange={(event) => setCanvas({ ...canvas, environment: event.target.value })} placeholder="เห็นข้อมูลอะไร" />
        <input value={canvas.goal} onChange={(event) => setCanvas({ ...canvas, goal: event.target.value })} placeholder="ต้องการอะไร" />
      </div>
    </div>
  );
}

function PlaySlide({
  seconds,
  running,
  setRunning,
  reset
}: {
  seconds: number;
  running: boolean;
  setRunning: (value: boolean) => void;
  reset: () => void;
}) {
  return (
    <div className="slide-layout play-slide">
      <p className="slide-eyebrow">Play lab</p>
      <h2>เล่นจริง 80 นาที</h2>
      <strong>{clock(seconds)}</strong>
      <div className="choice-row">
        <button type="button" onClick={() => setRunning(!running)}>{running ? "Pause" : "Start"}</button>
        <button type="button" className="secondary" onClick={reset}>Reset</button>
      </div>
      <p className="slide-prompt">นาทีที่ 30 และ 60 หยุดถาม: “แผนเดิมยังดีอยู่ไหม”</p>
    </div>
  );
}

function CompoundSlide() {
  return (
    <div className="slide-layout">
      <p className="slide-eyebrow">Compound advantage</p>
      <h2>ข้อได้เปรียบเล็กๆ ที่ทบกัน คือหัวใจของ Splendor</h2>
      <div className="flow-row">
        <div>ลดต้นทุน</div>
        <div>มีทางเลือก</div>
        <div>ซื้อเร็วขึ้น</div>
        <div>คะแนนไหลมา</div>
      </div>
    </div>
  );
}

function TimelineSlide({ selected, toggle, score }: { selected: string[]; toggle: (id: string) => void; score: number }) {
  return (
    <div className="slide-layout">
      <p className="slide-eyebrow">Interactive</p>
      <h2>สร้าง engine timeline</h2>
      <div className="timeline-strip">
        {engineSteps.map((step) => (
          <button key={step.id} type="button" className={selected.includes(step.id) ? "active" : "secondary"} onClick={() => toggle(step.id)}>
            <strong>{step.label}</strong>
            <span>{step.detail}</span>
          </button>
        ))}
      </div>
      <p className="slide-prompt">Engine score +{score}</p>
    </div>
  );
}

function DebriefSlide() {
  return (
    <div className="slide-layout">
      <p className="slide-eyebrow">Debrief</p>
      <h2>เลือก decision หนึ่งครั้งจากเกมจริง</h2>
      <ol className="large-list">
        <li>ตอนนั้นคุณเห็นตัวเลือกอะไร</li>
        <li>คุณเลือกเพราะผลทันทีหรือผลสะสม</li>
        <li>ถ้าเล่นใหม่ จะเปลี่ยนอะไร</li>
      </ol>
    </div>
  );
}

function ExitSlide() {
  return (
    <div className="slide-layout title-slide">
      <p className="slide-eyebrow">Exit ticket</p>
      <h1>หนึ่ง decision ที่บอกวิธีคิดของคุณ</h1>
      <p>อธิบาย 3-5 ประโยคว่าเป็นกลยุทธ์หรือยุทธวิธี เพราะอะไร</p>
    </div>
  );
}

function InstructorNotes({ slide }: { slide: SlideId }) {
  const notes: Partial<Record<SlideId, string>> = {
    title: "เปิดด้วยน้ำเสียงว่าเกมคือเครื่องมือเรียน ไม่ใช่กิจกรรมพักเบรก",
    why: "เชื่อมกับบทที่ 1: บอร์ดเกมทำให้แนวคิดนามธรรมกลายเป็นรูปธรรมและสังเกตได้",
    question: "อย่าเฉลยเร็ว ให้เก็บคำตอบไว้เทียบหลังเล่น",
    play: "ถ้าเวลาบาน ให้จบเกมแบบไม่ต้องครบ 15 คะแนน แล้วใช้สถานะล่าสุด debrief"
  };

  return <aside className="speaker-notes">{notes[slide] || "ใช้สไลด์นี้เป็นคำสั่งกิจกรรม ไม่ต้องอ่านทุกข้อความให้ผู้เรียนฟัง"}</aside>;
}
