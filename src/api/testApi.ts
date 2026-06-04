import apiClient from "./axios";
import { CreateTestPayload, Test, UpdateTestPayload } from "../types/test";

const unwrap = <T>(payload: unknown): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

const unwrapTestArray = (payload: unknown): Test[] => {
  if (Array.isArray(payload)) return payload as Test[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as Test[];
    if (Array.isArray(record.tests)) return record.tests as Test[];
    if (record.data && typeof record.data === "object") {
      return unwrapTestArray(record.data);
    }
  }
  return [];
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value];
  return [];
};

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeTest = (value: unknown): Test => {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    id: String(record.id || record._id || crypto.randomUUID()),
    name: String(record.name || "Untitled Test"),
    type: String(record.type || "mock"),
    subject: String(record.subject || "-"),
    topics: toStringArray(record.topics),
    sub_topics: toStringArray(record.sub_topics || record.subTopics),
    difficulty: String(record.difficulty || "easy"),
    status: String(record.status || "draft"),
    correct_marks: toNumber(record.correct_marks, 0),
    wrong_marks: toNumber(record.wrong_marks, 0),
    unattempt_marks: toNumber(record.unattempt_marks, 0),
    total_marks: toNumber(record.total_marks, 0),
    total_questions: toNumber(record.total_questions, 0),
    total_time: toNumber(record.total_time, 0),
    questions: record.questions ?? null,
    created_at: String(record.created_at || ""),
    updated_at: String(record.updated_at || "")
  };
};

export const testApi = {
  getTests: async (): Promise<Test[]> => {
    const response = await apiClient.get<unknown>("/tests");
    return unwrapTestArray(response.data).map(normalizeTest);
  },

  getTestById: async (id: string): Promise<Test> => {
    const response = await apiClient.get<unknown>(`/tests/${id}`);
    return normalizeTest(unwrap<unknown>(response.data));
  },

  createTest: async (payload: CreateTestPayload): Promise<Test> => {
    const response = await apiClient.post<unknown>("/tests", payload);
    return normalizeTest(unwrap<unknown>(response.data));
  },

  updateTest: async (id: string, payload: UpdateTestPayload): Promise<Test> => {
    const response = await apiClient.put<unknown>(`/tests/${id}`, payload);
    return normalizeTest(unwrap<unknown>(response.data));
  }
};
