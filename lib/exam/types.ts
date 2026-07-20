export type Difficulty = "easy" | "medium" | "hard";
export type CognitiveLevel = "understand" | "apply" | "analyze";

export type ExamQuestion = {
  id: string;
  slot: string;
  week: 1 | 2;
  topic: string;
  difficulty: Difficulty;
  cognitive: CognitiveLevel;
  prompt: string;
  choices: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  rationale: string;
  source: string;
};

export type AssembledQuestion = Omit<ExamQuestion, "choices" | "answer"> & {
  choices: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
};

export type ExamSession = {
  examId: string;
  studentId: string;
  studentName: string;
  sectionId: string;
  seed: string;
  startedAt: string;
  expiresAt: string;
};

export type ExamResultRow = Record<string, string> & {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  sectionId: string;
  formCode: string;
  answers: string;
  score: string;
  maxScore: string;
  startedAt: string;
  submittedAt: string;
  leaveCount: string;
  status: "submitted" | "disqualified";
  receipt: string;
};

export type ExamEventRow = Record<string, string> & {
  id: string;
  examId: string;
  studentId: string;
  event: "screen_hidden";
  eventCount: string;
  occurredAt: string;
  status: "warning" | "disqualified";
  detail: string;
};

export type ExamConfigRow = Record<string, string> & {
  id: string;
  examId: string;
  roomCodeHash: string;
  openAt: string;
  closeAt: string;
  status: "open" | "closed";
  updatedBy: string;
  updatedAt: string;
};
