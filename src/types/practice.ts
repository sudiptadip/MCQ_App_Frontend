// ── Practice Question with full options ─────────────────────────────────────
export interface PracticeOption {
  id: number;
  option_text: string;
  is_correct?: boolean | null;
}

export interface PracticeQuestion {
  id: number;
  question_text: string;
  difficulty_level?: string;
  category_name?: string;
  options: PracticeOption[];
}

// ── LocalStorage session ─────────────────────────────────────────────────────
export interface PracticeSession {
  testId: number;
  testName: string;
  totalQuestions: number;
  durationMinutes: number;
  attemptId: number | null;
  startedAt: string;           // ISO string
  answers: Record<number, number>; // questionId → selectedOptionId
  flagged: number[];           // questionIds flagged for review
  completed: boolean;
}

// ── Submit payload ───────────────────────────────────────────────────────────
export interface SubmitAnswerPayload {
  question_id: number;
  selected_option_id: number;
}

export interface SubmitAttemptPayload {
  attempt_id: number;
  answers: SubmitAnswerPayload[];
}

// ── Result returned from backend after submit ─────────────────────────────────
export interface AttemptResult {
  attempt_id: number;
  score: number;
  total_questions: number;
  correct_answers: number;
}
