import api from '../../../lib/axios';
import { API_ROUTES } from '../../../constants/apiRoute';
import type apiResponse from '../../../types/apiResponse';
import type { AttemptResult, SubmitAttemptPayload } from '../../../types/practice';
import { getTestById } from '../../test/api/test.api';
import { getQuestionAnsById } from '../../mcq/api/mcq.api';
import type { PracticeQuestion } from '../../../types/practice';

// ── Fetch full test with all questions + options ──────────────────────────────
// Step 1: getTestById → gets test metadata + question IDs (no options)
// Step 2: fetch each question with options in parallel via getQuestionAnsById
export const fetchTestWithQuestions = async (
  testId: number,
): Promise<{ testName: string; durationMinutes: number; totalQuestions: number; minAttempt: number; questions: PracticeQuestion[] }> => {
  const testData = await getTestById(testId);
  const questionIds = Array.isArray(testData.question_ids)
    ? (testData.question_ids as number[])
    : [];

  // Fetch all questions with options in parallel
  const questionDetails = await Promise.all(
    questionIds.map((id) => getQuestionAnsById(id)),
  );

  const questions: PracticeQuestion[] = questionDetails.map((q) => ({
    id: q.id ?? q.question?.id ?? 0,
    question_text: q.question_text ?? q.question?.question_text ?? '',
    difficulty_level: q.difficulty_level ?? q.question?.difficulty_level,
    category_name: q.category_name ?? q.question?.category_name,
    options: (q.options ?? []).map((o) => ({
      id: o.id,
      option_text: o.option_text,
      is_correct: o.is_correct,
    })),
  }));

  return {
    testName: testData.test.name,
    durationMinutes: testData.test.duration_minutes,
    totalQuestions: testData.test.total_questions,
    minAttempt: Number(testData.test.min_no_of_question_attempt ?? 0),
    questions,
  };
};

// ── Create an attempt record on the backend ───────────────────────────────────
// Backend SP: SpAttempt/1
// Payload:    { test_id }
// Returns:    { id, student_id, test_id, score, started_at }
export const startAttempt = async (
  test_id: number,
): Promise<apiResponse<{ id: number }>> => {
  const response = await api.post(API_ROUTES.START_ATTEMPT, { test_id });
  return response.data;
};

// ── Submit all answers at once ────────────────────────────────────────────────
// Backend SP: SpAttempt/2
// Payload:    { attempt_id, answers: [{ question_id, selected_option_id }] }
// Returns:    { attempt_id, score, total_questions, correct_answers }
export const submitAttempt = async (
  payload: SubmitAttemptPayload,
): Promise<apiResponse<AttemptResult>> => {
  const response = await api.post(API_ROUTES.SUBMIT_ATTEMPT, payload);
  return response.data;
};
