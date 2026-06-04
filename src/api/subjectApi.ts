import apiClient from "./axios";
import { Subject } from "../types/subject";
import { SubTopic } from "../types/subtopic";
import { Topic } from "../types/topic";

const extractArray = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const objectPayload = payload as Record<string, unknown>;
    if (Array.isArray(objectPayload.data)) return objectPayload.data as T[];
    if (Array.isArray(objectPayload.subjects)) return objectPayload.subjects as T[];
    if (Array.isArray(objectPayload.topics)) return objectPayload.topics as T[];
    if (Array.isArray(objectPayload.sub_topics)) return objectPayload.sub_topics as T[];
    if (Array.isArray(objectPayload.subTopics)) return objectPayload.subTopics as T[];
    if (objectPayload.data && typeof objectPayload.data === "object") {
      return extractArray<T>(objectPayload.data);
    }
  }
  return [];
};

export const subjectApi = {
  getSubjects: async (): Promise<Subject[]> => {
    const response = await apiClient.get<unknown>("/subjects");
    return extractArray<Subject>(response.data);
  },

  getTopicsBySubject: async (subjectId: string): Promise<Topic[]> => {
    const response = await apiClient.get<unknown>(`/topics/subject/${subjectId}`);
    return extractArray<Topic>(response.data);
  },

  getSubTopicsByTopic: async (topicId: string): Promise<SubTopic[]> => {
    const response = await apiClient.get<unknown>(`/sub-topics/topic/${topicId}`);
    return extractArray<SubTopic>(response.data);
  },

  getSubTopicsByTopics: async (topicIds: string[]): Promise<SubTopic[]> => {
    const response = await apiClient.post<unknown>("/sub-topics/multi-topics", {
      topicIds,
      topic_ids: topicIds,
      topics: topicIds
    });
    return extractArray<SubTopic>(response.data);
  }
};
