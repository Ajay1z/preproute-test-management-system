import { create } from "zustand";
import { testApi } from "../api/testApi";
import { CreateTestPayload, Test, UpdateTestPayload } from "../types/test";

interface TestState {
  tests: Test[];
  activeTest: Test | null;
  isLoading: boolean;
  error: string | null;
  fetchTests: () => Promise<void>;
  fetchTestById: (id: string) => Promise<Test>;
  createTest: (payload: CreateTestPayload) => Promise<Test>;
  updateTest: (id: string, payload: UpdateTestPayload) => Promise<Test>;
}

export const useTestStore = create<TestState>((set) => ({
  tests: [],
  activeTest: null,
  isLoading: false,
  error: null,

  fetchTests: async () => {
    set({ isLoading: true, error: null });
    try {
      const tests = await testApi.getTests();
      set({ tests, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch tests";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchTestById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const test = await testApi.getTestById(id);
      set({ activeTest: test, isLoading: false });
      return test;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch test";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  createTest: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const test = await testApi.createTest(payload);
      set((state) => ({ tests: [test, ...state.tests], activeTest: test, isLoading: false }));
      return test;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create test";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateTest: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const test = await testApi.updateTest(id, payload);
      set((state) => ({
        tests: state.tests.map((item) => (item.id === id ? test : item)),
        activeTest: test,
        isLoading: false
      }));
      return test;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update test";
      set({ error: message, isLoading: false });
      throw error;
    }
  }
}));
