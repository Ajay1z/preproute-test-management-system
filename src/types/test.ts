export type TestType = "mock" | "practice" | "sectional" | string;
export type Difficulty = "easy" | "medium" | "hard" | string;
export type TestStatus = "draft" | "live" | string;

export interface Test {
  id: string;
  name: string;
  type: TestType;
  subject: string;
  topics: string[];
  sub_topics: string[];
  difficulty: Difficulty;
  status: TestStatus;
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  total_marks: number;
  total_questions: number;
  total_time: number;
  questions: unknown;
  created_at: string;
  updated_at: string;
}

export interface CreateTestPayload {
  name: string;
  type: string;
  subject: string;
  topics: string[];
  sub_topics: string[];
  difficulty: string;
  status: string;
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  total_marks: number;
  total_questions: number;
  total_time: number;
}

export type UpdateTestPayload = Partial<CreateTestPayload>;
