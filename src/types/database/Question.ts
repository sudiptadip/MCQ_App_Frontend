export interface Question {
    id: number;
    question_text: string;
    category_id: number;
    difficulty_level?: string;
}