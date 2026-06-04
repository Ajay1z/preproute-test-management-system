import apiClient from "./axios";
import { BulkQuestionPayload, FetchBulkQuestionPayload, Question } from "../types/question";

const unwrapQuestions = (payload: unknown): Question[] => {
  if (Array.isArray(payload)) return payload as Question[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as Question[];
    if (Array.isArray(record.questions)) return record.questions as Question[];
    if (record.data && typeof record.data === "object") {
      const nested = record.data as Record<string, unknown>;
      if (Array.isArray(nested.questions)) return nested.questions as Question[];
    }
  }
  return [];
};

export const questionApi = {
  saveBulk: async (payload: BulkQuestionPayload): Promise<unknown> => {
    const response = await apiClient.post<unknown>("/questions/bulk", payload);
    return response.data;
  },

  fetchBulk: async (payload: FetchBulkQuestionPayload): Promise<Question[]> => {
    const response = await apiClient.post<unknown>("/questions/fetchBulk", payload);
    return unwrapQuestions(response.data);
  }
};
