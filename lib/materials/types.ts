export type TeachToPlayCard = {
  game: string;
  goal: string;
  turnLoop: string[];
  firstDecisions: string[];
  doNotWorryYet: string[];
  playNowPrompt: string;
  debriefPrompt: string;
};

export type LessonBlock = {
  title: string;
  body: string;
};

export type InteractiveActivity = {
  id: string;
  title: string;
  purpose: string;
  kind: "sorter" | "canvas" | "timeline" | "prompt" | "placeholder";
};

export type ExitTicket = {
  title: string;
  prompt: string;
  minWords?: number;
};

export type MaterialWeek = {
  week: number;
  title: string;
  englishTitle: string;
  chapterSource: string;
  games: string[];
  learningOutcomes: string[];
  concepts: string[];
  classFlow: string[];
  teachToPlay: TeachToPlayCard[];
  conceptBlocks: LessonBlock[];
  activities: InteractiveActivity[];
  worksheet: string;
  submissionTitle: string;
  submissionPrompt: string;
  exitTicket: ExitTicket;
  status: "complete" | "placeholder";
};
