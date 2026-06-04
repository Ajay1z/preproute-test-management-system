export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string];
  correct_option: number;
  explanation: string;
  difficulty: string;
  topic: string;
  sub_topic: string;
  media_url: string;
}

export interface BulkQuestionPayload {
  test_id: string;
  testId?: string;
  questions: Omit<Question, "id">[];
}

export interface FetchBulkQuestionPayload {
  test_id: string;
  testId?: string;
}
